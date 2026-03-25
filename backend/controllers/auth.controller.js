const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const {
  registerService,
  loginService,
  googleLoginService,
  forgotPasswordService,
  resetPasswordService,
  sendOTPService,
  verifyOTPAndResetService,
} = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json(new ApiResponse(400, "Name, email, and password are required"));
  }

  const result = await registerService(name, email, password);

  res.status(201).json(
    new ApiResponse(201, "User registered successfully", result)
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiResponse(400, "Email and password are required"));
  }

  const result = await loginService(email, password);

  res.status(200).json(
    new ApiResponse(200, "Login successful", result)
  );
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json(new ApiResponse(400, "idToken is required"));
  }

  const result = await googleLoginService(idToken);

  res.status(200).json(
    new ApiResponse(200, "Login successful", result)
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "User retrieved", { user: req.user })
  );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiResponse(400, "Email is required"));
  }
  const result = await forgotPasswordService(email);
  res.status(200).json(new ApiResponse(200, result.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!token || !password) {
    return res.status(400).json(new ApiResponse(400, "Token and password are required"));
  }
  if (password.length < 6) {
    return res.status(400).json(new ApiResponse(400, "Password must be at least 6 characters"));
  }
  const result = await resetPasswordService(token, password);
  res.status(200).json(new ApiResponse(200, result.message));
});

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiResponse(400, "Email is required"));
  }
  const result = await sendOTPService(email);
  res.status(200).json(new ApiResponse(200, result.message));
});

const verifyOTPAndReset = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json(new ApiResponse(400, "Email, OTP and password are required"));
  }
  if (password.length < 6) {
    return res.status(400).json(new ApiResponse(400, "Password must be at least 6 characters"));
  }
  const result = await verifyOTPAndResetService(email, otp, password);
  res.status(200).json(new ApiResponse(200, result.message));
});

module.exports = {
  register,
  login,
  googleLogin,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTPAndReset,
};
