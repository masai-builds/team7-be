const dotenv = require("dotenv");
dotenv.config();
const Router = require("express");
const companyRoute = Router();
const companyData = require("../models/newCompanyModel");
const authAdmin = require("../middleware/adminAuth");
const studentAuth = require("../middleware/studentAuth") ;
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
 *                      companyLogo :
 *                              type : string
 *                              format : binary
 *
 */

// getCompanyDetails details//
/**
 * @swagger
 * /getCompany:
 *   get:
 *     summary: Get a list of all users
 *     description: Returns a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *       401:
 *          description: data not appropriate
 *       501 :
 *            description: Internet server problem
 *
 */

companyRoute.get("/getCompany",studentAuth,async (req, res) => {
  const getCompanyData = await companyData.find({});
  return res.send(getCompanyData);
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

companyRoute.get("/singleCompany",authAdmin, async(req, res) => {
  const { companyName } = req.query;

  const properNameFormat = properName(companyName);
  const queryObj = {};
  if (properNameFormat) {
    queryObj.companyName = { $regex: properNameFormat, $options: "i" };
  }

  await companyData.find(queryObj).exec((err, items) => {
    if (err) {
      return res.status(500).send({ meassge: "searching error", err });
    }
    if (items.length <= 0) {
      return res
        .status(401)
        .send({ message: "no comapny available or once check company name" });
    }
    return res.status(201).send(items);
  });

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
companyRoute.get("/getParticularCompany/:id" ,async (req, res) => {
  const {id} = req.params ;
  
  const getParticularCompany = await companyData.findById({_id : id});
  return res.send(getParticularCompany);
});

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
 *             multipart/form-data:
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
companyRoute.post("/createCompany",authAdmin,async (req, res) => {
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
      return res.status(404).send({ message: "Please fill required data" });
    }
    if (!validUrl(websiteUrl)) {
      return res
        .status(401)
        .send({ meassge: "please enter valid company url" });
    }

    const toTitleCase = properName(companyName);

    new companyData({ ...req.body, companyName: toTitleCase }).save(
      (err, success) => {
        if (err) {
          return res.status(401).send({ message: "data not save in database" });
        }
        return res
          .status(201)
          .send({ message: "New company added successfully" });
      }
    );
  }
);

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
companyRoute.patch("/editCompany/:id",authAdmin, async (req, res) => {
  const { id } = req.params;
  const { companyName, websiteUrl } = req.body;
  const properNameFormat = properName(companyName);
  if (!validUrl(websiteUrl)) {
    return res.status(401).send({ meassge: "please enter valid company url" });
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

companyRoute.delete("/deleteCompany/:id",authAdmin, async (req, res) => {
  const { id } = req.params;

  await companyData
    .findByIdAndDelete({ _id: id })
    .then(() => {
      return res.status(201).send({ message: "data delete successful" });
    })
    .catch((e) => {
      return res.status(404).send({
        message: "delete unsuccessful or might be data already delete",
      });
    });
});

module.exports = companyRoute;
