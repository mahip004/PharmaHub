const express = require("express");
const router = express.Router();
const { jwtMiddleware } = require("../middleware/jwtMiddleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  addFromPrescription,
} = require("../controllers/cartController");

router.get("/", jwtMiddleware, getCart);
router.post("/", jwtMiddleware, addToCart);
router.put("/", jwtMiddleware, updateCartItem);
router.post("/add-from-prescription", jwtMiddleware, addFromPrescription);

module.exports = router;
