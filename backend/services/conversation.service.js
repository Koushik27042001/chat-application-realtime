const conversationRepository = require("../repositories/conversation.repository");
const { createDefaultAvatar } = require("../utils/avatar");

const mapGroupParticipants = (participants = []) =>
  participants.map((participant) => ({
    id: participant._id.toString(),
    name: participant.name,
    email: participant.email,
    avatar: participant.avatar || createDefaultAvatar(participant.name),
  }));

const mapGroupConversation = (conversation) => {
  const participants = mapGroupParticipants(conversation.participants || []);
  const adminId =
    conversation.groupAdmin?._id?.toString?.() ||
    conversation.groupAdmin?.toString?.() ||
    "";

  return {
    id: conversation._id.toString(),
    name: conversation.groupName,
    email: "",
    avatar: conversation.groupImage || "👥",
    conversationId: conversation._id.toString(),
    lastMessage: conversation.lastMessageText || "No messages yet",
    lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
    isGroup: true,
    participants,
    admin: adminId
      ? participants.find((p) => p.id === adminId) || {
          _id: adminId,
          name: conversation.groupAdmin?.name || "Admin",
        }
      : null,
  };
};

const listMyConversationsService = async (currentUserId) => {
  const conversations = await conversationRepository.findManyByParticipant(currentUserId);

  return conversations
    .map((conversation) => {
      if (conversation.isGroup) {
        return mapGroupConversation(conversation);
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

const createGroupService = async (currentUserId, groupData) => {
  const { groupName, groupDescription, participantIds } = groupData;
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

  const hydratedGroup = await conversationRepository.findGroupById(newGroup._id);
  return mapGroupConversation(hydratedGroup);
};

const getGroupDetailsService = async (groupId, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  const isMember = group.participants.some(
    (p) => String(p._id) === String(currentUserId)
  );

  if (!isMember) {
    throw new Error("User is not a member of this group");
  }

  return {
    ...mapGroupConversation(group),
    description: group.groupDescription,
  };
};

const addGroupMemberService = async (groupId, userId, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  if (String(group.groupAdmin._id) !== String(currentUserId)) {
    throw new Error("Only group admin can add members");
  }

  await conversationRepository.addGroupMember(groupId, userId);
  const updatedGroup = await conversationRepository.findGroupById(groupId);

  return {
    ...mapGroupConversation(updatedGroup),
    description: updatedGroup.groupDescription,
  };
};

const removeGroupMemberService = async (groupId, userId, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  if (
    String(group.groupAdmin._id) !== String(currentUserId) &&
    String(userId) !== String(currentUserId)
  ) {
    throw new Error("Only group admin can remove members");
  }

  await conversationRepository.removeGroupMember(groupId, userId);
  const updatedGroup = await conversationRepository.findGroupById(groupId);

  return {
    ...mapGroupConversation(updatedGroup),
    description: updatedGroup.groupDescription,
  };
};

const updateGroupInfoService = async (groupId, updateData, currentUserId) => {
  const group = await conversationRepository.findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  if (String(group.groupAdmin._id) !== String(currentUserId)) {
    throw new Error("Only group admin can update group info");
  }

  const updatedGroup = await conversationRepository.updateGroupInfo(
    groupId,
    updateData
  );

  return {
    ...mapGroupConversation(updatedGroup),
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
