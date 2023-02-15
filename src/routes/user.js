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

// signup //

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
    return res
      .status(400)
      .send({
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
    const directory = path.join(__dirname, "..", "utiles", "successEmail.html");
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
      return res.status(200).send({ message: " successfully signup with email" });
    });
    return res
      .status(201)
      .send({ message: "successfully registered", userModel: success._doc });
  });
});

// login //

authRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const validUser = await userModel.findOne({ email, password });
  console.log(validUser) ;
  if (!validUser) {
    return res.status(401).send({ message: "Invalid Credentials" });
  } else if (validUser.length < 1) {
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


// forgetPassword //

authRoute.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  console.log(user.name)
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
  const directory = path.join(__dirname, "..", "utiles", "resetPass.html");
  const fileRead = fs.readFileSync(directory, "utf-8");
  const template = handlebars.compile(fileRead);
  const htmlToSend = template({ name: user.name });

  
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
    html: htmlToSend
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
