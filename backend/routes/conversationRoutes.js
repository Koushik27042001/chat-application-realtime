const express = require("express");

const {
  listMyConversations,
  getConversationWithUser,
  createGroup,
  getGroupDetails,
  addGroupMember,
  removeGroupMember,
  updateGroupInfo,
} = require("../controllers/conversation.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, listMyConversations);
router.get("/with/:userId", protect, getConversationWithUser);

// 🔥 GROUP ROUTES
router.post("/group/create", protect, createGroup);
router.get("/group/:groupId", protect, getGroupDetails);
router.post("/group/add-member", protect, addGroupMember);
router.post("/group/remove-member", protect, removeGroupMember);
router.patch("/group/:groupId", protect, updateGroupInfo);

module.exports = router;
