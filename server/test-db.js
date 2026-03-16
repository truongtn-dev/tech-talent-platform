import './src/config/env.js';
import mongoose from 'mongoose';

async function test() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('CONNECTED SUCCESS!');
    process.exit(0);
  } catch (err) {
    console.log('CONNECTION ERROR:', err.message);
    process.exit(1);
  }
}
test();
