require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const initializeSocket = require("./socket/socket");

const app = express();

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET missing");
    process.exit(1);
}

const allowedOrigin =
    process.env.CLIENT_URL ||
    "https://chat-application-realtime-ruddy.vercel.app";

app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ["websocket", "polling"],
});

initializeSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("Connecting to MongoDB...");

        await connectDB();

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server failed:", error.message);
        process.exit(1);
    }
};

startServer();
