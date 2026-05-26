const express = require("express");

const auth = require("../middleware/auth.middleware");
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get("/", auth, getNotifications);
router.patch("/read-all", auth, markAllRead);
router.patch("/:id/read", auth, markNotificationRead);

module.exports = router;
