const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const eligibilitySchema = mongoose.Schema({
  degrees: { type: [String], required: true },
  streams: { type: String, required: true },
  graduationsYear: { type: Number, required: true },
  locationDomiciles: { type: [String], required: true },
  tenthPer: { type: Number, required: true },
  twelfthPer: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
});

const eligibilityModel = mongoose.model("eligibility", eligibilitySchema);

module.exports = eligibilityModel;
