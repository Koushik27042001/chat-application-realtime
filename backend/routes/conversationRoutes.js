const express = require("express");

const {
  listMyConversations,
  getConversationWithUser,
} = require("../controllers/conversation.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, listMyConversations);
router.get("/with/:userId", protect, getConversationWithUser);

module.exports = router;
