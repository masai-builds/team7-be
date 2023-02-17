const mongoose = require ("mongoose")
mongoose.set('strictQuery', true);

const userSchema = mongoose.Schema({
    name:{type:String,required:true},
    email: {type:String,required:true},
    password:{type:String,required:true},
    rePassword:{type:String,required:true},
    role:{type:String,enum:["Admin", "Student"], required:true},
    captcha:{type:String,required:true},
})

const userModel = mongoose.model('user', userSchema)

module.exports= userModel