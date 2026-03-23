const nodemailer = require("nodemailer");

let transporter = null;
let etherealPreviewUrl = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  let host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;

  if (!host && user && user.includes("@gmail")) {
    host = "smtp.gmail.com";
  }
  if (!host && user && user.includes("@yahoo")) {
    host = "smtp.mail.yahoo.com";
  }
  if (!host) host = process.env.SMTP_HOST;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  // Dev fallback: Ethereal test account (emails go to preview URL, not inbox)
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transporter;
};

const sendEmail = async (to, subject, html) => {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@chat-app.local",
    to,
    subject,
    html,
  });

  const hasRealSmtp = (process.env.SMTP_HOST || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS);
  if (!hasRealSmtp && info.messageId) {
    etherealPreviewUrl = nodemailer.getTestMessageUrl(info);
    console.log("\n[EMAIL] No real SMTP configured. Using Ethereal test inbox.");
    console.log("Preview URL (OTP / reset link inside):", etherealPreviewUrl);
    console.log("Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to send real emails.\n");
  }
};

module.exports = { sendEmail };
