const express = require("express");
const router = express.Router();
const { jwtMiddleware } = require("../middleware/jwtMiddleware");
const {
  getAddresses,
  addAddress,
  updateAddress,
} = require("../controllers/addressController");

router.get("/", jwtMiddleware, getAddresses);
router.post("/", jwtMiddleware, addAddress);
router.put("/:id", jwtMiddleware, updateAddress);

module.exports = router;
