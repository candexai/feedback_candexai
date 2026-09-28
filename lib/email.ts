import nodemailer from "nodemailer";
import { formatStamp } from "@/lib/format";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function transporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !pass) return null;
  const secure = process.env.SMTP_SECURE === "true";
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export async function sendConfirmationEmail(input: {
  to: string;
  feedbackId: string;
  clientCompany: string;
  projectCampaign: string;
  submittedAt: Date;
  testimonialText: string;
  consentToUse: boolean;
  displayIdentity: boolean;
  useLogo: boolean;
}) {
  const mailer = transporter();
  if (!mailer) {
    return { sent: false, error: "SMTP is not configured." };
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const submitted = formatStamp(input.submittedAt);
  const testimonial = input.testimonialText.trim()
    ? input.testimonialText.trim()
    : "You did not submit a testimonial.";
  const consent = input.consentToUse
    ? "You gave CandexAI permission to use this testimonial in its website, sales presentations, investor materials, and other marketing communications."
    : "You did not give permission to use a testimonial in marketing.";
  const identity = input.displayIdentity
    ? "You allowed CandexAI to display your name, designation, and company."
    : "You did not allow CandexAI to display your name, designation, and company.";
  const logo = input.useLogo
    ? "You allowed CandexAI to use your company logo, if applicable."
    : "You did not allow CandexAI to use your company logo.";

  const text = [
    "Thank you. Your feedback has been successfully submitted.",
    "",
    `Client / project: ${input.clientCompany} — ${input.projectCampaign}`,
    `Submission date: ${submitted}`,
    `Feedback ID: ${input.feedbackId}`,
    "",
    "Testimonial",
    testimonial,
    "",
    "Consent",
    consent,
    identity,
    logo,
    "",
    "CandexAI",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f7f7f5;color:#0a0a0a;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#3f3f46;">CandexAI</p>
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;">Thank you. Your feedback has been successfully submitted.</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3f46;">Keep this note. It confirms what was received and whether you gave consent.</p>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Client / project</strong><br>${escapeHtml(input.clientCompany)} — ${escapeHtml(input.projectCampaign)}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Submission date</strong><br>${escapeHtml(submitted)}</p>
        <p style="margin:0 0 16px;font-size:14px;"><strong>Feedback ID</strong><br><span style="color:#cc7530;">${escapeHtml(input.feedbackId)}</span></p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Your submitted testimonial</strong></p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(testimonial)}</p>
        <p style="margin:0;font-size:14px;line-height:1.6;"><strong>Consent given</strong><br>${escapeHtml(consent)}<br>${escapeHtml(identity)}<br>${escapeHtml(logo)}</p>
      </div>
    </div>
  </body>
</html>`;

  try {
    const info = await mailer.sendMail({
      from: `CandexAI <${fromAddress}>`,
      to: input.to,
      subject: `CandexAI feedback received — ${input.feedbackId}`,
      text,
      html,
    });
    return { sent: true, messageId: info.messageId || "", error: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email could not be sent.";
    return { sent: false, error: message.slice(0, 300) };
  }
}
