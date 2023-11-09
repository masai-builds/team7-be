const express = require("express");
const connection = require("./src/database/db");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoute = require("./src/routes/user");
const positionRoute = require("./src/routes/position");
const companyRoute = require("./src/routes/newCompany");
const eligibilityRoute = require("./src/routes/eligibility");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { swaggerUi, swaggerSpec } = require("./swagger");
const busboyBodyParser = require("busboy-body-parser");
const logger = require("./src/routes/logger");
dotenv.config({ path: "./src/config/.env" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(busboyBodyParser());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cookieParser());
app.use("/auth", authRoute);
app.use("/", positionRoute);
app.use("/", companyRoute);
app.use("/", eligibilityRoute);

app.get("/", (req, res) => {
  res.status(200).send({ message: "welcome to our website" });
});

app.listen(process.env.PORT, async () => {
  await connection;
  logger.log("info", `listening on port ${process.env.PORT}`);
  console.log(`server start at ${process.env.PORT}`);
});

module.exports = app;