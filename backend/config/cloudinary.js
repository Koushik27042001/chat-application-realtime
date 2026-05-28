const getCloudinaryConfig = () => {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  let apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "chat-app";

  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if ((!cloudName || !apiKey || !apiSecret) && cloudinaryUrl) {
    try {
      const parsed = new URL(cloudinaryUrl);
      if (parsed.protocol === "cloudinary:") {
        cloudName = cloudName || parsed.hostname;
        apiKey = apiKey || decodeURIComponent(parsed.username || "");
        apiSecret = apiSecret || decodeURIComponent(parsed.password || "");
      }
    } catch {
      // Keep normal variable validation below.
    }
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
    isConfigured: Boolean(cloudName && apiKey && apiSecret),
    missing: [
      !cloudName && "CLOUDINARY_CLOUD_NAME",
      !apiKey && "CLOUDINARY_API_KEY",
      !apiSecret && "CLOUDINARY_API_SECRET",
    ].filter(Boolean),
  };
};

module.exports = getCloudinaryConfig;
