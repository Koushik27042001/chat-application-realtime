const createDefaultAvatar = (name = "User") => {
  const seed = encodeURIComponent(String(name).trim() || "User");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
};

module.exports = { createDefaultAvatar };
