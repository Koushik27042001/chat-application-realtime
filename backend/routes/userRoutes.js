const express = require("express");

const { listUsers, getUserById } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, listUsers);
router.get("/:id", protect, getUserById);

module.exports = router;
