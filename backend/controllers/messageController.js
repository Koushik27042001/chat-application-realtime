const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

<<<<<<< HEAD
const normalizeMessage = (message) => ({
  id: message._id,
  _id: message._id,
  senderId: message.senderId?.toString?.() || message.senderId,
  receiverId: message.receiverId?.toString?.() || message.receiverId,
  text: message.text,
  sender: message.senderId?.toString?.() || message.senderId,
  receiver: message.receiverId?.toString?.() || message.receiverId,
  content: message.text,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, content } = req.body;
    const messageText = text || content;

    if (!receiverId || !messageText) {
      return res
        .status(400)
        .json({ message: "receiverId and text are required" });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: messageText,
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        lastMessage: message._id,
      });
    } else {
      conversation.lastMessage = message._id;
      await conversation.save();
    }

    return res.status(201).json({
      conversation,
      message: normalizeMessage(message),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages.map(normalizeMessage));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
=======
// ✅ SEND MESSAGE
const sendMessage = async(req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res
                .status(400)
                .json({ message: "receiverId and content are required" });
        }

        // 🔍 Find conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, receiverId] },
        });

        // 🆕 Create conversation if not exists
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user.id, receiverId],
                unreadCounts: {},
            });
        }

        // 💬 Create message
        const message = await Message.create({
            conversationId: conversation._id, // 🔥 IMPORTANT
            sender: req.user.id,
            receiver: receiverId,
            content,
            status: "sent",
        });

        // 🔥 Update conversation (OPTIMIZED)
        conversation.lastMessage = message._id;
        conversation.lastMessageText = content;
        conversation.lastMessageAt = new Date();

        // 🔥 unread count update
        const receiverIdStr = receiverId.toString();
        const currentCount = conversation.unreadCounts.get(receiverIdStr) || 0;
        conversation.unreadCounts.set(receiverIdStr, currentCount + 1);

        await conversation.save();

        return res.status(201).json({ conversation, message });

    } catch (error) {
        console.error("Send Message Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

// ✅ GET MESSAGES (WITH PAGINATION)
const getMessages = async(req, res) => {
    try {
        const { conversationId, page = 0, limit = 20 } = req.query;

        if (!conversationId) {
            return res
                .status(400)
                .json({ message: "conversationId is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: "Invalid conversationId" });
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 }) // latest first
            .skip(page * limit)
            .limit(Number(limit))
            .lean();

        return res.status(200).json(messages.reverse()); // oldest first for UI

    } catch (error) {
        console.error("Get Messages Error:", error);
        return res.status(500).json({ message: error.message });
    }
>>>>>>> 1e7ed06a06e5b054829de5c2a39cbc3fdb71fc19
};

module.exports = {
    sendMessage,
    getMessages,
};