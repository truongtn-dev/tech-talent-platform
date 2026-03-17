const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const UserSchema = new mongoose.Schema({ email: String, role: String });
const JobSchema = new mongoose.Schema({ title: String, recruiterId: mongoose.Schema.Types.ObjectId, status: String, company: String, slug: String });
const ApplicationSchema = new mongoose.Schema({ jobId: mongoose.Schema.Types.ObjectId, candidateId: mongoose.Schema.Types.ObjectId, status: String });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const recruiter = await User.findOne({ email: 'recruiter@example.com' });
        const candidate = await User.findOne({ email: 'candidate@example.com' }) || await User.create({ email: 'candidate@example.com', role: 'CANDIDATE' });

        if (recruiter) {
            const jobTitle = 'Test Fixed Job ' + Date.now();
            const job = await Job.create({ 
                title: jobTitle, 
                recruiterId: recruiter._id, 
                status: 'PUBLISHED', 
                company: 'Debug Corp',
                slug: 'test-fixed-job-' + Date.now()
            });
            await Application.create({ 
                jobId: job._id, 
                candidateId: candidate._id, 
                status: 'APPLIED' 
            });
            console.log('Seed Success: Created job and application for recruiter@example.com');
        } else {
            console.log('Recruiter not found');
        }
    } catch (err) {
        console.error('Seed Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}
seed();
