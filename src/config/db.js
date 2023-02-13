const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const connection = mongoose.connect("mongodb://localhost:27017/authe")
module.exports = connection