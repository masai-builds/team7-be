const express = require("express");
const positionRoute = express.Router();
const posModel= require("../models/positionModel")

positionRoute.get("/",async(req,res)=>{
    const Data= await posModel.find()
    res.status(200).send({message:"list of positions", Data})
})

positionRoute.get('/:_id', async(req,res)=>{
   let {_id} = req.params
   const Data = await posModel.findById(_id)
   res.status(200).send({message:" data of this position", Data})
})

positionRoute.post("/newPosition",async(req,res)=>{
    const {title,category,applicationProcess,openings,minSalary,maxSalary,
        locations,rounds,workingMode,relocation,bond,additionalCriteria
     } = req.body;

    if ( !title || !category || !applicationProcess || !openings || !minSalary || !maxSalary || !locations || !rounds || !workingMode || !maxSalary || !relocation || !bond || !additionalCriteria ) {
        res.status(401).send({ message: "fill all the details" })
    }

    if (typeof openings !== "number" || !Array.isArray(locations) || locations.some(location => typeof location !== "string")) {
        res.status(400).send({ message: "Invalid input data types" });
    }

    if (!req.user.isAdmin) {
        res.status(401).send({ message: "Unauthorized access" });
    }

    let request= req.body
    const Data= await posModel.create(request)
    res.status(201).send({message:"new position added successfully",Data})
})

positionRoute.patch("/updatePosition/:_id",async(req,res)=>{
    let {_id} = req.params
    const updateData = req.body;
    const Data = await posModel.findByIdAndUpdate(_id, updateData, {new: true,});
    res.status(200).send({message: "position updated successfully" ,Data})
})

positionRoute.delete("/deletePosition/:_id",async(req,res)=>{
    let {_id} = req.params
    const Data= await posModel.findByIdAndDelete(_id)
    res.status(200).send({message: "position deleted successfully", Data})
})



module.exports = positionRoute;
