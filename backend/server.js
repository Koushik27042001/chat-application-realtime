const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const initializeSocket = require("./socket/socket");

dotenv.config();

const app = express();

// ✅ Allowed origin (Vercel frontend)
const allowedOrigin =
    process.env.CLIENT_URL || "https://chat-application-realtime-ruddy.vercel.app";

// ✅ Middleware
app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);

app.use(express.json());

// ✅ Health & root route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// ✅ Create server
const server = http.createServer(app);

// ✅ Socket.io setup (IMPORTANT)
const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ["websocket", "polling"],
});

// ✅ Initialize socket
initializeSocket(io);

// ✅ PORT
const PORT = process.env.PORT || 5000;

// ✅ Start server
const startServer = async() => {
    try {
        await connectDB();

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server start failed:", error.message);
        process.exit(1);
    }
};

startServer();