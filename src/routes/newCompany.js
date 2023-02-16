const dotenv = require("dotenv");
dotenv.config();

const Router = require("express");

const companyRoute = Router();
const companyData = require("../models/newCompanyModel");

// getCompanyDetails details//

companyRoute.get("/getCompany", async (req, res) => {
  const getCompanyData = await companyData.find({});
  return res.send(getCompanyData);
});

// CreateNewCompany details //
companyRoute.post("/createCompany", async (req, res) => {
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

  new companyData(req.body).save((err, success) => {
    if (err) {
      return res.status(500).send({ message: "data not save in database" });
    }
    return res.status(201).send({ message: "New company added successfully " });
  });
});

// upadte company details //
companyRoute.patch("/patchCompany/:id", async (req, res) => {
  const { id } = req.params;

  await companyData
    .updateMany({ _id: id }, req.body)
    .then(() => {
      res.status(201).send({ message: "Details successfully edit" });
    })
    .catch((e) => {
      res.status(404).send({ message: "unsuccessful data edition" });
    });
});

// delte company details //
companyRoute.post("/deleteCompany/:id", async (req, res) => {
  const { id } = req.params;

  const deleteCompany = await companyData.findByIdAndDelete({ _id: id });
  if (!deleteCompany) {
    return res.status(404).send({ message: "delete unsuccessful" });
  } else {
    return res.status(201).send({ message: "data delete successful" });
  }
});

module.exports = companyRoute;
