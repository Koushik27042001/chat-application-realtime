const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const {
  listMyConversationsService,
  getConversationWithUserService,
  createGroupService,
  getGroupDetailsService,
  addGroupMemberService,
  removeGroupMemberService,
  updateGroupInfoService,
} = require("../services/conversation.service");

const listMyConversations = asyncHandler(async (req, res) => {
  const conversations = await listMyConversationsService(req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Conversations retrieved", conversations)
  );
});

const getConversationWithUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid user id"));
  }

  const result = await getConversationWithUserService(req.user.id, userId);

  res.status(200).json(
    new ApiResponse(200, "Conversation retrieved", result)
  );
});

// 🔥 GROUP ENDPOINTS
const createGroup = asyncHandler(async (req, res) => {
  const { groupName, groupDescription, participantIds } = req.body;

  if (!groupName || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json(
      new ApiResponse(400, "Group name and at least one participant are required")
    );
  }

  // Validate all participant IDs
  const invalidIds = participantIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return res.status(400).json(new ApiResponse(400, "Invalid participant IDs"));
  }

  const group = await createGroupService(req.user.id, {
    groupName,
    groupDescription,
    participantIds,
  });

  res.status(201).json(
    new ApiResponse(201, "Group created successfully", group)
  );
});

const getGroupDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid group id"));
  }

  const group = await getGroupDetailsService(groupId, req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Group details retrieved", group)
  );
});

const addGroupMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid group or user id"));
  }

  const result = await addGroupMemberService(groupId, userId, req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Member added successfully", result)
  );
});

const removeGroupMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid group or user id"));
  }

  const result = await removeGroupMemberService(groupId, userId, req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Member removed successfully", result)
  );
});

const updateGroupInfo = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { groupName, groupDescription, groupImage } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid group id"));
  }

  const updateData = {};
  if (groupName) updateData.groupName = groupName;
  if (groupDescription) updateData.groupDescription = groupDescription;
  if (groupImage) updateData.groupImage = groupImage;

  const result = await updateGroupInfoService(groupId, updateData, req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Group updated successfully", result)
  );
});

module.exports = {
  listMyConversations,
  getConversationWithUser,
  createGroup,
  getGroupDetails,
  addGroupMember,
  removeGroupMember,
  updateGroupInfo,
};
