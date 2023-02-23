// const mongoose = require("mongoose");

// const EligibilitySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   experience: {
//     type: Number,
//     required: true,
//   },
//   qualification: {
//     type: String,
//     required: true,
//   },
// });

// const PositionSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   eligibility: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Eligibility",
//   },
// });

// const CompanySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   address: {
//     type: String,
//     required: true,
//   },
//   positions: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Position",
//     },
//   ],
// });

// const Eligibility = mongoose.model("Eligibility", EligibilitySchema);
// const Position = mongoose.model("Position", PositionSchema);
// const Company = mongoose.model("Company", CompanySchema);

// Example Routes:

// const express = require("express");
// const router = express.Router();
// const Company = require("../models/company");

// Get all companies with their positions and eligibility
router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find().populate({
      path: "positions",
      populate: {
        path: "eligibility",
        model: "Eligibility",
      },
    });
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get a company with its positions and eligibility
// router.get("/companies/:id", async (req, res) => {
//   try {
//     const company = await Company.findById(req.params.id).populate({
//       path: "positions",
//       populate: {
//         path: "eligibility",
//         model: "Eligibility",
//       },
//     });
//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }
//     res.json(company);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// Create a company
// router.post("/companies", async (req, res) => {
//   try {
//     const company = new Company({
//       name: req.body.name,
//       address: req.body.address,
//     });
//     const savedCompany = await company.save();
//     res.json(savedCompany);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// Create a position for a company
// router.post("/companies/:id/positions", async (req, res) => {
//   try {
//     const company = await Company.findById(req.params.id);
//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }
//     const position = new Position({
//       name: req.body.name,
//       description: req.body.description,
//       eligibility: req.body.eligibility,
//     });
//     const savedPosition = await position.save();
//     company.positions.push(savedPosition);
//     const savedCompany = await company.save();
//     res.json(savedCompany);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });
