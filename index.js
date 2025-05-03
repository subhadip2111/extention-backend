const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv');
const { Company, Job } = require('./models/companyModel');
const app=express();
dotenv.config();
const PORT=process.env.PORT || 3000;
const MONGO_URI=process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.get('/',async(req,res)=>{
return res.send('Hello from the server');
})
app.post('/api/jobs', async (req, res) => {
    const { email, jobs } = req.body;
    console.log(`Received job data from ${email}:`, jobs);

    try {
        // 1. Validate the input data (important for security and data integrity)
        if (!email || !jobs || !Array.isArray(jobs)) {
            return res.status(400).json({ message: 'Invalid request: Missing email or jobs data' });
        }

        // 2. Process each job in the array
        const savedJobs = [];  // Array to store successfully saved jobs
        for (const jobData of jobs) {
            try {
                // 2.1 Check if the job already exists based on the URL
                console.log('Checking for duplicate job with URL:', jobData.url);
                const existingJob = await Job.findOne({ url: jobData.url });

                if (existingJob) {
                    // Update the existing job if necessary
                    console.log(`Job already exists, updating: ${jobData.url}`);
                    await Job.findOneAndUpdate(
                        { url: jobData.url },
                        {
                            $set: {
                                title: jobData.title,
                                companyId: existingJob.companyId,
                                description: jobData.description,
                                skills: jobData.skills,
                                salary: jobData.salary,
                                location: jobData.location,
                                postedDate: jobData.postedDate,
                            }
                        },
                        { new: true } // Update the job
                    );
                    continue; // Skip to the next job
                }

                // 2.2 Find or create the company (if job doesn't exist)
                let company;
                if (jobData.company) {
                    company = await Company.findOne({ name: jobData.company });
                    if (!company) {
                        // If the company doesn't exist, create it
                        company = new Company({
                            name: jobData.company,
                            location: jobData.location || 'Unknown', // Adjust location if necessary
                            website: 'N/A', // Or get it from jobData if available
                        });
                        await company.save();
                        console.log(`Created company: ${company.name}`);
                    }
                }

                // 2.3 Create a new Job object if not found
                const job = new Job({
                    companyId: company ? company._id : null,  // Use the company's _id (or null if not available)
                    title: jobData.title,
                    role: jobData.role,
                    description: jobData.description || '', // Default empty if no description
                    skills: jobData.skills || [],
                    salary: jobData.salary || 'N/A',  // Default to N/A if salary is missing
                    location: jobData.location,
                    postedDate: jobData.postedDate,
                    url: jobData.url,
                    // other job information
                });

                // 2.4 Save the job to the database
                const newJob = await job.save();
                savedJobs.push(newJob);
                console.log(`Saved job: ${newJob.title} - ${newJob.url}`);

            } catch (error) {
                console.error('Error saving job:', error);
                // Don't send 500 for every job, process other jobs and send 200
                // You might want to log this error to a file or a database for further analysis
            }
        }

        // 3. Send a response to the Chrome extension
        if (savedJobs.length > 0) {
            res.status(200).json({ message: 'Jobs saved successfully', savedJobs });
        } else {
            res.status(200).json({ message: 'No new jobs to save' }); // Send 200 even if no new jobs
        }

    } catch (error) {
        console.error('Error processing /api/jobs request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})