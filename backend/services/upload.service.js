const crypto = require("crypto");

const getCloudinaryConfig = require("../config/cloudinary");

const DATA_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,/i;
const MAX_IMAGE_DATA_URL_LENGTH = Number(process.env.MAX_IMAGE_DATA_URL_LENGTH || 8_000_000);

const signUploadParams = (params, apiSecret) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
};

const uploadImageToCloudinary = async (imageDataUrl, options = {}) => {
  const image = String(imageDataUrl || "").trim();

  if (!DATA_IMAGE_PATTERN.test(image)) {
    const error = new Error("A valid image data URL is required");
    error.statusCode = 400;
    throw error;
  }

  if (image.length > MAX_IMAGE_DATA_URL_LENGTH) {
    const error = new Error("Image is too large");
    error.statusCode = 413;
    throw error;
  }

  const { cloudName, apiKey, apiSecret, folder, isConfigured, missing } =
    getCloudinaryConfig();

  if (!isConfigured) {
    const suffix = missing?.length ? ` Missing: ${missing.join(", ")}` : "";
    const error = new Error(`Cloudinary is not configured.${suffix}`);
    error.statusCode = 503;
    throw error;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const uploadFolder = options.folder || folder;
  const paramsToSign = {
    folder: uploadFolder,
    timestamp,
  };
  const signature = signUploadParams(paramsToSign, apiSecret);

  const form = new FormData();
  form.append("file", image);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", uploadFolder);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.secure_url) {
    const error = new Error(body.error?.message || "Cloudinary upload failed");
    error.statusCode = response.status || 502;
    throw error;
  }

  return {
    url: body.secure_url,
    publicId: body.public_id,
    width: body.width,
    height: body.height,
    format: body.format,
    bytes: body.bytes,
  };
};

module.exports = {
  uploadImageToCloudinary,
};
