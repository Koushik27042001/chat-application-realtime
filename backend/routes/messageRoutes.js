const express = require("express");

const { getMessages, sendMessage } = require("../controllers/messageController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, sendMessage);
router.get("/", auth, getMessages);
router.get("/:userId", auth, getMessages);

module.exports = router;
