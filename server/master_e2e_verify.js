const baseUrl = 'http://127.0.0.1:5000/api';
const candidateCreds = { email: 'candidate@tech.com', password: 'Techtalent123@' };
const recruiterCreds = { email: 'recruiter@tech.com', password: 'Techtalent123@' };
const interviewerEmail = 'interviewer_e2e@tech.com';
const interviewerPass = 'Techtalent123@';

async function safeFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Error on ${url}: ${res.status}`);
    console.error(`Response: ${text.slice(0, 200)}`);
    throw new Error(`Fetch failed: ${res.status}`);
  }
  return JSON.parse(text);
}

async function run() {
  try {
    console.log('--- STARTING COMPREHENSIVE E2E FLOW ---');

    console.log('[Candidate] Logging in...');
    const { token: candidateToken } = await safeFetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(candidateCreds)
    });

    const jobs = await safeFetch(`${baseUrl}/jobs`);
    const job = jobs.find(j => j.title.includes('Junior MERN'));
    
    let application = await safeFetch(`${baseUrl}/applications/check/${job._id}`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` }
    });
    
    if (!application.applied) {
       console.log('[Candidate] Applying...');
       application = await safeFetch(`${baseUrl}/applications`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${candidateToken}` },
          body: JSON.stringify({ jobId: job._id, cvType: 'PROFILE' })
       });
    }
    
    let appId = application.applicationId || application._id;
    let status = application.status;
    console.log('[Candidate] Current Status:', status);

    const { token: recruiterToken } = await safeFetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(recruiterCreds)
    });

    if (status === 'APPLIED') {
      console.log('[Recruiter] Screening...');
      const res = await safeFetch(`${baseUrl}/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${recruiterToken}` },
        body: JSON.stringify({ status: 'SCREENED', note: 'Promising' })
      });
      status = res.status;
    }

    if (status === 'SCREENED') {
      console.log('[Recruiter] Assigning Test...');
      const challenges = await safeFetch(`${baseUrl}/challenges`, {
        headers: { 'Authorization': `Bearer ${recruiterToken}` }
      });
      const challenge = challenges.find(c => c.title.includes('MERN'));
      const res = await safeFetch(`${baseUrl}/applications/${appId}/assign-test`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${recruiterToken}` },
        body: JSON.stringify({ challengeId: challenge._id })
      });
      status = res.status;
      application.testAssignmentId = res.testAssignmentId;
    }

    if (status === 'TEST_ASSIGNED') {
      console.log('[Candidate] Submitting Test...');
      // We need testAssignmentId which is in the application object
      // If we don't have it, we might need to fetch the full application
      if (!application.testAssignmentId) {
          const appFull = await safeFetch(`${baseUrl}/applications/me`, {
              headers: { 'Authorization': `Bearer ${candidateToken}` }
          });
          const target = appFull.find(a => a._id === appId);
          application.testAssignmentId = target.testAssignmentId;
      }
      
      await safeFetch(`${baseUrl}/challenges/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${candidateToken}` },
        body: JSON.stringify({
          assignmentId: application.testAssignmentId,
          code: 'function solve() { return 42; }',
          language: 'javascript'
        })
      });
      status = 'TEST_SUBMITTED';
    }

    if (status === 'TEST_SUBMITTED') {
      console.log('[Recruiter] Scheduling Interview...');
      const interviewers = await safeFetch(`${baseUrl}/recruiter/interviewers`, {
        headers: { 'Authorization': `Bearer ${recruiterToken}` }
      });
      
      let interviewerId;
      let interviewerToken;
      if (interviewers.length === 0) {
        const regRes = await safeFetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          body: JSON.stringify({ email: interviewerEmail, password: interviewerPass, role: 'INTERVIEWER', firstName: 'E2E', lastName: 'Int' })
        });
        interviewerId = regRes.user.id;
        interviewerToken = regRes.token;
      } else {
        interviewerId = interviewers[0]._id;
        const loginRes = await safeFetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ email: interviewerEmail, password: interviewerPass })
        });
        interviewerToken = loginRes.token;
      }

      const interview = await safeFetch(`${baseUrl}/recruiter/interviews`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${recruiterToken}` },
        body: JSON.stringify({
          applicationId: appId,
          interviewerId: interviewerId,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          location: 'Zoom',
          notes: 'Final Round'
        })
      });

      console.log('[Interviewer] Submitting Evaluation...');
      await safeFetch(`${baseUrl}/interviewer/sessions/${interview._id}/evaluate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${interviewerToken}` },
        body: JSON.stringify({ rating: 10, feedback: 'Perfect score', recommendation: 'HIRE' })
      });
      status = 'INTERVIEW_COMPLETED';
    }

    if (status === 'INTERVIEW_COMPLETED') {
       console.log('[Recruiter] Final Offer...');
       const finalApp = await safeFetch(`${baseUrl}/applications/${appId}/status`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${recruiterToken}` },
          body: JSON.stringify({ status: 'OFFER', note: 'Welcome!' })
       });
       status = finalApp.status;
    }

    console.log('--- COMPREHENSIVE E2E FLOW COMPLETED ---');
    console.log('Final Application Status:', status);

  } catch (err) {
    console.error('--- MASTER E2E FLOW FAILED ---');
    console.error(err.message);
    process.exit(1);
  }
}

run();
