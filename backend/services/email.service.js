const nodemailer = require("nodemailer");

const cleanEnv = (value, { removeSpaces = false } = {}) => {
  if (!value) return "";

  let cleaned = String(value).trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return removeSpaces ? cleaned.replace(/\s/g, "") : cleaned;
};

const sendEmail = async (to, subject, html) => {
  const user = cleanEnv(process.env.SMTP_USER || process.env.EMAIL_USER);
  // Gmail displays app passwords in groups. Render must receive the compact value.
  const pass = cleanEnv(process.env.SMTP_PASS || process.env.EMAIL_PASS, {
    removeSpaces: true,
  });
  const host = cleanEnv(process.env.SMTP_HOST) || "smtp.gmail.com";
  const port = Number(cleanEnv(process.env.SMTP_PORT)) || 587;
  const from = cleanEnv(process.env.SMTP_FROM) || `"Chat App" <${user}>`;

  if (!user || !pass) {
    const err = new Error(
      "Email service not configured. Set SMTP_USER and SMTP_PASS in Render."
    );
    err.statusCode = 503;
    throw err;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email sending failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      message: error.message,
      smtpHost: host,
      smtpPort: port,
    });
    const err = new Error(
      "Failed to send email. Verify the SMTP settings configured on the server."
    );
    err.statusCode = 502;
    throw err;
  }
};

module.exports = sendEmail;
