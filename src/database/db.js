const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
require('dotenv').config({ path: ".env" });

const url=process.env.MONGODB_URL
const connection = mongoose.connect(url)
.then(() => console.log("Database successfully connect"))
.catch((e) => console.log(e))


module.exports = connection