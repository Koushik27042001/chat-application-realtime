const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");
const { sendEmail } = require("../utils/email");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

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

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  return {
    token: createToken(user._id),
    user: sanitizeUser(user),
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
  const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min

  user.resetToken = resetToken;
  user.resetTokenExpire = new Date(resetTokenExpire);
  await user.save();

  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${baseUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

  await sendEmail(
    user.email,
    "Reset your password",
    `<h3>Reset your password</h3><p>Click the link below (valid 10 minutes):</p><a href="${resetLink}">${resetLink}</a>`
  );

  return { message: "Reset link sent to email" };
};

const resetPasswordService = async (token, password) => {
  const user = await userRepository.findByResetToken(token);
  if (!user) {
    const error = new Error("Invalid or expired reset link");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
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
    `<h3>Your OTP is: <strong>${otp}</strong></h3><p>Valid for 5 minutes.</p>`
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
  forgotPasswordService,
  resetPasswordService,
  sendOTPService,
  verifyOTPAndResetService,
  sanitizeUser,
};
