# Tech Talent Platform

A full-stack MERN-based Tech Talent Platform designed to support end-to-end IT recruitment, including job posting, candidate management, coding assessments, online interviews, and AI-powered CV screening.

---

## Overview

Tech Talent Platform is an online recruitment and interview system for IT roles, aiming to bridge the gap between candidates, recruiters, and technical interviewers through a unified digital platform.

The system supports:

- Job discovery and application
- CV management (online CV and uploaded CV)
- Coding challenges
- Online interviews
- Recruitment workflow tracking
- AI-powered candidate screening

This project is developed as part of an academic and practical MERN-stack application, following clean architecture and modular design principles.

---

## Main Features

### Candidate

- Create and manage personal profile
- Build online CV or upload CV (PDF)
- Search and apply for jobs
- Track application status
- Take coding tests
- Join online interviews

### Recruiter

- Create and manage job postings
- Review candidate applications
- Filter and shortlist candidates
- View AI matching scores and explanations
- Send coding tests and interview invitations
- Update application status

### Interviewer

- Create and manage coding questions
- Review coding submissions
- Conduct online technical interviews
- Evaluate candidates after interviews

### Admin

- Manage users and roles
- Review and moderate job postings
- View system statistics

---

## AI-Powered CV Screening and Matching Score

To enhance the recruitment workflow, the Tech Talent Platform integrates a real AI-based CV screening system using Google Gemini 1.5 Flash (Free Tier).

This feature automatically evaluates how well a candidate matches a job position at the time of application.

---

### What the AI Analyzes

- Job description and required skills
- Candidate profile (skills and experience)
- Candidate CV:
  - Online CV (structured data)
  - Uploaded CV (PDF, text extracted via OCR)

---

### AI Output

For each job application, the system generates:

- Matching Score (range: 0–100)
- Human-readable explanation describing why the candidate matches the job

These results are stored directly in the application record and are visible to recruiters for screening and ranking purposes.

---

### AI Screening Workflow

Candidate applies for a job  
↓  
System gathers job data, candidate profile, and CV  
↓  
Uploaded PDF CV is processed using OCR (pdf-parse)  
↓  
Google Gemini 1.5 Flash analyzes the combined data  
↓  
AI returns a matching score and explanation  
↓  
Result is saved in the Application database

---

### CV Processing Strategy

Online CV:

- Structured JSON-based CV data
- Passed directly to the AI model

Uploaded CV (PDF):

- Text extracted using pdf-parse
- Content truncated to control prompt size
- Sent as plain text to Gemini Flash

This approach is effective because most IT CVs are text-based PDFs.

---

### AI Response Format

The AI is instructed to return results in strict JSON format:

{
"matchingScore": 86,
"reason": "The candidate matches most required backend skills and has relevant experience."
}

This ensures easy parsing, explainability, and transparency for recruiters.

---

### Data Model Integration

AI results are stored in the Application entity using the following fields:

matchingScore: Number // Range: 0–100  
matchingReason: String // AI-generated explanation

Recruiters can use this data to:

- Rank candidates by matching score
- Filter candidates using score thresholds
- Quickly identify suitable applicants

---

### Performance and Cost Control

- AI is invoked only once per job application
- Results are cached in MongoDB
- No repeated AI calls when recruiters view applications
- Free tier usage remains within quota limits

---

### Limitations

- AI does not make final hiring decisions
- OCR accuracy depends on PDF structure
- Image-based scanned CVs may produce limited text

These limitations are acceptable within the project scope and are transparently documented.

---

## Backend Status

- Authentication and Authorization
- Job Management
- CV Upload and Online CV
- Job Application Pipeline
- AI-based CV Screening using Gemini Flash
- Coding Tests and Interview Flow
- Offer and Hiring Management

The backend implementation is complete and ready for frontend integration.
