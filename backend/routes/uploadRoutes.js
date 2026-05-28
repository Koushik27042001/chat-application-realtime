const express = require("express");

const { uploadImage } = require("../controllers/upload.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/image", auth, uploadImage);

module.exports = router;
