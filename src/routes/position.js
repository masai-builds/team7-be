const express = require("express");
const positionRoute = express.Router();
const posModel= require("../models/positionModel")

positionRoute.get("/",async(req,res)=>{
    const posData= await posModel.find()
    res.status(200).send({message:"list of positions", posData})
})

positionRoute.get('/:_id', async(req,res)=>{
   let {_id} = req.params
   const posData = await posModel.findById(_id)
   res.status(200).send({message:" data of this position",posData})
})

positionRoute.post("/newPosition",async(req,res)=>{
    const { id,title,category,applicationProcess,openings,minSalary,maxSalary,
        locations,rounds,workingMode,relocation,bond,additionalCriteria
     } = req.body;

    if (!id || !title || !category || !applicationProcess || !openings || !minSalary || !maxSalary || !locations || !rounds || !workingMode || !maxSalary || !relocation || !bond || !additionalCriteria ) {
        res.status(401).send({ message: "fill all the details" })
    }

    if (typeof openings !== "number" || !Array.isArray(locations) || locations.some(location => typeof location !== "string")) {
        res.status(400).send({ message: "Invalid input data types" });
    }

    const existingPosition = await posModel.findOne({ id });
    if (existingPosition) {
    res.status(409).send({ message: "Position with this ID already exists" });
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
    const posData = await posModel.findByIdAndUpdate(_id, updateData, {new: true,});
    res.status(200).send({message: "position updated successfully" ,posData})
})

positionRoute.delete("/deletePosition/:_id",async(req,res)=>{
    let {_id} = req.params
    const posData= await posModel.findByIdAndDelete(_id)
    res.status(200).send({message: "position deleted successfully", posData})
})



module.exports = positionRoute;