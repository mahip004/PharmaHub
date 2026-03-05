const express = require("express");
const router = express.Router();
const { jwtMiddleware } = require("../middleware/jwtMiddleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", jwtMiddleware, createOrder);
router.get("/", jwtMiddleware, getMyOrders);
router.get("/:id", jwtMiddleware, getOrderById);
router.patch("/:id/status", jwtMiddleware, updateOrderStatus);

module.exports = router;
