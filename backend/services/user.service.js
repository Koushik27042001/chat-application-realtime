const mongoose = require("mongoose");
const userRepository = require("../repositories/user.repository");

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
    avatar: user.avatar,
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
    avatar: user.avatar,
  };
};

module.exports = {
  listUsersService,
  getUserByIdService,
};
