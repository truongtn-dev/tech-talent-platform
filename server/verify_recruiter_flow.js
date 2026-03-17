const recruiterEmail = 'recruiter@tech.com';
const password = 'Techtalent123@';
const baseUrl = 'http://127.0.0.1:5000/api';

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(`Failed to parse JSON from ${url}. Status: ${res.status}`);
    throw new Error(`Invalid JSON: ${text.slice(0, 50)}`);
  }
}

async function run() {
  try {
    // 1. Login
    console.log('Logging in as Recruiter...');
    const { token } = await safeFetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recruiterEmail, password })
    });
    if (!token) throw new Error('Login failed');

    // 2. Find Jobs (to get the job ID)
    const jobs = await safeFetch(`${baseUrl}/recruiter/jobs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const job = jobs.find(j => j.title.includes('Junior MERN Stack Developer'));
    if (!job) throw new Error('Job not found');
    console.log('Job found:', job._id);

    // 3. Find Applications for this Job
    console.log('Fetching applications...');
    const applications = await safeFetch(`${baseUrl}/applications/job/${job._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!applications || applications.length === 0) throw new Error('No applications found');
    const app = applications[0];
    console.log('Application found:', app._id, 'Status:', app.status);

    // 4. Update Status to SCREENED
    console.log('Screening application...');
    const screenRes = await safeFetch(`${baseUrl}/applications/${app._id}/status`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'SCREENED', note: 'Looks good for screening' })
    });
    console.log('Screened:', screenRes.status);

    // 5. Assign Test
    console.log('Assigning test...');
    // We need a challengeId. Let's find the one we created.
    const challengesRes = await safeFetch(`${baseUrl}/challenges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const challenge = challengesRes.find(c => c.title.includes('MERN Fullstack Technical Test'));
    if (!challenge) throw new Error('Challenge not found');
    
    const assignRes = await safeFetch(`${baseUrl}/applications/${app._id}/assign-test`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ challengeId: challenge._id })
    });
    console.log('Test Assigned SUCCESS:', assignRes.status);

  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

run();
