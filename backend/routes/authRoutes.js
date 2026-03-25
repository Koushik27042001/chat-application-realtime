const express = require("express");

const {
  getCurrentUser,
  login,
  googleLogin,
  adminPanelLogin,
  register,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTPAndReset,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/admin-login", adminPanelLogin);
router.get("/me", auth, getCurrentUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPAndReset);

module.exports = router;
