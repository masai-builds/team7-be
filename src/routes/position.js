const express = require("express");
const positionRoute = express.Router();
const posModel = require("../models/positionModel");
const studentAuth = require("../middleware/studentAuth");
const companyData = require("../models/newCompanyModel");
const {client, postionCacheData, particularPositionCache}  = require("../../redis") ;
/**
 * @swagger
 * components:
 *      schema :
 *        position :
 *                   type : object
 *                   properties :
 *                      title :
 *                             type :  string
 *                      category :
 *                             type :  string
 *                      applicationProcess :
 *                             type :  string
 *                      openings :
 *                              type :  number
 *                      openingsPOC :
 *                              type :  number
 *                      minSalary :
 *                            type :  number
 *                      maxSalary :
 *                             type :  number
 *                      locations :
 *                             type :  [string]
 *                      rounds :
 *                             type :  [string]
 *                      workingMode:
 *                             type :  string
 *                      relocation:
 *                             type :  [string]
 *                      bond :
 *                             type : string
 *                      additionalCriteria :
 *                             type : string
 */

/**
 * @swagger
 * /position:
 *   get:
 *     summary: Get a list of position
 *     description: Returns a list of position
 *     responses:
 *       200:
 *         description: A list of position
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
positionRoute.get("/position",postionCacheData, async (req, res) => {
  try {
    const positionData = await posModel.find();
    if(positionData.length <= 0){
      return res.status(401).send({message : "no data available"})
    }
  
    client.setEx("postionData", 60, JSON.stringify(positionData))
    console.log("position data set in redis") ;
    return res.status(201).send({message : "position Data from database", positionData });
    
  } catch (error) {
    console.log(error)
    next(error)
  } finally{
    client.quit() ;
  }
 
  
});
/**
 * @swagger
 * /position/{id}:
 *   get:
 *     summary: get single position details
 *     description: get single position details
 *     parameters :
 *            - name : id
 *              in : path
 *              description  : position id to get
 *              required: true
 *              minimum : 1
 *              schema :
 *               type: string
 *
 *
 *     responses:
 *       200:
 *         description:  position details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
positionRoute.get("/position/:id",particularPositionCache, async (req, res) => {
  try {
    let { id } = req.params;
  const particularPositionData = await posModel.findOne({ _id: id }).populate({
    path: "eligibilityId",
  });
  if(particularPositionData <= 0){
     return res.status(401).send({message : "data not available or check id"})
  }
  client.setEx("particularPosition", 60, JSON.stringify(particularPositionData))
  console.log("position data set in redis") ;
  res.status(200).send({ message: " data of this position", particularPositionData });
    
  } catch (error) {
    console.log(error) ;
    next(error)
  } finally{
     client.quit()
  }
});
/**
 * @swagger
 * /positions/{id}:
 *   post:
 *     summary: post company position details
 *     description: post company position details
 *     parameters :
 *            - name : id
 *              in : path
 *              description  : company user id -  to create position of that company
 *              required: true
 *              minimum : 1
 *              schema :
 *               type: string
 *
 *     requestBody :
 *            required : true
 *            content :
 *               application/json:
 *                      schema:
 *                          $ref : "#/components/schema/position"
 *     responses:
 *       200:
 *         description: post positions details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
positionRoute.post("/positions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      applicationProcess,
      openings,
      minSalary,
      maxSalary,
      locations,
      rounds,
      workingMode,
      relocation,
      bond,
      additionalCriteria,
    } = req.body;
    if (
      !title ||
      !category ||
      !applicationProcess ||
      !openings ||
      !minSalary ||
      !maxSalary ||
      !locations ||
      !rounds ||
      !workingMode ||
      !maxSalary ||
      !relocation ||
      !bond ||
      !additionalCriteria
    ) {
      res.status(401).send({ message: "fill all the details" });
    }
    if (
      typeof openings !== "number" ||
      !Array.isArray(locations) ||
      locations.some((location) => typeof location !== "string")
    ) {
      res.status(400).send({ message: "Invalid input data types" });
    }
    const company = await companyData.findOne({ _id: id });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const position = new posModel({
      ...req.body,
      companyName: company.companyName,
      companyId: id,
    });
    const savedPosition = await position.save();

    // const savedCompany = await company.save();
    return res.status(201).send({ message: "Position save successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @swagger
 * /updatePosition/{id}:
 *   patch:
 *     summary: post company position details
 *     description: post company position details
 *     parameters :
 *            - name : id
 *              in : path
 *              description  : postion id to edit position
 *              required: true
 *              minimum : 1
 *              schema :
 *               type: string
 *
 *     requestBody :
 *            required : true
 *            content :
 *               application/json:
 *                      schema:
 *                          $ref : "#/components/schema/position"
 *     responses:
 *       200:
 *         description: post positions details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
positionRoute.patch("/updatePosition/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const updateData = req.body;
    const Data = await posModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).send({ message: "position updated successfully" });
  } catch (error) {
    console.log(e);
    res.status(401).send({ message: "position updated unsuccessfully" });
  }
});

/**
 * @swagger
 * /deletePosition/{id}:
 *   delete:
 *     summary: Delete position details
 *     description: Delete position details
 *     parameters :
 *            - name : id
 *              in: path
 *              description  : Id of position to delete
 *              required : true
 *              schema :
 *                type : string
 *     responses:
 *       200:
 *         description: Delete position details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */

positionRoute.delete("/deletePosition/:id", async (req, res) => {
  let { id } = req.params;
  const Data = await posModel.findByIdAndDelete({ _id: id });
  res.status(200).send({ message: "position deleted successfully", Data });
});

module.exports = positionRoute;
