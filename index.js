const express = require("express");
const connection = require("./src/database/db");
const app = express();
const cors = require("cors");
const authRoute = require("./src/routes/user");
// const positionRoute= require("./src/routes/position");
const dotenv = require("dotenv");
const cookiParser = require("cookie-parser")
dotenv.config({ path: "./src/config/.env" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookiParser());

app.use("/auth", authRoute);
// app.use("/position", positionRoute)

app.get("/", (req, res) => {
  res.send({ message: "welcome to our website" });
});

app.listen(process.env.PORT, async () => {
  await connection;
  console.log(`listening on port ${process.env.PORT}`);
});
