const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");

function getUserId(req) {
  return req.user?.id || req.user?._id;
}

const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

async function getOrCreateCart(userId) {
  const mem = memory();
  if (mem) return mem.getOrCreateCart(userId);
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
}

/** GET /api/cart */
async function getCart(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const mem = memory();
    if (mem) {
      const items = mem.getCartItems(userId);
      const cart = mem.getOrCreateCart(userId);
      return res.json({ items, updatedAt: cart.updatedAt });
    }
    const cart = await getOrCreateCart(userId);
    const populated = await Cart.findById(cart._id).populate("items.medicineId").lean();
    const items = (populated?.items || []).map((item) => ({
      medicineId: item.medicineId?._id || item.medicineId,
      quantity: item.quantity,
      name: item.medicineId?.med_name ?? item.name,
      price: item.medicineId?.med_price ?? item.price,
    }));
    res.json({ items, updatedAt: cart.updatedAt });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** POST /api/cart - body: { medicineId, quantity } */
async function addToCart(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { medicineId, quantity = 1 } = req.body;
    if (!medicineId) return res.status(400).json({ message: "medicineId required" });

    const mem = memory();
    if (mem) {
      const medicine = mem.findMedicineById(medicineId);
      if (!medicine) return res.status(404).json({ message: "Medicine not found" });
      if ((medicine.med_quantity || 0) < quantity) return res.status(400).json({ message: "Insufficient stock" });
      const items = mem.addToCart(userId, medicineId, quantity, medicine.med_name, medicine.med_price);
      return res.json({ message: "Added to cart", items });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    if ((medicine.med_quantity || 0) < quantity) return res.status(400).json({ message: "Insufficient stock" });
    const cart = await getOrCreateCart(userId);
    const existing = cart.items.find((i) => i.medicineId?.toString() === medicineId.toString());
    if (existing) existing.quantity += quantity;
    else cart.items.push({ medicineId: medicine._id, quantity, name: medicine.med_name, price: medicine.med_price });
    cart.updatedAt = new Date();
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.medicineId").lean();
    const items = (populated?.items || []).map((item) => ({
      medicineId: item.medicineId?._id || item.medicineId,
      quantity: item.quantity,
      name: item.medicineId?.med_name ?? item.name,
      price: item.medicineId?.med_price ?? item.price,
    }));
    res.json({ message: "Added to cart", items });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** PUT /api/cart - body: { medicineId, quantity } (quantity 0 = remove) */
async function updateCartItem(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { medicineId, quantity } = req.body;
    if (!medicineId) return res.status(400).json({ message: "medicineId required" });

    const mem = memory();
    if (mem) {
      const items = mem.updateCartItem(userId, medicineId, quantity);
      if (items === null) return res.status(404).json({ message: "Item not in cart" });
      const med = mem.findMedicineById(medicineId);
      if (quantity > 0 && med && (med.med_quantity || 0) < quantity) return res.status(400).json({ message: "Insufficient stock" });
      return res.json({ items });
    }

    const cart = await getOrCreateCart(userId);
    const idx = cart.items.findIndex((i) => i.medicineId?.toString() === medicineId.toString());
    if (idx === -1) return res.status(404).json({ message: "Item not in cart" });
    if (!quantity || quantity <= 0) cart.items.splice(idx, 1);
    else {
      const medicine = await Medicine.findById(medicineId);
      if (medicine && (medicine.med_quantity || 0) < quantity) return res.status(400).json({ message: "Insufficient stock" });
      cart.items[idx].quantity = quantity;
    }
    cart.updatedAt = new Date();
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.medicineId").lean();
    const items = (populated?.items || []).map((item) => ({
      medicineId: item.medicineId?._id || item.medicineId,
      quantity: item.quantity,
      name: item.medicineId?.med_name ?? item.name,
      price: item.medicineId?.med_price ?? item.price,
    }));
    res.json({ items });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** POST /api/cart/add-from-prescription */
async function addFromPrescription(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { medicines } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) return res.status(400).json({ message: "medicines array required" });

    const mem = memory();
    if (mem) {
      const items = mem.addFromPrescriptionCart(userId, medicines);
      return res.json({ message: "Added prescription medicines to cart", items });
    }

    const cart = await getOrCreateCart(userId);
    const added = [];
    const notFound = [];

    for (const m of medicines) {
      const qty = m.quantity || 1;
      // Strip trailing numbers from brand names (e.g., "Zoclar 500" → try "Zoclar 500" first, then "Zoclar")
      const baseName = (m.name || "").trim();
      const shortName = baseName.replace(/\s+\d+.*$/, "").trim();

      console.log(`[Prescription Cart] Searching for: "${baseName}" (short: "${shortName}")`);

      let medicine = m.medicineId
        ? await Medicine.findById(m.medicineId)
        : await Medicine.findOne({ med_name: { $regex: new RegExp(baseName, "i") } }) ||
        await Medicine.findOne({ med_name: { $regex: new RegExp(shortName, "i") } });

      if (!medicine) {
        console.log(`[Prescription Cart] Not found in DB: "${baseName}"`);
        notFound.push(baseName);
        continue;
      }
      if ((medicine.med_quantity || 0) < qty) {
        console.log(`[Prescription Cart] Insufficient stock for: "${medicine.med_name}"`);
        notFound.push(`${baseName} (out of stock)`);
        continue;
      }

      console.log(`[Prescription Cart] Adding: "${medicine.med_name}" x${qty}`);
      const existing = cart.items.find((i) => i.medicineId?.toString() === medicine._id.toString());
      if (existing) existing.quantity += qty;
      else cart.items.push({ medicineId: medicine._id, quantity: qty, name: medicine.med_name, price: medicine.med_price });
      added.push(medicine.med_name);
    }

    cart.updatedAt = new Date();
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.medicineId").lean();
    const items = (populated?.items || []).map((item) => ({
      medicineId: item.medicineId?._id || item.medicineId,
      quantity: item.quantity,
      name: item.medicineId?.med_name ?? item.name,
      price: item.medicineId?.med_price ?? item.price,
    }));

    if (added.length === 0) {
      return res.status(404).json({
        message: `None of the medicines from the prescription were found in our inventory. Not found: ${notFound.join(", ")}`,
        items,
        added,
        notFound,
      });
    }

    res.json({
      message: `Added to cart: ${added.join(", ")}${notFound.length ? ". Not in inventory: " + notFound.join(", ") : ""}`,
      items,
      added,
      notFound,
    });
  } catch (err) {
    console.error("Add from prescription error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  addFromPrescription,
};
