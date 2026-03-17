import "./src/config/env.js";
import mongoose from 'mongoose';

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    
    const Application = mongoose.connection.collection('applications');
    const apps = await Application.find({}).sort({ createdAt: -1 }).toArray();
    
    console.log('Found', apps.length, 'applications');
    if (apps.length > 0) {
      const latest = apps[0];
      console.log('Latest App Details:');
      console.log('ID:', latest._id);
      console.log('Job ID:', latest.jobId);
      console.log('Candidate ID:', latest.candidateId);
      console.log('Status:', latest.status);
      console.log('Score:', JSON.stringify(latest.score, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

run();
