const express = require("express");
const eligibilityModel = require("../models/eligibility");
const eligRoute = express.Router();
const positionData = require("../models/positionModel");

/**
 * @swagger
 * components:
 *      schema :
 *        eligibility :
 *                   type : object
 *                   properties :
 *                      degrees :
 *                             type :  [string]
 *                      streams :
 *                             type :  string
 *                      graduationsYear :
 *                             type :  number
 *                      locationDomiciles :
 *                             type :  [string]
 *                      tenthPer :
 *                              type :  number
 *                      twelfthPer :
 *                            type :  number
 *                      gender :
 *                             type :  string
 *                             enum :
 *                                - Male
 *                                - Female
 *                                - Other
 */

/**
 * @swagger
 * /eligibility:
 *   get:
 *     summary: Get a list of all eligibility
 *     description: Returns a list of all eligibility
 *     responses:
 *       200:
 *         description: A list of eligibility
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
eligRoute.get("/eligibility", async (req, res) => {
  const data = await eligibilityModel.find();
  res.status(200).send({ message: "list of Eligibility", data });
});
/**
 * @swagger
 * /eligibility/{id}:
 *   post:
 *     summary: post eligibility to particular position
 *     description: post eligibility to particular position
 *     parameters :
 *            - name : id
 *              in : path
 *              description  : id of position - to create eligibility of that particular position
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
 *                          $ref : "#/components/schema/eligibility"
 *     responses:
 *       200:
 *         description: post eligibilty details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
eligRoute.post("/eligibility/:id", async (req, res) => {
  try {
    const {
      degrees,
      streams,
      graduationsYear,
      locationDomiciles,
      tenthPer,
      twelfthPer,
      gender,
    } = req.body;
    const { id } = req.params;
    if (
      !degrees ||
      !streams ||
      !graduationsYear ||
      !locationDomiciles ||
      !tenthPer ||
      !twelfthPer ||
      !gender
    ) {
      res.status(401).send({ message: "fill all the details" });
    }

    const position = await positionData.findById(id);
    if (!position) {
      return res.status(401).send({ message: "Position not found" });
    }
    const newEligibility = new eligibilityModel(req.body);
    const saveEligibility = await newEligibility.save();

    position.eligibilityId.push(saveEligibility);
    const savePositions = await position.save();
    return res.status(200).send({ message: "Eligibility save!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = eligRoute;
