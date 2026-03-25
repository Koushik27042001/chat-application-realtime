const express = require("express");

const { listUsers, getUserById, updateMyAvatar } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, listUsers);
router.get("/:id", protect, getUserById);
router.patch("/me/avatar", protect, updateMyAvatar);

module.exports = router;
