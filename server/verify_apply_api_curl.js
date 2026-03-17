import { execSync } from 'child_process';

const candidateEmail = 'candidate@tech.com';
const password = 'Techtalent123@';
const baseUrl = 'http://127.0.0.1:5000/api';

function curl(url, method = 'GET', data = null, token = null) {
    let cmd = `curl.exe -s -X ${method} "${url}"`;
    cmd += ` -H "Content-Type: application/json"`;
    cmd += ` -H "Accept: application/json"`;
    if (token) cmd += ` -H "Authorization: Bearer ${token}"`;
    if (data) {
        const json = JSON.stringify(data).replace(/"/g, '\"');
        cmd += ` -d "${json}"`;
    }
    
    // Use powershell to run curl to handle quotes better if needed, 
    // but curl.exe direct should work if we are careful.
    // Actually, on Windows, escaping is hard. I'll use a temporary data file.
    
    try {
        const out = execSync(cmd).toString();
        return JSON.parse(out);
    } catch (err) {
        console.error("CURL Failed for", url);
        console.error(err.message);
        return null;
    }
}

async function run() {
    // 1. Login
    console.log("Logging in...");
    const loginRes = curl(`${baseUrl}/auth/login`, 'POST', { email: candidateEmail, password });
    if (!loginRes || !loginRes.token) {
        console.error("Login failed:", loginRes);
        process.exit(1);
    }
    const token = loginRes.token;
    console.log("Logged in.");

    // 2. Get Job
    console.log("Getting jobs...");
    const jobs = curl(`${baseUrl}/jobs`);
    const job = jobs.find(j => j.title.includes('MERN'));
    if (!job) {
        console.error("Job not found");
        process.exit(1);
    }
    console.log("Job ID:", job._id);

    // 3. Apply
    console.log("Applying...");
    const applyRes = curl(`${baseUrl}/applications`, 'POST', { jobId: job._id, cvType: 'PROFILE' }, token);
    console.log("Apply Result:", JSON.stringify(applyRes, null, 2));
}

run();
