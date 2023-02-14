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

authRoute.post("/signup",async(req,res)=>{
    const userMail= await userModel.findOne({ email: req.body.email})
    const {email,password,rePassword} = req.body
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/

  if(userMail){
    return res.send({ message:"user already registered"})
  }

  else if (password !== rePassword) {
    return res.status(400).send({ message: 'Please make sure your passwords match.' })
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).send({ message: 'Password must contain at least 8 characters, including at least 1 number, 1 lowercase letter, and 1 uppercase letter.' })
  }

  if (!emailReg.test(email)) {
    return res.status(400).send({ message: 'Please provide a valid email address.'})
  }

authRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const validUser = await userModel.findOne({ email });

  if (!validUser) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  const isMatch = await bcrypt.compare(password, validUser.password);

authRoute.post("/login", async(req,res)=>{
    const {email,password}=req.body
    const validUser= await userModel.findOne({email,password})
    
    if(!validUser){
        return res.status(401).send({message:"Invalid Credentials"})
    }
    else if(validUser.length < 1){
      return res.status(401).send({message:"Invalid Credentials"})
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

module.exports = authRoute ;
