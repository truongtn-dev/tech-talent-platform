const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['CANDIDATE', 'RECRUITER', 'ADMIN', 'INTERVIEWER'] }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists. Updating password to admin123...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'ADMIN';
            await existingAdmin.save();
        } else {
            console.log('Creating new Admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                firstName: 'System',
                lastName: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN'
            });
        }
        console.log('Seed Success: Admin user is ready.');
    } catch (err) {
        console.error('Seed Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seedAdmin();
