import "./src/config/env.js";
import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Application = mongoose.connection.collection('applications');
    const result = await Application.deleteMany({});
    console.log('Deleted', result.deletedCount, 'applications');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
