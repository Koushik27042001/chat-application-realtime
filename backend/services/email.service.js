const nodemailer = require("nodemailer");
const dns = require("dns");

const isProduction =
  process.env.NODE_ENV === "production" ||
  !!(process.env.RENDER_EXTERNAL_URL || process.env.RENDER);

let etherealTransporter = null;

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

const sendViaResend = async ({ to, subject, html, from, apiKey }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Resend API failed (${response.status}): ${text}`);
    error.code = "RESEND_API_ERROR";
    error.responseCode = response.status;
    throw error;
  }

  const payload = await response.json();
  return payload;
};

const sendViaSmtp = async ({
  to,
  subject,
  html,
  user,
  pass,
  host,
  port,
  from,
  forceIPv4,
}) => {
  const isGmailHost = host.toLowerCase().includes("gmail");
  const transporter = nodemailer.createTransport({
    ...(isGmailHost ? { service: "gmail" } : {}),
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    ...(forceIPv4
      ? {
          lookup: (hostname, _options, callback) =>
            dns.lookup(hostname, { family: 4, all: false }, callback),
        }
      : {}),
    auth: { user, pass },
  });

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};

const sendViaEthereal = async ({ to, subject, html }) => {
  if (!etherealTransporter) {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  const info = await etherealTransporter.sendMail({
    from: '"Chat App (dev)" <noreply@chat-app.local>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("\n[EMAIL] Dev mode — preview reset/OTP email:", previewUrl, "\n");
  }

  return info;
};

const sendEmail = async (to, subject, html) => {
  const resendApiKey = cleanEnv(process.env.RESEND_API_KEY);
  const emailFrom =
    cleanEnv(process.env.EMAIL_FROM) || cleanEnv(process.env.SMTP_FROM);

  if (resendApiKey && emailFrom) {
    try {
      await sendViaResend({
        to,
        subject,
        html,
        from: emailFrom,
        apiKey: resendApiKey,
      });
      return;
    } catch (error) {
      console.error("Resend sending failed, trying SMTP fallback:", {
        code: error.code,
        responseCode: error.responseCode,
        message: error.message,
      });
    }
  }

  const user = cleanEnv(process.env.SMTP_USER || process.env.EMAIL_USER);
  const pass = cleanEnv(process.env.SMTP_PASS || process.env.EMAIL_PASS, {
    removeSpaces: true,
  });
  const host = cleanEnv(process.env.SMTP_HOST) || "smtp.gmail.com";
  const port = Number(cleanEnv(process.env.SMTP_PORT)) || 587;
  const from = emailFrom || `"Chat App" <${user}>`;
  const forceIPv4 =
    cleanEnv(process.env.SMTP_FORCE_IPV4 || "true").toLowerCase() !== "false";

  if (!user || !pass) {
    if (!isProduction) {
      await sendViaEthereal({ to, subject, html });
      return;
    }

    const err = new Error(
      "Email service not configured. Set RESEND_API_KEY+EMAIL_FROM or SMTP credentials."
    );
    err.statusCode = 503;
    throw err;
  }

  try {
    await sendViaSmtp({
      to,
      subject,
      html,
      user,
      pass,
      host,
      port,
      from,
      forceIPv4,
    });
  } catch (error) {
    console.error("Email sending failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      message: error.message,
      smtpHost: host,
      smtpPort: port,
      forceIPv4,
    });
    const hint =
      error?.code === "EAUTH" || error?.responseCode === 535
        ? "SMTP auth failed. Verify EMAIL_USER and EMAIL_PASS (Gmail App Password)."
        : error?.code === "ETIMEDOUT"
        ? "SMTP connection timed out. Verify SMTP_HOST/SMTP_PORT and provider access."
        : "Failed to send email. Verify the configured email provider settings.";

    const err = new Error(hint);
    err.statusCode = 502;
    throw err;
  }
};

module.exports = sendEmail;
