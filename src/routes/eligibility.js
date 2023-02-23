const express = require("express");
const eligibilityModel= require("../models/eligibility")
const eligRoute= express.Router();
const positionData = require("../models/positionModel");
eligRoute.get("/",async(req,res)=>{
    const data=await eligModel.find()
    res.status(200).send({message:"list of positions", data})
})

eligRoute.post("/eligibility/:id",async(req,res)=>{
    try {
        const {id} = req.params ;
        const position = await positionData.findById(id)
        if(!position){
            return res.status(401).send({message: "Position not found"})
        }
        const newEligibility = new eligibilityModel(req.body)
        const saveEligibility = await newEligibility.save() ;

        position.eligibilityId.push(saveEligibility) ;
        const savePositions = await position.save() ;
        return res.status(200).send({message : "Eligibility save!",savePositions })
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
 
    
})

module.exports = eligRoute ;



