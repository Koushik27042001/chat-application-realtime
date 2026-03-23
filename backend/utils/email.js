const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
};

const sendEmail = async (to, subject, html) => {
  const transport = getTransporter();

  if (!transport) {
    console.log("[EMAIL] No SMTP configured. Would send:");
    console.log("  To:", to);
    console.log("  Subject:", subject);
    console.log("  Body:", html.replace(/<[^>]*>/g, ""));
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@chat-app.local",
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
