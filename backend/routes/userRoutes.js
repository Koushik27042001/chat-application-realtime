const express = require("express");

const { listUsers, getUserById } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, listUsers);
router.get("/:id", protect, getUserById);

module.exports = router;
