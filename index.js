const express = require("express");
const connection = require("./src/database/db");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoute = require("./src/routes/user");
const positionRoute= require("./src/routes/position");
const companyRoute = require("./src/routes/newCompany")
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const swaggerUi = require('swagger-ui-express') ;
const swaggerSpec = require("./swagger") ;
const busboyBodyParser = require('busboy-body-parser');
dotenv.config({ path: "./src/config/.env" });


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(busboyBodyParser());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(cookieParser());
app.use("/auth", authRoute);
app.use("/position", positionRoute)
app.use("/", companyRoute) ;


app.get("/", (req, res) => {
  res.send({ message: "welcome to our website" });
});

app.listen(process.env.PORT, async () => {
  await connection;
  
  console.log(`listening on port ${process.env.PORT}`);
});
