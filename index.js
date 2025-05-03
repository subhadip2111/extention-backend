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
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Optional, if you need to send cookies or auth headers
  }));app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.get('/',async(req,res)=>{
return res.send('Hello from the server');
})
app.post('/api/jobs', async (req, res) => {
    const { email, jobs } = req.body;
    console.log(`Received job data from ${email}:`, jobs);

    try {
        if (!email || !jobs || !Array.isArray(jobs)) {
            return res.status(400).json({ message: 'Invalid request: Missing email or jobs data' });
        }

        const savedJobs = [];
        for (const jobData of jobs) {
            try {
                const existingJob = await Job.findOne({ url: jobData.url });

                if (existingJob) {
                    console.log(`Job already exists, updating: ${jobData.url}`);
                    await Job.findOneAndUpdate(
                        { url: jobData.url },
                        {
                            $set: {
                                title: jobData.title,
                                description: jobData.description || '',
                                skills: jobData.skills || [],
                                salary: jobData.salary || 'N/A',
                                location: jobData.location,
                                postedDate: jobData.datePosted || jobData.postedDate,
                            }
                        },
                        { new: true }
                    );
                    continue;
                }

                // ✅ FIXED: Check for company properly
                let company = null;
                if (jobData.company) {
                    company = await Company.findOne({ name: jobData.company });

                    if (!company) {
                        company = new Company({
                            name: jobData.company,
                            location: jobData.location || 'Unknown',
                            website: 'N/A',
                        });
                        await company.save();
                        console.log(`Created company: ${company.name}`);
                    }
                }

                // ✅ FIXED: Use company?._id instead of company._id
                const job = new Job({
                    companyId: company?._id || null,
                    title: jobData.title,
                    role: jobData.role || '',
                    description: jobData.description || '',
                    skills: jobData.skills || [],
                    salary: jobData.salary || 'N/A',
                    location: jobData.location || '',
                    postedDate: jobData.datePosted || jobData.postedDate || '',
                    url: jobData.url,
                });

                const newJob = await job.save();
                savedJobs.push(newJob);
                console.log(`Saved job: ${newJob.title} - ${newJob.url}`);

            } catch (error) {
                console.error('Error saving job:', error.message);
            }
        }

        if (savedJobs.length > 0) {
            res.status(200).json({ message: 'Jobs saved successfully', savedJobs });
        } else {
            res.status(200).json({ message: 'No new jobs to save' });
        }

    } catch (error) {
        console.error('Error processing /api/jobs request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})