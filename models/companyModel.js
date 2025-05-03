const mongoose = require('mongoose');

// Define the Company schema
const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    website: { type: String, required: true },
    // other relevant company information
});

// Define the Job schema
const jobSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // Foreign key
    title: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    skills: [{ type: String, required: true }],
    salary: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        currency: { type: String, required: true, default: 'INR' }
    },
    location: { type: String, required: true },
    postedDate: { type: Date, required: true },
    url: { type: String, required: true, unique: true }, // Ensure no duplicate jobs
    // other relevant job information
});

// Create the Company and Job models
const Company = mongoose.model('Company', companySchema);
const Job = mongoose.model('Job', jobSchema);

module.exports = { Company, Job };