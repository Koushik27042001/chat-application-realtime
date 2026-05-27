const express = require("express");

const { getMessages, sendMessage, markMessagesRead } = require("../controllers/message.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.patch("/read", auth, markMessagesRead);
router.post("/", auth, sendMessage);
router.get("/", auth, getMessages);
router.get("/:userId", auth, getMessages);

module.exports = router;
