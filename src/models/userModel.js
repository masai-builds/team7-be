const mongoose = require ("mongoose")

const userSchema = mongoose.Schema({
    name:String,
    email: String,
    password:String,
    rePassword:String,
    role:{type:String,enum:["admin", "student"]},
    captcha:String,
})

const userModel = mongoose.model('user', userSchema)

module.exports= userModel