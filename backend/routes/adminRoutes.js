const express = require("express");

const { getAnalytics } = require("../controllers/admin.controller");
const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/analytics", auth, adminOnly, getAnalytics);

module.exports = router;
