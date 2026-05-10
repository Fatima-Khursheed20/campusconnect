const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job');

dotenv.config();

async function testJobsAPI() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if jobs exist
    const jobCount = await Job.countDocuments({ isActive: true });
    console.log(`Found ${jobCount} active jobs in database`);

    if (jobCount > 0) {
      // Get sample jobs
      const jobs = await Job.find({ isActive: true })
        .populate("postedBy", "name companyName")
        .limit(3)
        .sort({ createdAt: -1 });
      
      console.log('\nSample jobs:');
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} - ${job.companyName || 'Unknown Company'}`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Type: ${job.type}`);
        console.log(`   Posted by: ${job.postedBy?.name || 'Unknown'}`);
        console.log('');
      });
    } else {
      console.log('No active jobs found. Creating sample jobs...');
      
      // Create sample jobs if none exist
      const sampleJobs = [
        {
          title: "Frontend Developer Intern",
          description: "We are looking for a talented Frontend Developer Intern to join our team. You will work on modern web applications using React, TypeScript, and modern CSS frameworks.",
          type: "internship",
          location: "Karachi, Pakistan",
          salary: "PKR 25,000/month",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          requirements: ["Proficiency in HTML, CSS, and JavaScript", "Experience with React", "Good understanding of responsive design"],
          postedBy: null, // Will be set below
          isActive: true
        },
        {
          title: "Full Stack Software Engineer",
          description: "Join our engineering team to build scalable web applications. You'll work with Node.js, React, MongoDB, and cloud technologies.",
          type: "full-time",
          location: "Lahore, Pakistan",
          salary: "PKR 150,000/month",
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          requirements: ["2+ years of experience in web development", "Strong knowledge of JavaScript and Node.js", "Experience with React"],
          postedBy: null, // Will be set below
          isActive: true
        }
      ];

      // Find or create a recruiter user
      const User = require('../models/User');
      let recruiter = await User.findOne({ email: 'recruiter@company.com' });
      
      if (!recruiter) {
        const bcrypt = require('bcrypt');
        recruiter = new User({
          name: 'Company Recruiter',
          email: 'recruiter@company.com',
          password: await bcrypt.hash('Recruiter123', 12),
          role: 'recruiter',
          companyName: 'Tech Solutions Inc.',
          isActive: true
        });
        await recruiter.save();
        console.log('Created recruiter user');
      }

      // Set postedBy for sample jobs
      sampleJobs.forEach(job => {
        job.postedBy = recruiter._id;
      });

      // Insert sample jobs
      await Job.insertMany(sampleJobs);
      console.log('Created 2 sample jobs');
    }

  } catch (error) {
    console.error('Error testing jobs API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testJobsAPI();
