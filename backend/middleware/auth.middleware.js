const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");
const { createDefaultAvatar } = require("../utils/avatar");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ status: "error", message: "No token" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type && decoded.type !== "access") {
      return res.status(401).json({ status: "error", message: "Invalid token type" });
    }

    const user = await userRepository.findById(decoded.id || decoded.userId);

    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || createDefaultAvatar(user.name),
      role: user.role || "user",
    };

    next();
  } catch (error) {
    const message = error?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ status: "error", message });
  }
};

module.exports = auth;
module.exports.auth = auth;
module.exports.protect = auth;
