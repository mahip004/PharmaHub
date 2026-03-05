const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");

function getUserId(req) {
  return req.user?.id || req.user?._id;
}

const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

/** POST /api/orders - create order from cart */
async function createOrder(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { shippingAddress, paymentMethod = "card" } = req.body;

    const mem = memory();
    if (mem) {
      const cart = mem.getOrCreateCart(userId);
      if (!cart.items || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });
      const orderItems = [];
      let totalAmount = 0;
      for (const item of cart.items) {
        const med = mem.findMedicineById(item.medicineId);
        if (!med) continue;
        const qty = Math.min(item.quantity, med.med_quantity || 0);
        if (qty <= 0) continue;
        const price = med.med_price || 0;
        orderItems.push({ medicineId: med._id, name: med.med_name, quantity: qty, price });
        totalAmount += price * qty;
        mem.decrementMedicineStock(med._id, qty);
      }
      if (orderItems.length === 0) return res.status(400).json({ message: "No valid items in cart" });
      const order = mem.createOrder(userId, orderItems, totalAmount, shippingAddress, paymentMethod);
      mem.clearCart(userId);
      return res.status(201).json({ message: "Order created", orderId: order._id, totalAmount, items: orderItems });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const orderItems = [];
    let totalAmount = 0;
    for (const item of cart.items) {
      const med = await Medicine.findById(item.medicineId);
      if (!med) continue;
      const qty = Math.min(item.quantity, med.med_quantity || 0);
      if (qty <= 0) continue;
      const price = med.med_price || 0;
      orderItems.push({ medicineId: med._id, name: med.med_name, quantity: qty, price });
      totalAmount += price * qty;
      await Medicine.findByIdAndUpdate(med._id, { $inc: { med_quantity: -qty } });
    }
    if (orderItems.length === 0) return res.status(400).json({ message: "No valid items in cart" });

    const order = new Order({ userId, items: orderItems, totalAmount, status: "pending", paymentMethod, shippingAddress: shippingAddress || {} });
    await order.save();
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    res.status(201).json({ message: "Order created", orderId: order._id, totalAmount, items: orderItems });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** GET /api/orders */
async function getMyOrders(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const mem = memory();
    if (mem) return res.json(mem.getOrdersByUser(userId));
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** GET /api/orders/:id */
async function getOrderById(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const mem = memory();
    if (mem) {
      const order = mem.getOrderById(req.params.id, userId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      return res.json(order);
    }
    const order = await Order.findOne({ _id: req.params.id, userId }).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** PATCH /api/orders/:id/status */
async function updateOrderStatus(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { status } = req.body;
    const allowed = ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"];
    if (!status || !allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const mem = memory();
    if (mem) {
      const order = mem.updateOrderStatus(req.params.id, userId, status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      return res.json(order);
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
