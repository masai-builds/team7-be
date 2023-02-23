const express = require("express");
const eligModel= require("../models/eligibility")
const eligRoute= express.Router();

eligRoute.get("/",async(req,res)=>{
    const data=await eligModel.find()
    res.status(200).send({message:"list of positions", data})
})

eligRoute.post("/",async(req,res)=>{
const {degrees,streams,graduationsYear,locationDomiciles,tenthPer,twelfthPer,gender} = req.body;

    if ( !degrees || !streams || !graduationsYear || !locationDomiciles || !tenthPer || !twelfthPer || !gender ) {
        res.status(401).send({ message: "fill all the details" })
    }
    const rqst= req.body
    const data= await eligModel.create(rqst)
    res.status(200).send({message:"data added succesfully", data})
})

module.exports = eligRoute