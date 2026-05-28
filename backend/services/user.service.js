const mongoose = require("mongoose");
const userRepository = require("../repositories/user.repository");
const { createDefaultAvatar } = require("../utils/avatar");
const { uploadImageToCloudinary } = require("./upload.service");

const listUsersService = async (currentUserId, search) => {
  const filters = [{ _id: { $ne: currentUserId } }];

  if (search) {
    const trimmed = search.trim();
    const orFilters = [
      { name: { $regex: trimmed, $options: "i" } },
      { email: { $regex: trimmed, $options: "i" } },
    ];
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      orFilters.push({ _id: trimmed });
    }
    filters.push({ $or: orFilters });
  }

  const users = await userRepository.findMany(
    filters.length ? { $and: filters } : {}
  );

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || createDefaultAvatar(user.name),
    createdAt: user.createdAt,
  }));
};

const getUserByIdService = async (currentUserId, targetUserId) => {
  if (targetUserId === currentUserId) {
    const error = new Error("Cannot request yourself");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findById(targetUserId, "_id name email avatar");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || createDefaultAvatar(user.name),
  };
};

const updateAvatarService = async (currentUserId, avatar) => {
  const trimmed = String(avatar || "").trim();

  if (!trimmed) {
    const error = new Error("Avatar is required");
    error.statusCode = 400;
    throw error;
  }

  if (trimmed === "auto") {
    const user = await userRepository.updateById(currentUserId, { avatar: "" });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: createDefaultAvatar(user.name),
    };
  }

  const isDataImage = trimmed.startsWith("data:image/");
  const isHttpImage = /^https?:\/\//i.test(trimmed);

  if (!isDataImage && !isHttpImage) {
    const error = new Error("Avatar must be an image URL or data URL");
    error.statusCode = 400;
    throw error;
  }

  const avatarUrl = isDataImage
    ? (await uploadImageToCloudinary(trimmed, { folder: "chat-app/avatars" })).url
    : trimmed;

  const user = await userRepository.updateById(currentUserId, { avatar: avatarUrl });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || createDefaultAvatar(user.name),
  };
};

module.exports = {
  listUsersService,
  getUserByIdService,
  updateAvatarService,
};
