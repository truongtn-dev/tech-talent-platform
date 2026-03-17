const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Use absolute paths
const serverDir = 'e:/SE1816_SDN302/tech-talent-platform/server';
const dotenvPath = path.join(serverDir, '.env');
require('dotenv').config({ path: dotenvPath });

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tech-talent-platform';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const Job = require(path.join(serverDir, 'src/jobs/job.model.js'));
    const User = require(path.join(serverDir, 'src/modules/auth/user.model.js'));
    const CV = require(path.join(serverDir, 'src/cvs/cv.model.js'));

    const job = await Job.findOne({ title: /Senior MERN Developer - E2E/i });
    if (!job) {
      console.log('Job not found');
    } else {
      console.log('JOB_ID:', job._id);
      console.log('JOB_TITLE:', job.title);
    }

    const candidate = await User.findOne({ email: 'candidate_e2e_v1816@example.com' });
    if (!candidate) {
      console.log('Candidate not found');
    } else {
      console.log('CANDIDATE_ID:', candidate._id);
      const cv = await CV.findOne({ userId: candidate._id });
      if (cv) console.log('CV_ID:', cv._id);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
