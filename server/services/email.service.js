import nodemailer from "nodemailer";

/**
 * Lazily creates a Nodemailer transporter only when email
 * credentials are present. If not configured, email sending
 * is silently skipped so form submissions still succeed and
 * save to the database — email is a notification convenience,
 * not a requirement for the API to function.
 */
const isEmailConfigured = () =>
  !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS && !!process.env.EMAIL_HOST;

const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendMail = async ({ subject, html, replyTo }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("[email.service] Email not configured — skipping send. Subject:", subject);
    return { sent: false, reason: "not_configured" };
  }

  try {
    await transporter.sendMail({
      from: `"Future IT College Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email.service] Failed to send email:", error.message);
    return { sent: false, reason: error.message };
  }
};

export const sendAdmissionNotification = (admission) =>
  sendMail({
    subject: `New Admission Enquiry — ${admission.name}`,
    replyTo: admission.email || undefined,
    html: `
      <h2>New Admission Enquiry — Future IT College</h2>
      <p><strong>Name:</strong> ${admission.name}</p>
      <p><strong>Phone:</strong> ${admission.phone}</p>
      <p><strong>Email:</strong> ${admission.email || "Not provided"}</p>
      <p><strong>Address:</strong> ${admission.address}</p>
      <p><strong>Interested Course:</strong> ${admission.course}</p>
      <p><strong>Message:</strong> ${admission.message || "—"}</p>
      <p><strong>Submitted At:</strong> ${new Date(admission.createdAt).toLocaleString("en-IN")}</p>
    `,
  });

export const sendContactNotification = (contact) =>
  sendMail({
    subject: `New Contact Message — ${contact.name}`,
    replyTo: contact.email || undefined,
    html: `
      <h2>New Contact Form Message — Future IT College</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Email:</strong> ${contact.email || "Not provided"}</p>
      <p><strong>Message:</strong> ${contact.message}</p>
      <p><strong>Submitted At:</strong> ${new Date(contact.createdAt).toLocaleString("en-IN")}</p>
    `,
  });

export const sendPasswordResetEmail = (student, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  return sendMail({
    subject: "Reset Your Future IT College Password",
    replyTo: student.email,
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${student.name},</p>
      <p>We received a request to reset your Future IT College student portal password. Click the link below to set a new password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};

export default { sendAdmissionNotification, sendContactNotification, sendPasswordResetEmail };

