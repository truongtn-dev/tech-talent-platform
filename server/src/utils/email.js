import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "truongtn.dev@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    await transporter.sendMail({
      from: `"Tech Talent Platform" <${process.env.EMAIL_USER || "truongtn.dev@gmail.com"}>`,
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text: text,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("Email Service Error:", error);
  }
};

// --- Email Templates ---

export const getApplicationTemplate = (candidateName, jobTitle, score) => ({
  subject: `[TechTalent] Application Received: ${jobTitle}`,
  html: `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #1677ff;">Application Received!</h2>
      <p>Hi <b>${candidateName}</b>,</p>
      <p>Thank you for applying for the <b>${jobTitle}</b> position. Our AI has successfully analyzed your CV.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><b>AI Match Score:</b> ${score}%</p>
      </div>
      <p>You can track your status in your dashboard.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">Tech Talent Platform - Recruitment Automation</p>
    </div>
  `
});

export const getInterviewTemplate = (candidateName, jobTitle, date, link) => ({
  subject: `[TechTalent] Interview Invitation: ${jobTitle}`,
  html: `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #1677ff; border-radius: 10px;">
      <h2 style="color: #1677ff;">Interview Scheduled</h2>
      <p>Hi <b>${candidateName}</b>,</p>
      <p>We are excited to invite you to an interview for the <b>${jobTitle}</b> role.</p>
      <ul>
        <li><b>Date:</b> ${new Date(date).toLocaleString()}</li>
        <li><b>Meeting Link:</b> <a href="${link}">${link}</a></li>
      </ul>
      <p>Please ensure you have a stable internet connection and your camera is working.</p>
      <p>Good luck!</p>
    </div>
  `
});

export const getTestTemplate = (candidateName, testTitle, deadline, link) => ({
  subject: `[TechTalent] Action Required: Coding Test Assigned`,
  html: `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fadb14; border-radius: 10px;">
      <h2 style="color: #d4b106;">Technical Assessment Assigned</h2>
      <p>Hi <b>${candidateName}</b>,</p>
      <p>To move forward, please complete the technical challenge: <b>${testTitle}</b>.</p>
      <p><b>Deadline:</b> ${new Date(deadline).toLocaleDateString()}</p>
      <div style="margin: 20px 0;">
        <a href="${link}" style="background: #1677ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Coding Test</a>
      </div>
      <p><i>Note: The session is monitored by AI Proctoring.</i></p>
    </div>
  `
});
