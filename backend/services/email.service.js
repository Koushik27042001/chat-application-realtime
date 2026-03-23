const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    const err = new Error("Email service not configured");
    err.statusCode = 503;
    throw err;
  }

  let transporterConfig;
  if (process.env.SMTP_HOST) {
    transporterConfig = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass },
    };
  } else {
    transporterConfig = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    };
  }

  try {
    const transporter = nodemailer.createTransport(transporterConfig);

    const info = await transporter.sendMail({
      from: `"Chat App" <${user}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    const err = new Error("Failed to send email");
    err.statusCode = 502;
    throw err;
  }
};

module.exports = sendEmail;
