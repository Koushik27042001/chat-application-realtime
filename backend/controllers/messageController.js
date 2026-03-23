const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

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
};

module.exports = {
    sendMessage,
    getMessages,
};