const mongoose = require ("mongoose")


const positionSchema = mongoose.Schema({
   
    title: { type: String, required: true },
    category: { type: String, required: true },
    applicationProcess: {type: String, enum: ["online", "offline"], required: true },
    openings: { type: Number, required: true },
    openingsPOC: { type: Number, required: true },
    minSalary: { type: Number, required: true ,min: 0,},
    maxSalary: { type: Number, required: true },
    locations: { type: [String], required: true },
    rounds: { type: [String], required: true },
    workingMode: { type: [String], required: true },
    relocation: { type: [String], required: true },
    bond: { type: String, required: false },
<<<<<<< HEAD
    additionalCriteria: { type: String, required: false }
=======
    additionalCriteria: { type: String, required: false },
    eligibilityId:[{type:mongoose.Schema.Types.ObjectId,ref:"eligibility"}],
>>>>>>> 6a9f457e241ca30d20651823e6f20c842bad8633
})

const positionModel = mongoose.model('position', positionSchema)

module.exports= positionModel