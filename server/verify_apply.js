import "./src/config/env.js";
import mongoose from 'mongoose';

// Import service
import { applyJob } from './src/applications/application.service.js';

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tech-talent-platform';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Find Job
    const job = await mongoose.connection.collection('jobs').findOne({ title: /Senior MERN Developer - E2E/i });
    if (!job) throw new Error('Job not found');
    console.log('Job ID:', job._id);

    // 2. Find User
    const user = await mongoose.connection.collection('users').findOne({ email: 'candidate_e2e_v1816@example.com' });
    if (!user) throw new Error('User not found');
    console.log('User ID:', user._id);

    // 3. Find CV
    const cv = await mongoose.connection.collection('cvs').findOne({ userId: user._id });
    if (!cv) throw new Error('CV not found');
    console.log('CV ID:', cv._id);

    // 4. Create Application
    const fakeUser = { userId: user._id.toString(), role: 'CANDIDATE' };
    const applicationData = {
      jobId: job._id.toString(),
      cvType: 'ONLINE',
      cvId: cv._id.toString()
    };

    console.log('Calling applyJob service...');
    const application = await applyJob(applicationData, fakeUser);
    console.log('Application SUCCESS:', application._id);

    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

run();
