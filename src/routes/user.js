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
const path = require("path")

authRoute.post("/signup", async (req, res) => {
  const userMail = await userModel.findOne({ email: req.body.email });
  if (userMail) {
    return res.send({ message: "user already registered" });
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
    const dir = path.join(__dirname, ".." ,"utiles", "successEmail.html")
    const source = fs.readFileSync(dir, "utf-8") ;
    const template = handlebars.compile(source) ;
    const htmlToSend = template({name :req.body.name})
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: req.body.email,
      subject: `Welcome to Masai Placement Portal`,
      html: htmlToSend
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: "Error sending email" });
      }
      return res.status(200).send({ message: "Password reset email sent" });
    });
    return res
      .status(201)
      .send({ message: "successfully registered", userModel: success._doc });
  });
});

authRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const validUser = await userModel.findOne({ email });

  if (!validUser) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  const isMatch = await bcrypt.compare(password, validUser.password);

  if (!isMatch) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  const token = jwt.sign(
    {
      name: validUser.name,
    },
    process.env.JWT_KEY
  );

  return res.status(201).send({ validUser, token });
});

authRoute.post("/resetpassword", async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .send({ message: "No user found with this email address" });
  }

  // Generate a password reset token and expiry time
  const resetToken = jwt.sign({ userId: user._id }, "Secret", {
    expiresIn: "5m",
  });

  // Set up the email transporter
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
    html: `<p>You have requested to reset your password. Please click on the link below to reset your password:</p>
           <p><a href="http://localhost:3000/resetpassword/${user._id}/${resetToken}">Reset Password</a></p>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).send({ message: "Error sending email" });
    }
    return res.status(200).send({ message: "Password reset email sent" });
  });
});

module.exports = authRoute;
