const mongoose = require ("mongoose")
const { v4: uuidv4 } = require("uuid");

const positionSchema = mongoose.Schema({
    
    uuid: { type: String, default: uuidv4 },
    title: { type: String, required: true },
    category: { type: String, required: true },
    applicationProcess: {type: String, enum: ["online", "offline"], required: true },
    openings: { type: Number, required: true },
    minSalary: { type: Number, required: true ,min: 0,},
    maxSalary: { type: Number, required: true },
    locations: { type: [String], required: true },
    rounds: { type: [String], required: true },
    workingMode: { type: [String], required: true },
    relocation: { type: [String], required: true },
    bond: { type: String, required: false },
    additionalCriteria: { type: String, required: false }

})

const positionModel = mongoose.model('position', positionSchema)

module.exports= positionModel