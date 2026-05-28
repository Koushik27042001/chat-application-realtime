const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { uploadImageToCloudinary } = require("../services/upload.service");

const uploadImage = asyncHandler(async (req, res) => {
  const { image } = req.body || {};

  if (!image) {
    return res.status(400).json(new ApiResponse(400, "Image is required"));
  }

  const uploaded = await uploadImageToCloudinary(image);

  res.status(201).json(new ApiResponse(201, "Image uploaded", uploaded));
});

module.exports = {
  uploadImage,
};
