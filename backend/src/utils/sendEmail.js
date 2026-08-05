import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Email send failed to ${to}:`, error.message);
  }
};

export const emailTemplates = {
  newCertificateSubmitted: (studentName, certTitle) => ({
    subject: 'New certificate awaiting your verification',
    html: `<p><strong>${studentName}</strong> submitted "<strong>${certTitle}</strong>" for your verification on CredCheck.</p>
           <p>Log in to your verifier dashboard to approve or reject it.</p>`,
  }),
  certificateDecision: (certTitle, status, comments) => ({
    subject: `Your certificate "${certTitle}" was ${status}`,
    html: `<p>Your certificate "<strong>${certTitle}</strong>" has been <strong>${status}</strong>.</p>
           ${comments ? `<p>Verifier comment: ${comments}</p>` : ''}`,
  }),
  verifierRequestApproved: (orgName) => ({
    subject: 'Your organization is now a verified partner on CredCheck',
    html: `<p>Congrats! <strong>${orgName}</strong> has been approved as a verifier on CredCheck.</p>`,
  }),
};
