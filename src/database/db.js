require('dotenv').config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const db = process.env.DATABASE; 


const connection = mongoose.connect(db)
  .then(() => console.log("Database successfully connect"))
  .catch((e) => console.log(e));



module.exports = connection;
