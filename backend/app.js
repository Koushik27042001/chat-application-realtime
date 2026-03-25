const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/error.middleware");
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");

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

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (res.statusCode >= 500) {
      console.error(`[${res.statusCode}] ${req.method} ${req.originalUrl}`);
    }
  });
  next();
});

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

app.use(errorHandler);

module.exports = app;
