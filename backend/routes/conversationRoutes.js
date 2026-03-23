const express = require("express");

const {
  getConversationWithUser,
} = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/with/:userId", protect, getConversationWithUser);

module.exports = router;
