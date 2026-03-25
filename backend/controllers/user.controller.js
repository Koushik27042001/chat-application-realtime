const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { listUsersService, getUserByIdService, updateAvatarService } = require("../services/user.service");

const listUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const users = await listUsersService(req.user.id, search);

  res.status(200).json(
    new ApiResponse(200, "Users retrieved", users)
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new ApiResponse(400, "Invalid user id"));
  }

  const user = await getUserByIdService(req.user.id, id);

  res.status(200).json(
    new ApiResponse(200, "User retrieved", user)
  );
});

const updateMyAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  const updated = await updateAvatarService(req.user.id, avatar);

  res.status(200).json(
    new ApiResponse(200, "Avatar updated", updated)
  );
});

module.exports = {
  listUsers,
  getUserById,
  updateMyAvatar,
};
