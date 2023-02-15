const express = require("express");
const connection = require("./src/database/db");
const app = express();
const cors = require("cors");
const authRoute = require("./src/routes/user");
const companyRoute = require("./src/routes/newCompany")
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/auth", authRoute);
app.use("/newCompany", companyRoute) ;

app.get("/", (req, res) => {
  res.send({ message: "welcome to our website" });
});

app.listen(process.env.PORT, async () => {
  await connection;
  console.log(`listening on port ${process.env.PORT}`);
});
