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
      const baseName = (m.name || "").trim();
      if (!baseName) continue;

      const shortName = baseName.replace(/\s+\d+.*$/, "").trim();
      const escapedBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedShort = shortName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      console.log(`[Cart] Processing: "${baseName}"`);

      let medicine = m.medicineId
        ? await Medicine.findById(m.medicineId)
        : await Medicine.findOne({ med_name: { $regex: new RegExp(escapedBase, "i") } }) ||
        await Medicine.findOne({ med_name: { $regex: new RegExp(escapedShort, "i") } });

      if (!medicine) {
        console.log(`[Cart] No match for: "${baseName}"`);
        notFound.push(baseName);
        continue;
      }

      if ((medicine.med_quantity || 0) < qty) {
        console.log(`[Cart] Out of stock: "${medicine.med_name}"`);
        notFound.push(`${baseName} (Insufficient stock)`);
        continue;
      }

      console.log(`[Cart] Adding to DB: "${medicine.med_name}"`);
      const existing = cart.items.find((i) => i.medicineId?.toString() === medicine._id.toString());
      if (existing) existing.quantity += qty;
      else cart.items.push({ medicineId: medicine._id, quantity: qty, name: medicine.med_name, price: medicine.med_price });
      added.push(medicine.med_name);
    }

    cart.updatedAt = new Date();
    await cart.save();
    console.log(`[Cart] Saved. Added count: ${added.length}`);

    const populated = await Cart.findById(cart._id).populate("items.medicineId").lean();
    const items = (populated?.items || []).map((item) => ({
      medicineId: item.medicineId?._id || item.medicineId,
      quantity: item.quantity,
      name: item.medicineId?.med_name ?? item.name,
      price: item.medicineId?.med_price ?? item.price,
    }));

    // Return 200 even if none found, to avoid "404" confusion in console
    res.json({
      success: added.length > 0,
      message: added.length > 0
        ? `Added to cart: ${added.join(", ")}${notFound.length ? ". Not found: " + notFound.join(", ") : ""}`
        : `Could not find any matching medicines in inventory. Was searching for: ${notFound.join(", ")}`,
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
