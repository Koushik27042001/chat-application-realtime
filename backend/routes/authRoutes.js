const express = require("express");

const {
  getCurrentUser,
  loginUser,
  registerUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

module.exports = router;
