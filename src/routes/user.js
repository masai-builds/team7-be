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



// signup


authRoute.post("/signup", async (req, res) => {
  const userMail = await userModel.findOne({ email: req.body.email });
  const { email, password, rePassword } = req.body;
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

  if (userMail) {
    return res.send({ message: "user already registered" });
  } else if (password !== rePassword) {
    return res
      .status(400)
      .send({ message: "Please make sure your passwords match." });
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

// login

authRoute.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const validUser = await userModel.findOne({ email });

  if (!email || !password) {
    res.status(422).send({ message: "fill all the details" });
  }

  if (!validUser) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  const isMatch = await bcrypt.compare(password, validUser.password);

  if (!isMatch) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  // authorize based on user role
  const authorizedRoles = ["Admin", "Student"];
  if (authorizedRoles.length && !authorizedRoles.includes(validUser.role)) {
    // user's role is not authorized
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = jwt.sign(
    {
      name: validUser.name,
    },
    process.env.JWT_KEY
  );

  // cookiegenerate
  res.cookie("usercookie", token, {
    expires: new Date(Date.now() + 9000000),
    httpOnly: true,
  });

  // authentication and authorization successful
  next();
  return res.status(201).send({ validUser, token });
});

// forgetPassword

authRoute.post("/forgetPassword", async (req, res) => {
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

  const directory = path.join(__dirname, "..", "utiles", "resetPassowrd.html");
  const fileRead = fs.readFileSync(directory, "utf-8");
  const template = handlebars.compile(fileRead);
  const htmlToSend = template({ name: user.name, userId: user._id });

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
    res.status(201).send({ message: "Password updated successfully" });
  } catch (error) {
    res.json({ status: "Something Went Wrong" });
  }
});

module.exports = authRoute;
