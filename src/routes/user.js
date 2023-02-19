const dotenv = require("dotenv");
dotenv.config();
const Router = require("express");
const authRoute = Router();
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel.js");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

/**
 * @swagger
 * auth/signup:
 *   post:
 *     summary: user sign up post data
 *     description: user create account 
 *     responses:
 *       200:
 *         description: after successful create account 
 *       401:
 *          description: data not appropriate 
 *       501 : 
 *            description: Internet server problem
 * 
 */

// signup //
authRoute.post("/signup", async (req, res) => {
  const userMail = await userModel.findOne({ email: req.body.email });
  const { email, password, rePassword } = req.body;
 
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

  if (userMail) {
    return res.send({ message: "user already registered" });
  }
   if (password !== rePassword) {
    return res.status(400) .send({ message: "Please make sure your passwords match." });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).send({
      message:
        "Password must contain at least 8 characters, including at least 1 number, 1 lowercase letter, and 1 uppercase letter.",
    });
  }

  if (!emailReg.test(email)) {
    return res
      .status(400)
      .send({ message: "Please provide a valid email address." });
  }

  if(!validUser.emailConfirmed){
    return res.status(403).send({ message: "Please confirm your account before logging in" });
  }

  const salt = await bcrypt.genSaltSync(10);
  const Pass = await bcrypt.hash(req.body.password, salt);
  const rePass = await bcrypt.hash(req.body.rePassword, salt);
 
  const user = new userModel({
    ...req.body,
    password: Pass,
    rePassword: rePass,
  });

  user.save((err, success) => {
    if (err) {
      return res.status(500).send({ message: "error occured" });
    }
    const directory = path.join(__dirname, "..", "utiles", "signupEmail.html");
    const fileRead = fs.readFileSync(directory, "utf-8");
    const template = handlebars.compile(fileRead);
    const htmlToSend = template({ name: req.body.name });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Signup Successfully",
      html: htmlToSend,
    };
         
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: "Error sending email" });
      }
      return res
        .status(200)
        .send({ message: " successfully signup with email" });
    });
    return res.status(201).send({ message: "successfully registered" });
  });
});

// login //
/**
 * @swagger
 * 
 * auth/login:
 *   post:
 *     summary: user login with register email password
 *     description: user Login  
 *     responses:
 *       200:
 *         description: after successful login
 *       401:
 *          description: check user email password 
 *       501 : 
 *            description: Internet server problem
 * 
 */

authRoute.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const validUser = await userModel.findOne({ email });

  if (!email || !password) {
   return res.status(422).send({ message: "fill all the details" })
  }

  if (!validUser) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  if (!validUser.emailConfirmed) {
    return res.status(401).send({ message: "Please confirm your email before logging in" });
  }

  const isMatch = await bcrypt.compare(password, validUser.password);

  if (!isMatch) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  // authorize based on user role
  const authorizedRoles = ["Admin", "Student"]; 
    if (authorizedRoles.length && !authorizedRoles.includes(validUser.role)) {
       
        return res.status(401).json({ message: 'Unauthorized' });
    }

  const token = jwt.sign({
      name: validUser.name,
    },process.env.JWT_KEY);

  // cookiegenerate
  res.cookie("usercookie", token, {
    expires: new Date(Date.now() + 9000000),
    httpOnly: true,
  });

  res.status(201).send({ message: "Login successful"});
    // authentication and authorization successful
    // next();
});

// forgetPassword

// forgetPassword //
/**
 * @swagger
 * auth/forgetpassword:
 *   post:
 *     summary: user can reset or change password
 *     description: user forget password
 *     responses:
 *       200:
 *         description: after successful change password
 *       401:
 *          description: check user validation 
 *       501 : 
 *            description: Internet server problem
 *  
 */

authRoute.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .send({ message: "No user found with this email address" });
  }

  // Generate a password reset token and expiry time
  const resetToken = jwt.sign({ userId: user._id }, "Secret", {
    expiresIn: "15m",
  });

// Set up the email transporter
  const directory = path.join(__dirname, "..", "utiles", "resetPassword.html");
  const fileRead = fs.readFileSync(directory, "utf-8");
  const template = handlebars.compile(fileRead);
  const htmlToSend = template({ name: user.name, userId : user._id });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  // Compose the email
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Password Reset Request",
    html: htmlToSend,
  };

  // Send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).send({ message: "Error sending email" });
    }
    return res.status(200).send({ message: "Password reset email sent" });
  });
});

//reset password

authRoute.patch("/resetPassword/:id", async (req, res) => {
  const { id } = req.params;
  const { password, rePassword } = req.body;

  const oldUser = await userModel.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  try {
    const salt = await bcrypt.genSaltSync(10);
    const Pass = await bcrypt.hash(password, salt);
    const rePass = await bcrypt.hash(rePassword, salt);

    const setNewPass = await userModel.findByIdAndUpdate(
      { _id: id },
      { $set: { password: Pass, rePassword: rePass } }
    );
    setNewPass.save();
    res.status(201).send({ message: "Password updated successfully",setNewPass });
  } catch (error) {
    res.json({ status: "Something Went Wrong" });
  }
});


authRoute.post("/company", async (req, res) => {
  const user = await userModel.findOne({ role });
  if (user.role === "Admin") {
  return res.status(201).send({ message: "You have permission to perform this action." });

  
  }
  });
  
  authRoute.post("/position", async (req, res) => {
  const user = await userModel.findOne({ role });
  if (user.role === "Admin") {
  return res.status(201).send({ message: "You have permission to perform this action." });
  }
  });


module.exports = authRoute;
