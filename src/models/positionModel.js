const mongoose = require ("mongoose")

const now = new Date() ;
const options = {timeZone : "Asia/Kolkata"}  ;
const dateTimeString = now.toLocaleString("en-IN", options) ;




const positionEligibilitySchema = mongoose.Schema({
   
    companyName : { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    applicationProcess: {type: String, enum: ["online", "offline"], required: true },
    openings: { type: Number, required: true },
    openingsPOC: { type: Number, required: true },
    minSalary: { type: Number, required: true ,min: 0,},
    maxSalary: { type: Number, required: true },
    locations: { type: [String], required: true },
    rounds: { type: [String], required: true },
    workingMode: { type: String, required: true },
    relocation: { type: String, required: true },
    bond: { type: String, required: false },
    additionalCriteria: { type: String, required: false },
    companyId : { type: String, required: true },
    degrees:{type:[String], required:true},
    streams: { type: [String], required: true },
    graduationsYear: { type: Number, required: true },
    locationDomiciles: { type: [String], required: true },
    tenthPer: { type: Number, required: true },
    twelvePer: { type: Number, required: true },
    graduationPer : {type : Number, required : false},
    poc : { type: String, required: false },
    gender:{type: String, enum: ["Male", "Female","Other"], required: true },
    timeStap : {type : String, default : dateTimeString}
    
})

const positionEligibilityModel = mongoose.model('positionEligibility', positionEligibilitySchema)

module.exports= positionEligibilityModel ;