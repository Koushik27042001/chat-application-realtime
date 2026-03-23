const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("❌ EMAIL CONFIG MISSING - EMAIL_USER and EMAIL_PASS required");
      throw new Error("Email service not configured");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Chat App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
