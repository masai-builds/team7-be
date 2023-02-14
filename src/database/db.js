const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const connection = mongoose.connect("mongodb+srv://masai-portal:masai-portal@cluster0.syawzk7.mongodb.net/masai-portal?retryWrites=true&w=majority").then(() => console.log("Database successfully connect")).catch((e) => console.log(e))
module.exports = connection


