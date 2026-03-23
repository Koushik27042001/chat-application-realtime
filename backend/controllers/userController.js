const mongoose = require("mongoose");

const User = require("../models/User");

const listUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filters = [{ _id: { $ne: req.user.id } }];

    if (search) {
      const trimmed = search.trim();

      const orFilters = [
        { name: { $regex: trimmed, $options: "i" } },
        { email: { $regex: trimmed, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(trimmed)) {
        orFilters.push({ _id: trimmed });
      }

      filters.push({ $or: orFilters });
    }

    const users = await User.find(filters.length ? { $and: filters } : {})
      .select("_id name email avatar createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot request yourself" });
    }

    const user = await User.findById(id).select("_id name email avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listUsers,
  getUserById,
};
