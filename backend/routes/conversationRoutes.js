const express = require("express");

const {
  getConversationWithUser,
} = require("../controllers/conversation.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/with/:userId", protect, getConversationWithUser);

module.exports = router;
