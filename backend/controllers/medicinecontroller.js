const Medicine = require("../models/Medicine");

const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

const getAllMedicines = async (req, res) => {
  try {
    const mem = memory();
    if (mem) return res.json(mem.getMedicines());
    const medicines = await Medicine.find({});
    res.json(medicines);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const searchMedicine = async (req, res) => {
  const { name } = req.query;
  try {
    const mem = memory();
    if (mem) {
      const medicine = mem.findMedicineByName(name) || mem.getMedicines().find((m) => m.med_name && m.med_name.toLowerCase().includes((name || "").toLowerCase()));
      if (medicine) return res.status(200).json(medicine);
      return res.status(404).json({ message: "Medicine not found" });
    }
    const medicine = await Medicine.findOne({
      med_name: { $regex: name, $options: "i" },
    });
    if (medicine) res.status(200).json(medicine);
    else res.status(404).json({ message: "Medicine not found" });
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};

const createMedicine = async (req, res) => {
  try {
    const { med_name, med_desc, usage, dosage, side_effects, med_price, med_quantity } = req.body;
    if (!med_name) return res.status(400).json({ message: "Medicine name required" });
    const mem = memory();
    if (mem) {
      const med = {
        _id: mem.id(),
        med_name: med_name || "",
        med_desc: med_desc || "",
        usage: usage || "",
        dosage: dosage || "",
        side_effects: side_effects || "",
        med_price: Number(med_price) || 0,
        med_quantity: Number(med_quantity) || 0,
      };
      mem.store.medicines.push(med);
      return res.status(201).json(med);
    }
    const med = new Medicine({
      med_name,
      med_desc,
      usage,
      dosage,
      side_effects,
      med_price: Number(med_price) || 0,
      med_quantity: Number(med_quantity) || 0,
    });
    await med.save();
    res.status(201).json(med);
  } catch (error) {
    console.error("Error creating medicine:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const mem = memory();
    if (mem) {
      const med = mem.store.medicines.find((m) => m._id === id || m._id?.toString() === id);
      if (!med) return res.status(404).json({ message: "Medicine not found" });
      if (body.med_name !== undefined) med.med_name = body.med_name;
      if (body.med_desc !== undefined) med.med_desc = body.med_desc;
      if (body.usage !== undefined) med.usage = body.usage;
      if (body.dosage !== undefined) med.dosage = body.dosage;
      if (body.side_effects !== undefined) med.side_effects = body.side_effects;
      if (body.med_price !== undefined) med.med_price = Number(body.med_price);
      if (body.med_quantity !== undefined) med.med_quantity = Number(body.med_quantity);
      return res.json(med);
    }
    const med = await Medicine.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    res.json(med);
  } catch (error) {
    console.error("Error updating medicine:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const mem = memory();
    if (mem) {
      const idx = mem.store.medicines.findIndex((m) => m._id === id || m._id?.toString() === id);
      if (idx === -1) return res.status(404).json({ message: "Medicine not found" });
      mem.store.medicines.splice(idx, 1);
      return res.status(200).json({ message: "Deleted" });
    }
    const med = await Medicine.findByIdAndDelete(id);
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllMedicines,
  searchMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
