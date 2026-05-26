const Notification = require("../models/Notification");

const onlineUsers = new Map();

const emitToUser = (io, userId, event, payload) => {
    const receiverSocketId = onlineUsers.get(String(userId));
    if (receiverSocketId) {
        io.to(receiverSocketId).emit(event, payload);
        return true;
    }
    return false;
};

const createAndEmitNotification = async (io, payload) => {
    try {
        const notification = await Notification.create(payload);
        emitToUser(io, payload.userId.toString(), "notification", {
            _id: notification._id,
            userId: notification.userId,
            type: notification.type,
            content: notification.content,
            meta: notification.meta || {},
            isRead: notification.isRead,
            createdAt: notification.createdAt,
        });
    } catch (error) {
        console.error("Notification error:", error.message);
    }
};

const initializeSocket = (io) => {
    io.on("connection", (socket) => {

        console.log("⚡ User connected:", socket.id);

        // ✅ USER JOIN
        socket.on("join", (userId) => {
            if (!userId) return;

            const normalizedUserId = String(userId);
            onlineUsers.set(normalizedUserId, socket.id);
            socket.data.userId = normalizedUserId;

            io.emit("online-users", Array.from(onlineUsers.keys()));
        });

        // ✅ SEND MESSAGE (REAL-TIME)
        socket.on("private-message", ({ receiverId, message }) => {
            const receiverSocketId = onlineUsers.get(String(receiverId));

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receive-message", message);
            }

            if (receiverId) {
                const preview = typeof message?.content === "string"
                    ? message.content.slice(0, 160)
                    : "New message";
                createAndEmitNotification(io, {
                    userId: receiverId,
                    type: "MESSAGE",
                    content: preview,
                    meta: {
                        senderId: message?.sender?.toString?.() ?? message?.sender,
                        conversationId: message?.conversationId,
                    },
                });
            }
        });

        // ✅ MESSAGE SEEN (NEW 🔥)
        socket.on("mark-seen", ({ conversationId, userId }) => {
            socket.broadcast.emit("message-seen", {
                conversationId,
                userId,
            });
        });

        // ✅ TYPING INDICATOR (NEW 🔥)
        socket.on("typing", ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(String(receiverId));

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing");
            }
        });

        socket.on("stop-typing", ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(String(receiverId));

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stop-typing");
            }
        });

        // ✅ CALL SIGNALING (WEBRTC)
        socket.on("call:offer", ({ to, offer, from, callType }) => {
            if (!to || !offer || !from) return;
            const toId = String(to);
            const fromId = String(from);
            const delivered = emitToUser(io, toId, "call:incoming", {
                from: fromId,
                offer,
                callType: callType || "video",
            });

            if (!delivered) {
                emitToUser(io, fromId, "call:unavailable", { to: toId });
            }

            createAndEmitNotification(io, {
                userId: toId,
                type: "CALL",
                content: `Incoming ${callType === "audio" ? "audio" : "video"} call`,
                meta: { from: fromId, callType: callType || "video" },
            });
        });

        socket.on("call:answer", ({ to, answer, from }) => {
            if (!to || !answer || !from) return;
            emitToUser(io, String(to), "call:accepted", { from: String(from), answer });
        });

        socket.on("call:decline", ({ to, from }) => {
            if (!to || !from) return;
            emitToUser(io, String(to), "call:declined", { from: String(from) });
        });

        socket.on("call:hangup", ({ to, from }) => {
            if (!to || !from) return;
            emitToUser(io, String(to), "call:ended", { from: String(from) });
        });

        socket.on("call:busy", ({ to, from }) => {
            if (!to || !from) return;
            emitToUser(io, String(to), "call:busy", { from: String(from) });
        });

        socket.on("call:ice", ({ to, candidate, from }) => {
            if (!to || !candidate || !from) return;
            emitToUser(io, String(to), "call:ice", { from: String(from), candidate });
        });

        // ✅ DISCONNECT
        socket.on("disconnect", () => {
            const userId = socket.data?.userId;
            if (userId) {
                onlineUsers.delete(userId);
            } else {
                for (const [id, socketId] of onlineUsers.entries()) {
                    if (socketId === socket.id) {
                        onlineUsers.delete(id);
                        break;
                    }
                }
            }

            io.emit("online-users", Array.from(onlineUsers.keys()));

            console.log("❌ User disconnected:", socket.id);
        });
    });
};

module.exports = initializeSocket;
