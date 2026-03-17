const candidateEmail = 'candidate@tech.com';
const password = 'Techtalent123@';
const baseUrl = 'http://127.0.0.1:5000/api';

async function run() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail, password })
    });
    const { token } = await loginRes.json();
    if (!token) throw new Error('Login failed');
    console.log('Logged in.');

    // 2. Fetch Jobs to get ID
    const jobsRes = await fetch(`${baseUrl}/jobs`);
    const jobs = await jobsRes.json();
    const job = jobs.find(j => j.title.includes('MERN'));
    if (!job) throw new Error('Job not found');

    // 3. Apply
    console.log('Applying with PROFILE...');
    const applyRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId: job._id,
        cvType: 'PROFILE'
      })
    });
    
    const result = await applyRes.json();
    console.log('Application Result:', JSON.stringify(result, null, 2));

  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

run();
