const onlineUsers = new Map();

const initializeSocket = (io) => {
    io.on("connection", (socket) => {

        console.log("⚡ User connected:", socket.id);

        // ✅ USER JOIN
        socket.on("join", (userId) => {
            if (!userId) return;

            onlineUsers.set(userId, socket.id);

            io.emit("online-users", Array.from(onlineUsers.keys()));
        });

        // ✅ SEND MESSAGE (REAL-TIME)
        socket.on("private-message", ({ receiverId, message }) => {
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receive-message", message);
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
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing");
            }
        });

        socket.on("stop-typing", ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stop-typing");
            }
        });

        // ✅ DISCONNECT
        socket.on("disconnect", () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }

            io.emit("online-users", Array.from(onlineUsers.keys()));

            console.log("❌ User disconnected:", socket.id);
        });
    });
};

module.exports = initializeSocket;