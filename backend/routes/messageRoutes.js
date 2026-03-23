const express = require("express");

const { getMessages, sendMessage } = require("../controllers/message.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", auth, sendMessage);
router.get("/", auth, getMessages);
router.get("/:userId", auth, getMessages);

module.exports = router;
