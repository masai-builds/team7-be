const Router = require("express")
const authRoute = Router()
const userModel= require("../models/userModel")

authRoute.post("/signup",async(req,res)=>{
    const userMail= await userModel.findOne({ email: req.body.email})
    if(userMail){
        return res.send({ message:"user already registered"})
    }

    const user= new userModel(req.body)
    user.save((err,success)=>{
        if(err){
            return res.status(500).send({message:"error occured"})
        }
        return res.status(201).send({message:"successfully registered",userModel:success._doc})
    })
})

authRoute.post("/login",async(req,res)=>{
    const {email,password}=req.body
    const validUser= await userModel.findOne({email,password})
    if(validUser.length < 1){
        return res.status(401).send({message:"Invalid Credentials"})
    }
    return res.send(validUser)
})

module.exports = authRoute