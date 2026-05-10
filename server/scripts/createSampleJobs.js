const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job');
const User = require('../models/User');

dotenv.config();

const sampleJobs = [
  {
    title: "Frontend Developer Intern",
    description: "We are looking for a talented Frontend Developer Intern to join our team. You will work on modern web applications using React, TypeScript, and modern CSS frameworks. This is a great opportunity to gain hands-on experience in a fast-paced environment.",
    type: "internship",
    location: "Karachi, Pakistan",
    salary: "PKR 25,000/month",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    requirements: [
      "Proficiency in HTML, CSS, and JavaScript",
      "Experience with React or similar frameworks",
      "Good understanding of responsive design",
      "Strong problem-solving skills"
    ]
  },
  {
    title: "Full Stack Software Engineer",
    description: "Join our engineering team to build scalable web applications. You'll work with Node.js, React, MongoDB, and cloud technologies. We offer mentorship, growth opportunities, and a chance to work on real-world projects.",
    type: "full-time",
    location: "Lahore, Pakistan",
    salary: "PKR 150,000/month",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    requirements: [
      "2+ years of experience in web development",
      "Strong knowledge of JavaScript and Node.js",
      "Experience with React and modern frontend frameworks",
      "Familiarity with databases (MongoDB, PostgreSQL)"
    ]
  },
  {
    title: "Mobile App Developer",
    description: "We're seeking a creative Mobile App Developer to build innovative iOS and Android applications. You'll work with React Native, TypeScript, and modern mobile development tools.",
    type: "full-time",
    location: "Islamabad, Pakistan",
    salary: "PKR 120,000/month",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    requirements: [
      "Experience with React Native or Flutter",
      "Understanding of mobile app design principles",
      "Knowledge of iOS and Android platforms",
      "Strong debugging and testing skills"
    ]
  },
  {
    title: "Data Science Intern",
    description: "Exciting opportunity for students interested in data science and machine learning. You'll work on real datasets, build predictive models, and learn industry-standard tools like Python, TensorFlow, and scikit-learn.",
    type: "internship",
    location: "Remote",
    salary: "PKR 20,000/month",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    requirements: [
      "Basic knowledge of Python programming",
      "Understanding of statistics and mathematics",
      "Interest in machine learning and data analysis",
      "Currently enrolled in a relevant degree program"
    ]
  },
  {
    title: "UI/UX Designer",
    description: "We're looking for a talented UI/UX Designer to create beautiful and intuitive user interfaces. You'll work on web and mobile applications, conduct user research, and collaborate with development teams.",
    type: "part-time",
    location: "Rawalpindi, Pakistan",
    salary: "PKR 40,000/month",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    requirements: [
      "Portfolio demonstrating UI/UX design work",
      "Proficiency in Figma, Adobe XD, or similar tools",
      "Understanding of user-centered design principles",
      "Good communication and collaboration skills"
    ]
  },
  {
    title: "Backend Developer",
    description: "Join our backend team to build robust APIs and services. You'll work with Node.js, Express, MongoDB, and cloud services. This role offers opportunities to work on scalable systems and learn modern backend technologies.",
    type: "full-time",
    location: "Karachi, Pakistan",
    salary: "PKR 130,000/month",
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
    requirements: [
      "Strong experience with Node.js and Express",
      "Knowledge of databases (MongoDB, PostgreSQL)",
      "Understanding of RESTful API design",
      "Experience with cloud services (AWS, Azure, or GCP)"
    ]
  }
];

async function createSampleJobs() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create a recruiter user
    let recruiter = await User.findOne({ email: 'recruiter@company.com' });
    if (!recruiter) {
      recruiter = new User({
        name: 'Company Recruiter',
        email: 'recruiter@company.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2.7jK', // password: Recruiter123
        role: 'recruiter',
        companyName: 'Tech Solutions Inc.',
        companyWebsite: 'https://techsolutions.com',
        companyDescription: 'Leading technology company providing innovative solutions'
      });
      await recruiter.save();
      console.log('Created recruiter user');
    }

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Create sample jobs
    const createdJobs = [];
    for (const jobData of sampleJobs) {
      const job = new Job({
        ...jobData,
        postedBy: recruiter._id,
        isActive: true
      });
      const savedJob = await job.save();
      createdJobs.push(savedJob);
      console.log(`Created job: ${savedJob.title}`);
    }

    console.log(`\n✅ Successfully created ${createdJobs.length} sample jobs!`);
    console.log('Jobs are now available for testing the featured jobs section.');

  } catch (error) {
    console.error('Error creating sample jobs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleJobs();
