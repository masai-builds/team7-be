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
const logger = require("./logger");
const { v4: uuidv4 } = require("uuid");

/**
 * @swagger
 * components:
 *      schema :
 *         signup :
 *                   type : object
 *                   properties :
 *                      name :
 *                             type :  string
 *                      email :
 *                             type :  string
 *                      password :
 *                             type :  string
 *                      rePassword :
 *                              type :  string
 *                      role :
 *                              type :  string
 *
 *
 *         login :
 *                  type : object
 *                  properties :
 *                      email :
 *                             type : string
 *                      password :
 *                             type : string
 *
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: user sign up post data
 *     description: user create account
 *     requestBody :
 *             required : true
 *             content :
 *                  application/json :
 *                           schema :
 *                              $ref : "#/components/schema/signup"
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
  try {
    const userMail = await userModel.findOne({ email: req.body.email });
    const { email, password, rePassword } = req.body;
    const uuid = uuidv4();
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    if (userMail) {
      return res.send({ message: "user already registered" });
    }

    if (password !== rePassword) {
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
      uuid,
    });

    user.save(async (err, success) => {
      if (err) {
        return res.status(500).send({ message: "error occured" });
      }

      const directory = path.join(__dirname, "..", "utils", "signupEmail.html");
      const fileRead = fs.readFileSync(directory, "utf-8");
      const template = handlebars.compile(fileRead);
      const htmlToSend = template({ name: req.body.name, userId: uuid });

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

      try {
        await transporter.sendMail(mailOptions);
        logger.info("User signed up successfully", {
          userId: success._id,
          email: success.email,
          name: success.name,
        });
        return res.status(201).send({ message: "successfully registered" });
      } catch (err) {
        logger.error("Error sending confirmation email", { error: err });
        return res.status(500).send({ message: "Error sending email" });
      }
    });
  } catch (error) {
    logger.error("Error occurred during signup", { error: error });
    return res.status(500).send({ message: "Error occurred" });
  }
});

/**
 * @swagger
 * /auth/emailConform/{uuid}:
 *   patch:
 *     summary: Email verification
 *     description: Email verification
 *     parameters :
 *            - name : uuid
 *              in : path
 *              description  : user id to email verifictaion
 *              required: true
 *              minimum : 1
 *              schema :
 *               type: string
 *     responses:
 *       200:
 *         description: Delete company details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */

authRoute.patch("/emailConfirm/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findOneAndUpdate(
      { uuid: id },
      { $set: { emailConfirmed: true } }
    );
    user.save();
    return res.status(201).send({ message: "Email verification successs" });
  } catch (error) {
    return res.status(401).send({ meassge: "Email not verified" });
  }
});

// login //
/**
 * @swagger
 *
 * /auth/login:
 *   post:
 *     summary: user login with register email password
 *     description: user Login
 *     requestBody :
 *          required : true
 *          content :
 *             application/json :
 *                 schema :
 *                     $ref : "#/components/schema/login"
 *     responses:
 *       200:
 *         description: after successful login
 *       401:
 *          description: check user email password
 *       501 :
 *            description: Internet server problem
 *
 */

authRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const validUser = await userModel.findOne({ email });

    if (!email || !password) {
      return res.status(422).send({ message: "fill all the details" });
    }

    if (!validUser) {
      logger.error("User failed to login", { email: email });
      return res.status(401).send({ message: "Invalid Credentials" });
    }

    if (!validUser.emailConfirmed) {
      return res
        .status(401)
        .send({ message: "Please confirm your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, validUser.password);

    if (!isMatch) {
      return res.status(401).send({ message: "Invalid Credentials" });
    }

    // authorize based on user role
    const token = jwt.sign(
      {
        name: validUser.name,
        role: validUser.role,
        id : validUser._id
      },
      process.env.JWT_KEY
    );
    
    // cookiegenerate
    res.cookie("usercookieAuth", token, {
      expires: new Date(Date.now() + 9000000),
      httpOnly: true,
    });
    logger.info("User logged in successfully", { userId: validUser._id });
    res.status(201).send({ message: "Login successful", token , userDetails: {
      name: validUser.name,
      role: validUser.role,
      id : validUser._id
    } });
  } catch (error) {
    logger.error("Error occurred during login", { error: error });
    res.status(500).send({ message: "Something went wrong" });
  }
});

// forgetPassword //
/**
 * @swagger
 * /auth/forgetPassword:
 *   post:
 *     summary: user can reset or change password
 *     description: user forget password
 *     requestBody :
 *           required : true
 *           content :
 *               application/json :
 *                  schema :
 *                   type : object
 *                   properties :
 *                     email :
 *                        type : string
 *     responses:
 *       201:
 *         description: after successful change password
 *       401:
 *          description: check user validation
 *       501 :
 *            description: Internet server problem
 *
 */

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
  const directory = path.join(__dirname, "..", "utils", "resetPassword.html");
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
/**
 * @swagger
 * /auth/resetPassword/{id}:
 *   patch:
 *     summary: reset Password
 *     description: reset Password
 *     parameters :
 *            - name : id
 *              in : path
 *              description  : reset Password
 *              required: true
 *              minimum : 1
 *              schema :
 *               type: string
 *
 *     requestBody :
 *            required : true
 *            content :
 *               application/json:
 *                      schema:
 *                        type : object
 *                        properties :
 *                            password :
 *                              type : string
 *                            rePassword :
 *                              type : string
 *     responses:
 *       200:
 *         description: Delete company details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
authRoute.patch("/resetPassword/:id", async (req, res) => {
  const { id } = req.params;
  const { password, rePassword } = req.body;

  const oldUser = await userModel.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  if (password !== rePassword) {
    return res.status(401).send({ meassge: "Password not same " });
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

//change password
authRoute.patch("/changePassword/:id", async (req, res) => {
  const { id } = req.params;
  const { password, rePassword } = req.body;

  const oldUser = await userModel.findOne({ _id: id });
  console.log(oldUser);

  if (password !== rePassword) {
    return res.status(401).send({ meassge: "Password not same " });
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
