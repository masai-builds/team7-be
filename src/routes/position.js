const express = require("express");
const positionRoute = express.Router();
const posModel= require("../models/positionModel") ;
const studentAuth = require("../middleware/studentAuth") ;
const companyData = require("../models/newCompanyModel") ;

positionRoute.get("/position",async(req,res)=>{
    const Data= await posModel.find()
    res.status(200).send({message:"list of positions", Data})
})

positionRoute.get('/:id', async(req,res)=>{
   let {id} = req.params
   const Data = await posModel.findById(id)
   res.status(200).send({message:" data of this position", Data})
})


positionRoute.post("/positions/:id", async (req, res) => {
    try {
      const company = await companyData.findById(req.params.id);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const position = new posModel(req.body)
      const savedPosition = await position.save();
      console.log(savedPosition)
      company.positionId.push(savedPosition);
      const savedCompany = await company.save();
      return res.json(savedCompany);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  });

// positionRoute.post("/newPosition/",async(req,res)=>{
//     const {title,category,applicationProcess,openings,minSalary,maxSalary,
//         locations,rounds,workingMode,relocation,bond,additionalCriteria
//      } = req.body;

//     if ( !title || !category || !applicationProcess || !openings || !minSalary || !maxSalary || !locations || !rounds || !workingMode || !maxSalary || !relocation || !bond || !additionalCriteria ) {
//         res.status(401).send({ message: "fill all the details" })
//     }

//     if (typeof openings !== "number" || !Array.isArray(locations) || locations.some(location => typeof location !== "string")) {
//         res.status(400).send({ message: "Invalid input data types" });
//     }

//     let request= req.body
//     const Data= await posModel.create(request)
//     res.status(201).send({message:"new position added successfully",Data})
// })

positionRoute.patch("/updatePosition/:id",async(req,res)=>{
    let {id} = req.params
    const updateData = req.body;
    const Data = await posModel.findByIdAndUpdate(id, updateData, {new: true,});
    res.status(200).send({message: "position updated successfully" ,Data})
})

positionRoute.delete("/deletePosition/:id",async(req,res)=>{
    let {id} = req.params
    const Data= await posModel.findByIdAndDelete({_id : id})
    res.status(200).send({message: "position deleted successfully", Data})
})



module.exports = positionRoute;
