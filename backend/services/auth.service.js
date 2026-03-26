const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  HARDCODED_ADMIN_USERNAME,
  HARDCODED_ADMIN_PASSWORD,
  HARDCODED_ADMIN_EMAIL,
  HARDCODED_ADMIN_NAME,
} = require("../config/adminPanel");
const userRepository = require("../repositories/user.repository");
const sendEmail = require("./email.service");
const { verifyIdToken } = require("../firebaseAdmin");
const { createDefaultAvatar } = require("../utils/avatar");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar || createDefaultAvatar(user.name),
  role: user.role || "user",
  lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
});

const recordSuccessfulAuth = async (user) => {
  user.lastLogin = new Date();
  await user.save();
};

/** Compare secrets without leaking length via timingSafeEqual on fixed-length digests */
const safeEqualSecret = (a, b) => {
  const ah = crypto.createHash("sha256").update(String(a ?? ""), "utf8").digest();
  const bh = crypto.createHash("sha256").update(String(b ?? ""), "utf8").digest();
  return crypto.timingSafeEqual(ah, bh);
};

/**
 * Hardcoded admin login (see `config/adminPanel.js`). Use only from the hidden
 * route `/admin/<ADMIN_PANEL_SECRET>/login` on the client.
 */
const adminPanelLoginService = async ({ username, password }) => {
  if (!username || !password) {
    const err = new Error("Username and password are required");
    err.statusCode = 400;
    throw err;
  }

  if (!safeEqualSecret(String(username).trim(), HARDCODED_ADMIN_USERNAME)) {
    const err = new Error("Invalid admin credentials");
    err.statusCode = 401;
    throw err;
  }

  if (!safeEqualSecret(password, HARDCODED_ADMIN_PASSWORD)) {
    const err = new Error("Invalid admin credentials");
    err.statusCode = 401;
    throw err;
  }

  let user = await userRepository.findByEmail(HARDCODED_ADMIN_EMAIL);

  if (!user) {
    try {
      const hashedPassword = await bcrypt.hash(HARDCODED_ADMIN_PASSWORD, 10);
      user = await userRepository.create({
        name: HARDCODED_ADMIN_NAME,
        email: HARDCODED_ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        avatar: createDefaultAvatar(HARDCODED_ADMIN_NAME),
        lastLogin: new Date(),
      });
    } catch (e) {
      if (e.code === 11000) {
        user = await userRepository.findByEmail(HARDCODED_ADMIN_EMAIL);
      } else {
        throw e;
      }
    }
  }

  if (!user) {
    const err = new Error("Could not load admin account");
    err.statusCode = 500;
    throw err;
  }

  user.role = "admin";
  user.lastLogin = new Date();
  await user.save();

  return {
    token: createToken(user._id),
    user: sanitizeUser(user),
  };
};

const registerService = async (name, email, password) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userRepository.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    avatar: createDefaultAvatar(name),
    lastLogin: new Date(),
  });

  return {
    token: createToken(user._id),
    user: sanitizeUser(user),
  };
};

const loginService = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.password) {
    const error = new Error("This account uses Google sign-in");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  await recordSuccessfulAuth(user);

  return {
    token: createToken(user._id),
    user: sanitizeUser(user),
  };
};

const googleLoginService = async (idToken) => {
  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (e) {
    if (e.statusCode === 503) {
      throw e;
    }
    const err = new Error("Google sign-in failed. Try again.");
    err.statusCode = 401;
    throw err;
  }
  const uid = decoded.uid;
  const email = (decoded.email || "").toLowerCase().trim();

  if (!email || !decoded.email_verified) {
    const error = new Error("Google account email is not verified");
    error.statusCode = 400;
    throw error;
  }

  const name =
    (decoded.name && String(decoded.name).trim()) ||
    email.split("@")[0] ||
    "User";
  const picture = typeof decoded.picture === "string" ? decoded.picture : "";

  let user = await userRepository.findByFirebaseUid(uid);
  if (user) {
    await recordSuccessfulAuth(user);
    return {
      token: createToken(user._id),
      user: sanitizeUser(user),
    };
  }

  user = await userRepository.findByEmail(email);
  if (user) {
    if (user.firebaseUid && user.firebaseUid !== uid) {
      const error = new Error("This email is linked to a different Google account");
      error.statusCode = 409;
      throw error;
    }
    user.firebaseUid = uid;
    if (picture && (!user.avatar || user.avatar.includes("dicebear"))) {
      user.avatar = picture;
    }
    await recordSuccessfulAuth(user);
    return {
      token: createToken(user._id),
      user: sanitizeUser(user),
    };
  }

  const newUser = await userRepository.create({
    name,
    email,
    firebaseUid: uid,
    avatar: picture || createDefaultAvatar(name),
    lastLogin: new Date(),
  });

  return {
    token: createToken(newUser._id),
    user: sanitizeUser(newUser),
  };
};

const forgotPasswordService = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  const baseUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

  await sendEmail(
    user.email,
    "Reset your password",
    `
    <h3>Password Reset</h3>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>Valid for 10 minutes</p>
    `
  );

  return { message: "Reset link sent to email" };
};

const resetPasswordService = async (token, password) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await userRepository.findByResetPasswordToken(hashedToken);
  if (!user) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: "Password reset successful" };
};

const sendOTPService = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const otp = generateOTP();
  const otpExpire = Date.now() + 5 * 60 * 1000; // 5 min

  user.otp = otp;
  user.otpExpire = new Date(otpExpire);
  await user.save();

  await sendEmail(
    user.email,
    "OTP for Password Reset",
    `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`
  );

  return { message: "OTP sent to email" };
};

const verifyOTPAndResetService = async (email, otp, password) => {
  const user = await userRepository.findByEmailAndOtp(email, otp);
  if (!user) {
    const error = new Error("Invalid or expired OTP");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  return { message: "Password reset successful" };
};

module.exports = {
  registerService,
  loginService,
  googleLoginService,
  adminPanelLoginService,
  forgotPasswordService,
  resetPasswordService,
  sendOTPService,
  verifyOTPAndResetService,
  sanitizeUser,
};
