const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const {
  registerService,
  loginService,
  googleLoginService,
  adminPanelLoginService,
  refreshSessionService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  sendOTPService,
  verifyOTPAndResetService,
} = require("../services/auth.service");
const {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
  clearRefreshCookieOptions,
  readCookie,
} = require("../utils/authCookies");

const attachRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.cookie(REFRESH_COOKIE_NAME, "", clearRefreshCookieOptions());
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json(new ApiResponse(400, "Name, email, and password are required"));
  }

  const result = await registerService(name, email, password);
  attachRefreshCookie(res, result.refreshToken);

  res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      token: result.token,
      user: result.user,
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiResponse(400, "Email and password are required"));
  }

  const result = await loginService(email, password);
  attachRefreshCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      token: result.token,
      user: result.user,
    })
  );
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json(new ApiResponse(400, "idToken is required"));
  }

  const result = await googleLoginService(idToken);
  attachRefreshCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      token: result.token,
      user: result.user,
    })
  );
});

const adminPanelLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json(new ApiResponse(400, "Username and password are required"));
  }

  const result = await adminPanelLoginService({ username, password });
  attachRefreshCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, "Admin login successful", {
      token: result.token,
      user: result.user,
    })
  );
});

const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = readCookie(req);
  /** No cookie yet (first visit / logged out) — return 401 without throwing so logs stay clean */
  if (!refreshToken) {
    return res.status(401).json(new ApiResponse(401, "Refresh token is required"));
  }

  const result = await refreshSessionService(refreshToken);
  attachRefreshCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, "Session refreshed", {
      token: result.token,
      user: result.user,
    })
  );
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = readCookie(req);

  if (refreshToken) {
    try {
      const session = await refreshSessionService(refreshToken);
      await logoutService(session.user.id);
    } catch {
      // Ignore invalid refresh tokens during logout and just clear the cookie.
    }
  }

  clearRefreshCookie(res);
  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
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
  adminPanelLogin,
  refreshSession,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTPAndReset,
};
