import "./src/config/env.js";
import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Application = mongoose.connection.collection('applications');
    const app = await Application.findOne({ _id: new mongoose.Types.ObjectId('67d9a868953112bdcf859817') });
    
    if (app) {
      console.log('History:', JSON.stringify(app.history, null, 2));
    } else {
      console.log('App not found');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

run();
