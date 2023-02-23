const mongoose = require("mongoose");

const newCompanySchema = mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  websiteUrl: {
    type: String,
    required: true,
  },
  companySegment: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  whyApply: {
    type: String,
    required: true,
  },
  linkdinUrl: {
    type: String,
    required: false,
  },
  glassdoorUrl: {
    type: String,
    required: false,
  },
  ambitionBox: {
    type: String,
    required: false,
  },
  leadSource: {
    type: String,
    required: true,
  },
  companyLogo: {
    type: String
     
  }
});

const companyModel = mongoose.model("company", newCompanySchema);

module.exports = companyModel;
