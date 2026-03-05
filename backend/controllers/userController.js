const userModel = require("../models/userModel");

const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

function sanitizeUser(u) {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
}

const getAllUsers = async (req, res) => {
  try {
    const mem = memory();
    if (mem) return res.status(200).json((mem.store.users || []).map(sanitizeUser));
    const users = await userModel.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const mem = memory();
    if (mem) {
      const user = (mem.store.users || []).find((u) => u._id === id || u._id?.toString() === id);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json(sanitizeUser(user));
    }
    const user = await userModel.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || req.user?._id;
  if (userId !== id) return res.status(403).json({ message: "Forbidden" });
  const { firstName, lastName, phone, gender } = req.body;
  try {
    const mem = memory();
    if (mem) {
      const user = mem.store.users.find((u) => u._id === id || u._id?.toString() === id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (gender !== undefined) user.gender = gender;
      return res.status(200).json(sanitizeUser(user));
    }
    const user = await userModel.findByIdAndUpdate(
      id,
      { $set: { firstName, lastName, phone, gender } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
};