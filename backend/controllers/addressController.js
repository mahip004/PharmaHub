const Address = require("../models/Address");

function getUserId(req) {
  return req.user?.id || req.user?._id;
}

const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

/** GET /api/addresses */
async function getAddresses(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const mem = memory();
    if (mem) return res.json(mem.getAddresses(userId));
    const list = await Address.find({ userId }).sort({ isDefault: -1 }).lean();
    res.json(list);
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** POST /api/addresses */
async function addAddress(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { street, city, state, pincode, phone, isDefault } = req.body;
    if (!street || !city || !state || !pincode || !phone) return res.status(400).json({ message: "Missing required address fields" });
    const mem = memory();
    if (mem) return res.status(201).json(mem.addAddress(userId, { street, city, state, pincode, phone, isDefault }));
    if (isDefault) await Address.updateMany({ userId }, { isDefault: false });
    const addr = new Address({ userId, street, city, state, pincode, phone, isDefault: !!isDefault });
    await addr.save();
    res.status(201).json(addr);
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** PUT /api/addresses/:id */
async function updateAddress(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { street, city, state, pincode, phone, isDefault } = req.body;
    const mem = memory();
    if (mem) {
      const addr = mem.updateAddress(req.params.id, userId, { street, city, state, pincode, phone, isDefault });
      if (!addr) return res.status(404).json({ message: "Address not found" });
      return res.json(addr);
    }
    const addr = await Address.findOne({ _id: req.params.id, userId });
    if (!addr) return res.status(404).json({ message: "Address not found" });
    if (street !== undefined) addr.street = street;
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (pincode !== undefined) addr.pincode = pincode;
    if (phone !== undefined) addr.phone = phone;
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
      addr.isDefault = true;
    }
    await addr.save();
    res.json(addr);
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
};
