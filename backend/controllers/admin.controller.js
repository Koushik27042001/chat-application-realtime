const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const User = require("../models/User");
const Message = require("../models/Message");

const startOfUtcDay = (d = new Date()) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const buildLoginActivitySeries = async () => {
  const days = 7;
  const today = startOfUtcDay();
  const ranges = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = new Date(today);
    dayStart.setUTCDate(dayStart.getUTCDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    ranges.push({ dayStart, dayEnd });
  }

  const counts = await Promise.all(
    ranges.map(({ dayStart, dayEnd }) =>
      User.countDocuments({
        lastLogin: { $gte: dayStart, $lt: dayEnd },
      })
    )
  );

  return ranges.map((r, idx) => ({
    label: r.dayStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    date: r.dayStart.toISOString().slice(0, 10),
    logins: counts[idx],
  }));
};

const getAnalytics = asyncHandler(async (req, res) => {
  const dayStart = startOfUtcDay();
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalUsers, activeUsers, messagesToday, totalMessages, users, loginActivity] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: last24h } }),
      Message.countDocuments({ createdAt: { $gte: dayStart } }),
      Message.countDocuments(),
      User.find()
        .select("name email role lastLogin createdAt")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
      buildLoginActivitySeries(),
    ]);

  const payload = {
    totalUsers,
    activeUsers,
    messagesToday,
    totalMessages,
    loginActivity,
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role || "user",
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    })),
  };

  res.status(200).json(new ApiResponse(200, "Analytics retrieved", payload));
});

module.exports = {
  getAnalytics,
};
