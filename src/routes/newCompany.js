const dotenv = require("dotenv");
dotenv.config();
const Router = require("express");
const companyRoute = Router();
const companyData = require("../models/newCompanyModel");
const positionEligibilityModel = require("../models/positionModel");
const authAdmin = require("../middleware/adminAuth");
const studentAuth = require("../middleware/studentAuth");
const jwt = require("jsonwebtoken");

const logger = require("./logger");
const {
  client,
  companyCacheData,
  particularCompanyCache,
} = require("../../redis");
// check valid url function //

function validUrl(url) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // check protocol
      "((([a-zA-Z\\d]([a-zA-Z\\d-]{0,61}[a-zA-Z\\d])?)\\.)+[a-zA-Z]{2,6}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + //IP address
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + //port and path
      "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-zA-Z\\d_]*)?$",
    "i" //frangment locator //
  );

  return urlPattern.test(url);
}
// proper name format //
function properName(companyName) {
  return companyName.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

//swaggerSchema //
/**
 * @swagger
 * components:
 *      schema :
 *        newCompany :
 *                   type : object
 *                   properties :
 *                      companyName :
 *                             type :  string
 *                      websiteUrl :
 *                             type :  string
 *                      companySegment :
 *                             type :  string
 *                      industry :
 *                              type :  string
 *                      description :
 *                              type :  string
 *                      whyApply :
 *                            type :  string
 *                      linkdinUrl :
 *                             type :  string
 *                      glassdoorUrl :
 *                              type :  string
 *                      ambitionBox :
 *                              type :  string
 *                      leadSource :
 *                             type :  string
 *
 *
 *
 */

// getCompanyDetails details//
/**
 * @swagger
 *
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 *
 * /getCompany:
 *   get:
 *     summary: Get a list of all company
 *     description: Returns a list of all company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Access token obtained from authentication service
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A list of company
 *       401:
 *          description: Unauthorized
 *       501:
 *          description: Internet server problem
 */

companyRoute.get("/getCompany", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log(req.headers.authorization);

    if (!token) {
      logger.error("No token provided");
      return res.status(401).send({ message: "Unauthorized" });
    }
    const verification = jwt.verify(token, process.env.JWT_KEY);

    if (!verification) {
      logger.error("Not verified");
      return res.status(403).send({ message: "Forbidden" });
    }

    logger.info("Fetching data from database.......");
    const companyDataResult = await companyData.find({});
    if (companyDataResult.length == 0) {
      return res.status(404).send({ message: "No data found" });
    }

    // client.setEx("companyData", 60, JSON.stringify(companyDataResult));
    logger.info("Set repo getCompany value in Redis");

    return res.status(201).send({
      message: "Company data from database",
      companyDataResult,
    });
  } catch (error) {
    logger.error("Error getting company data", error);
    return res.status(500).send({ message: "Internal server error" });
  } finally {
    // client.quit();
  }
});

/**
 * @swagger
 * /singleCompany:
 *   get:
 *     summary: Get a single company with respect to query
 *     description: Get a single company with respect to query
 *     parameters :
 *          - in: query
 *            name: companyName
 *            schema:
 *                type: string
 *     responses:
 *       200:
 *         description: Successfully get a single company with respect to query
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */

companyRoute.get("/singleCompany", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      logger.error("No token provided");
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { role } = jwt.verify(token, process.env.JWT_KEY);
    if (role !== "Admin") {
      logger.error("Not authorized");
      return res.status(403).send({ message: "Access denied" });
    }

    const { companyName } = req.query;
    const properNameFormat = properName(companyName);
    const queryObj = {};
    if (properNameFormat) {
      queryObj.companyName = { $regex: properNameFormat, $options: "i" };
    }

    await companyData.find(queryObj).exec((err, items) => {
      if (err) {
        return res.status(500).send({ message: "Error searching", err });
      }
      if (items.length === 0) {
        return res.status(404).send({
          message: "No matching company found or check company name",
        });
      }
      return res.status(200).send(items);
    });
  } catch (error) {
    logger.error("Error verifying token", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// get particular company by id //
/**
 * @swagger
 * /getParticularCompany/{id}:
 *   get:
 *     summary: get single company details
 *     description: get single company details
 *     parameters :
 *            - name : id
 *              in : path
 *              description  : company id to get
 *              required: true
 *              minimum : 1
 *              schema :
 *               type: string
 *
 *
 *     responses:
 *       200:
 *         description:  company details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
companyRoute.get(
  "/getParticularCompany/:id",

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
      const { id } = req.params;

      const getParticularCompany = await companyData.findById({ _id: id });
      if (getParticularCompany.length == 0) {
        return res.status(401).send({ message: "check id or data not found" });
      }
      // client.setEx("singleCompany", 5, JSON.stringify(getParticularCompany));
      // logger.log("info", "Set repo getParticularCompany value in Redis");

      return res
        .status(201)
        .send({ message: "company Data from database", getParticularCompany });
    } catch (err) {
      logger.error("error comes while get particular company", { error: err });
      return res
        .status(401)
        .send({ message: "error while get company or check company id" });
    } finally {
      // client.quit();
    }
  }
);

// CreateNewCompany details //
/**
 * @swagger
 * /createCompany:
 *   post:
 *     summary: Post new company details
 *     description: Post new company details
 *     requestBody :
 *        required : true
 *        content :
 *
 *             application/json:
 *                  schema:
 *                      $ref : "#/components/schema/newCompany"
 *
 *     responses:
 *       200:
 *         description: create company successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
companyRoute.post("/createCompany", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      logger.error("No token provided");
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { role } = jwt.verify(token, process.env.JWT_KEY);
    if (role !== "Admin") {
      logger.error("Not authorized");
      return res.status(403).send({ message: "Not authorized" });
    }

    const {
      companyName,
      websiteUrl,
      companySegment,
      industry,
      description,
      whyApply,
      linkdinUrl,
      glassdoorUrl,
      ambitionBox,
      leadSource,
    } = req.body;

    if (
      !companyName ||
      !websiteUrl ||
      !companySegment ||
      !industry ||
      !description ||
      !whyApply ||
      !leadSource
    ) {
      return res.status(400).send({ message: "Please fill required data" });
    }
    if (!validUrl(websiteUrl)) {
      return res
        .status(400)
        .send({ message: "Please enter a valid company URL" });
    }

    const toTitleCase = properName(companyName);
    const isCompany = await companyData.find({ companyName: toTitleCase });

    if (isCompany.length > 0) {
      return res.status(201).send({ message: "Already company available" });
    }
    const company = new companyData({
      ...req.body,
      companyName: toTitleCase,
    });

    await company.save();
    // client.del("companyData", (err, reply) => {
    //   if (err) {
    //     logger.error("Failed to delete company data key in Redis", {
    //       error: err,
    //     });
    //   } else {
    //     logger.info("Successfully deleted company key in Redis");
    //   }
    // });
    logger.info({
      message: "Delete company and related positions also send to redis",
    });

    return res.status(201).send({ message: "New company added successfully" });
  } catch (error) {
    logger.error("createCompany error", { error: error });
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

// upadte company details //
/**
 * @swagger
 * /editCompany/{id}:
 *   patch:
 *     summary: Edit company details
 *     description: Edit company details
 *     parameters :
 *            - name : id
 *              in : path
 *              description  : user id to update
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
 *                          $ref : "#/components/schema/newCompany"
 *     responses:
 *       200:
 *         description: Delete company details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */
companyRoute.patch("/editCompany/:id", async (req, res) => {
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
    const { id } = req.params;
    const { companyName, websiteUrl } = req.body;

    let properNameFormat;
    if (companyName) {
      properNameFormat = properName(companyName);
    }
    if (websiteUrl) {
      if (!validUrl(websiteUrl)) {
        return res
          .status(401)
          .send({ meassge: "please enter valid company url" });
      }
    }

    await companyData
      .updateMany({ _id: id }, { ...req.body, companyName: properNameFormat })
      .then(() => {
        res.status(201).send({ message: "Details successfully edit" });
      })
      .catch((e) => {
        res
          .status(404)
          .send({ message: "unsuccessful data edition check details" });
      });
    // client.del("companyData", (err, reply) => {
    //   if (err) {
    //     logger.error("Failed to delete company key in Redis", { error: err });
    //   } else {
    //     logger.info("Successfully deleted positionData key in Redis");
    //   }
    // });
    logger.info({
      message: "Delete company and related positions also send to redis",
    });
  } catch (error) {
    logger.error("edit company error", { error: error });
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

// delte company details //
/**
 * @swagger
 * /deleteCompany/{id}:
 *   delete:
 *     summary: Delete company details
 *     description: Delete company details
 *     parameters :
 *            - name : id
 *              in: path
 *              description  : Id of user to delete
 *              required : true
 *              schema :
 *                type : string
 *     responses:
 *       200:
 *         description: Delete company details successfully
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */

companyRoute.delete("/deleteCompany/:id", async (req, res) => {
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
    const { id } = req.params;

    const deleteCompany = await companyData.findByIdAndDelete({ _id: id });
    res.status(201).send({ message: "data delete successful" });

    // set new data to redis //
    const companyDataResult = await companyData.find({});
    if (companyDataResult.length == 0) {
      res.status(404).send({ messge: "no data found" });
    }
    // client.setEx("companyData", 60, JSON.stringify(companyDataResult));

    const positionEligibilityData = await positionEligibilityModel.deleteMany({
      companyId: id,
    });
    if (positionEligibilityData.deletedCount <= 0) {
      logger.info("No related positions found");
    }
    // client.del("positionData", (err, reply) => {
    //   if (err) {
    //     logger.error("Failed to delete positionData key in Redis", {
    //       error: err,
    //     });
    //   } else {
    //     logger.info("Successfully deleted positionData key in Redis");
    //   }
    // });
    logger.info({
      message: "Delete company and related positions also send to redis",
    });
  } catch (error) {
    logger.error("delete company error", { error: error });
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = companyRoute;
