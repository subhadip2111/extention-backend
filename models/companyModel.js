const mongoose = require('mongoose');

// Define the Company schema
const companySchema = new mongoose.Schema({
    name: { type: String, required: false, default: "" },
    location: { type: String, required: false, default: "" },
    website: { type: String, required: false, default: "" },
    // other relevant company information
});

// Define the Job schema
const jobSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false }, // Foreign key, optional now
    title: { type: String, required: false, default: "" },
    role: { type: String, required: false, default: "" },
    description: { type: String, required: false, default: "" },
    skills: [{ type: String, required: false, default: [] }], // Default empty array
    salary: {
        min: { type: Number, required: false, default: 0 },
        max: { type: Number, required: false, default: 0 },
        currency: { type: String, required: false, default: 'INR' }
    },
    location: { type: String, required: false, default: "" },
    postedDate: { type: Date, required: false, default: Date.now }, // Default to current date if not provided
    url: { type: String, required: false, default: "" }, // Ensure no duplicate jobs, can be empty if not given
    // other relevant job information
});

// Create the Company and Job models
const Company = mongoose.model('Company', companySchema);
const Job = mongoose.model('Job', jobSchema);

module.exports = { Company, Job };
