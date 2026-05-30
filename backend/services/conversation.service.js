const mongoose = require("mongoose");
const conversationRepository = require("../repositories/conversation.repository");

const { createDefaultAvatar } = require("../utils/avatar");

const listMyConversationsService = async (currentUserId) => {
  const conversations = await conversationRepository.findManyByParticipant(currentUserId);

  return conversations
    .map((conversation) => {
      if (conversation.isGroup) {
        return {
          id: conversation._id.toString(),
          name: conversation.groupName,
          email: "",
          avatar: conversation.groupImage || "👥",
          conversationId: conversation._id.toString(),
          lastMessage: conversation.lastMessageText || "No messages yet",
          lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
          isGroup: true,
        };
      }

      const otherParticipant = (conversation.participants || []).find(
        (participant) => String(participant._id) !== String(currentUserId)
      );

      if (!otherParticipant) {
        return null;
      }

      return {
        id: otherParticipant._id.toString(),
        name: otherParticipant.name,
        email: otherParticipant.email,
        avatar: otherParticipant.avatar || createDefaultAvatar(otherParticipant.name),
        conversationId: conversation._id.toString(),
        lastMessage: conversation.lastMessageText || "Tap to start chatting.",
        lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
        isGroup: false,
      };
    })
    .filter(Boolean);
};

const getConversationWithUserService = async (currentUserId, targetUserId) => {
  const conversation = await conversationRepository.findByParticipantsSelect(
    [currentUserId, targetUserId],
    "_id participants lastMessage updatedAt"
  );

  if (!conversation) {
    return { conversationId: null };
  }

  return {
    conversationId: conversation._id.toString(),
  };
};

// 🔥 GROUP SERVICES
const createGroupService = async (currentUserId, groupData) => {
  const { groupName, groupDescription, participantIds } = groupData;

  // Ensure current user is included in the group
  const allParticipants = Array.from(new Set([currentUserId, ...participantIds]));

  const newGroup = await conversationRepository.createGroup({
    isGroup: true,
    groupName,
    groupDescription,
    groupAdmin: currentUserId,
    participants: allParticipants,
    lastMessageText: "",
    lastMessageAt: new Date(),
  });

  return {
    id: newGroup._id.toString(),
    name: newGroup.groupName,
    description: newGroup.groupDescription,
    admin: newGroup.groupAdmin,
    participants: newGroup.participants,
    conversationId: newGroup._id.toString(),
    isGroup: true,
  };
};

const getGroupDetailsService = async (groupId, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if user is a member
  const isMember = group.participants.some(
    (p) => String(p._id) === String(currentUserId)
  );

  if (!isMember) {
    throw new Error("User is not a member of this group");
  }

  return {
    id: group._id.toString(),
    name: group.groupName,
    description: group.groupDescription,
    admin: group.groupAdmin,
    participants: group.participants.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      email: p.email,
      avatar: p.avatar,
    })),
    conversationId: group._id.toString(),
    isGroup: true,
  };
};

const addGroupMemberService = async (groupId, userId, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if current user is admin
  if (String(group.groupAdmin._id) !== String(currentUserId)) {
    throw new Error("Only group admin can add members");
  }

  const updatedGroup = await conversationRepository.addGroupMember(groupId, userId);

  return {
    id: updatedGroup._id.toString(),
    participants: updatedGroup.participants,
  };
};

const removeGroupMemberService = async (groupId, userId, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if current user is admin or removing themselves
  if (
    String(group.groupAdmin._id) !== String(currentUserId) &&
    String(userId) !== String(currentUserId)
  ) {
    throw new Error("Only group admin can remove members");
  }

  const updatedGroup = await conversationRepository.removeGroupMember(groupId, userId);

  return {
    id: updatedGroup._id.toString(),
    participants: updatedGroup.participants,
  };
};

const updateGroupInfoService = async (groupId, updateData, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if current user is admin
  if (String(group.groupAdmin._id) !== String(currentUserId)) {
    throw new Error("Only group admin can update group info");
  }

  const updatedGroup = await conversationRepository.updateGroupInfo(
    groupId,
    updateData
  );

  return {
    id: updatedGroup._id.toString(),
    name: updatedGroup.groupName,
    description: updatedGroup.groupDescription,
  };
};

module.exports = {
  listMyConversationsService,
  getConversationWithUserService,
  createGroupService,
  getGroupDetailsService,
  addGroupMemberService,
  removeGroupMemberService,
  updateGroupInfoService,
};
