import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const STATUS_LABELS = {
  in_progress: 'In Progress',
  resolved:    'Resolved',
};

export async function sendStatusChangeEmail(to, reportTitle, newStatus, adminComment) {
  // Only notify on actionable status changes
  if (!['in_progress', 'resolved'].includes(newStatus)) return;

  const label = STATUS_LABELS[newStatus];
  const commentHtml = adminComment
    ? `<p><strong>Admin comment:</strong> ${adminComment}</p>`
    : '';

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: `Your report "${reportTitle}" is now ${label}`,
    html: `
      <h2>UrbanPulse — Report Status Update</h2>
      <p>Your report <strong>${reportTitle}</strong> has been updated to
         <strong>${label}</strong>.</p>
      ${commentHtml}
      <p>Thank you for contributing to UrbanPulse.</p>
    `,
  });
}
