import "./src/config/env.js";
import mongoose from 'mongoose';

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    const Application = mongoose.connection.collection('applications');
    const apps = await Application.find({}).toArray();
    
    console.log('Total Apps:', apps.length);
    apps.forEach(app => {
      console.log('---');
      console.log('ID:', app._id);
      console.log('Job:', app.jobId);
      console.log('Candidate:', app.candidateId);
      console.log('Status:', app.status);
      console.log('History:', JSON.stringify(app.history, null, 2));
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

run();
