const express = require("express");
const { getAllUsers, getUserById, updateUserById } = require("../controllers/userController");
const { jwtMiddleware } = require("../middleware/jwtMiddleware");

const router = express.Router();

router.get("/getAllUser", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", jwtMiddleware, updateUserById);

module.exports = router;
