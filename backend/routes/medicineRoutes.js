const express = require("express");
const router = express.Router();
const {
  getAllMedicines,
  searchMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicinecontroller");

router.get("/", getAllMedicines);
router.get("/search", searchMedicine);
router.post("/", createMedicine);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

module.exports = router;
