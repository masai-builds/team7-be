const express = require("express");
const positionRoute = express.Router();
const positionEligibilityModel = require("../models/positionModel");
const studentAuth = require("../middleware/studentAuth");
const companyData = require("../models/newCompanyModel");
const logger = require("./logger");
const jwt = require("jsonwebtoken");
const {
  client,
  postionCacheData,
  particularPositionCache,
} = require("../../redis");
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
 *                             type :  string
 *                      bond :
 *                             type : string
 *                      additionalCriteria :
 *                             type : string
 *                      degrees :
 *                             type :  [string]
 *                      streams :
 *                             type :  [string]
 *                      graduationsYear :
 *                             type :  number
 *                      locationDomiciles :
 *                             type :  [string]
 *                      tenthPer :
 *                             type :  number
 *                      gender :
 *                             type :  string
 *                             enum :
 *                              - Male
 *                              - Female
 *                              - Other
 *
 *
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
positionRoute.get("/position", async (req, res) => {
  try {
    console.log("getting position")
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      logger.error("No token provided");
      return res.status(401).send({ message: "Unauthorized" });
    }

    const verification = jwt.verify(token, process.env.JWT_KEY);
    if (!verification) {
      logger.error("Not verified");
      return res.status(403).send({ message: "Forbidden" });
    }

    const positionEligibilityData = await positionEligibilityModel.find({});
    if (!positionEligibilityData || positionEligibilityData.length <= 0) {
      return res.status(404).send({ message: "Data not available" });
    }

    // client.setEx("positionData", 60, JSON.stringify(positionEligibilityData));
    logger.info("Position data set to Redis");

    return res.status(200).send({
      message: "List of positions with eligibility",
      positionEligibilityData,
    });
  } catch (error) {
    logger.error("Error while getting position data", { error: error });
    return res.status(500).send({ message: "Internal server error" });
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
positionRoute.get(
  "/position/:id",

  async (req, res) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        logger.error("No token provided");
        return res.status(401).send({ message: "Unauthorized" });
      }
      const verification = jwt.verify(token, process.env.JWT_KEY);

      if (!verification) {
        logger.error("Not verified");
        return res.status(403).send({ message: "Forbidden" });
      }
      let { id } = req.params;
      const ParticularPositionEligible = await positionEligibilityModel.findOne(
        { _id: id }
      );
      if (ParticularPositionEligible.length <= 0) {
        return res
          .status(401)
          .send({ message: " data not available or check id" });
      }

      return res.status(200).send({
        message: " data of this position and eligibility",
        ParticularPositionEligible,
      });
    } catch (error) {
      logger.error("position get error", { error: error });

      return res
        .status(500)
        .send({ message: "Internal Server Error data not getting" });
    }
  }
);
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
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      logger.error("No token provided");
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { role, name } = jwt.verify(token, process.env.JWT_KEY);
    if (role !== "Admin") {
      logger.error("Not authorized");
      return res.status(403).send({ message: "Not authorized" });
    }
    const { id } = req.params;
    const {
      title,
      category,
      applicationProcess,
      openings,
      openingsPOC,
      minSalary,
      maxSalary,
      locations,
      rounds,
      workingMode,
      relocation,
      bond,
      additionalCriteria,
      degrees,
      streams,
      graduationsYear,
      locationDomiciles,
      tenthPer,
      twelvePer,
      gender,
    } = req.body;
    if (
      !title ||
      !category ||
      !applicationProcess ||
      !openings ||
      !openingsPOC ||
      !minSalary ||
      !maxSalary ||
      !locations ||
      !rounds ||
      !workingMode ||
      !relocation ||
      !bond ||
      !degrees ||
      !streams ||
      !graduationsYear ||
      !locationDomiciles ||
      !tenthPer ||
      !twelvePer ||
      !gender
    ) {
      return res.status(401).send({ message: "fill all the details" });
    }
    if (
      typeof openings !== "number" ||
      !Array.isArray(locations) ||
      locations.some((location) => typeof location !== "string")
    ) {
      return res.status(400).send({ message: "Invalid input data types" });
    }
    const company = await companyData.findOne({ _id: id });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const position = new positionEligibilityModel({
      ...req.body,
      companyName: company.companyName,
      companyId: id,
      poc: name,
    });

    const savedPosition = await position.save();

    const positionEligibilityData = await positionEligibilityModel.find({});

    if (positionEligibilityData.length <= 0) {
      return res.status(404).send({ message: "data not available" });
    }
    // client.setEx("positionData", 60, JSON.stringify(positionEligibilityData));
    logger.info("position data set to redis");
    return res
      .status(201)
      .send({ message: "Position save successfully", id: position._id });
  } catch (error) {
    logger.error("post position error", { error: error });
    return res.status(500).send({ message: "Internal Server Error", error });
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
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      logger.error("No token provided");
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { role } = jwt.verify(token, process.env.JWT_KEY);
    if (role !== "Admin") {
      logger.error("Not authorized");
      return res.status(403).send({ message: "Forbidden" });
    }

    let { id } = req.params;
    const updateData = req.body;
    const Data = await positionEligibilityModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    // set data to redis //
    const positionEligibilityData = await positionEligibilityModel.find({});

    if (positionEligibilityData.length <= 0) {
      return res.status(404).send({ message: "data not available" });
    }
    // client.setEx("positionData", 60, JSON.stringify(positionEligibilityData));
    logger.info("position data set to redis");
    return res.status(200).send({ message: "position updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(401).send({ message: "position updated unsuccessfully" });
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
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      logger.error("No token provided");
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { role } = jwt.verify(token, process.env.JWT_KEY);
    if (role !== "Admin") {
      logger.error("Not authorized");
      return res.status(403).send({ message: "Not authorized" });
    }
    let { id } = req.params;
    const Data = await positionEligibilityModel.findByIdAndDelete({ _id: id });

    res.status(200).send({ message: "position deleted successfully" });

    // redis set updated data //

    const positionEligibilityData = await positionEligibilityModel.find({});

    if (positionEligibilityData.length <= 0) {
      return res.status(404).send({ message: "data not available" });
    }
    // client.setEx("positionData", 60, JSON.stringify(positionEligibilityData));
    logger.info("position data set to redis");
  } catch (error) {
    logger.error("delete position error", { error });
    return res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = positionRoute;
