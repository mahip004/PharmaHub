const Prescription = require("../models/Prescription");
const Medicine = require("../models/Medicine");
const {
  extractTextFromImage,
  getStructuredMedicines,
  extractVisionDirect,
} = require("../utils/fastapiClient");

const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

/** Fuzzy match medicine name; returns Medicine doc or null */
async function fuzzyMatchMedicine(name) {
  const mem = memory();
  if (!name || !name.trim()) return null;

  // Clean prefix like "TAB. ", "CAP. ", etc.
  const cleaned = name.trim()
    .replace(/^[ ,.]+/, "")
    .replace(/^(TAB\.|TAB,|CAP\.|CAP,|SYP\.|SYP,|INJ\.|INJ,|TAB|CAP|SYP|INJ)\s+/i, "")
    .trim();

  if (mem) return mem.findMedicineFuzzy(cleaned);

  let found = await Medicine.findOne({
    med_name: { $regex: new RegExp(cleaned.replace(/\s+/g, "\\s*"), "i") },
  });
  if (found) return found;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 1) {
    const pattern = words.map((w) => `(?=.*${w})`).join("");
    found = await Medicine.findOne({ med_name: { $regex: new RegExp(pattern, "i") } });
  }
  if (!found) found = await Medicine.findOne({ med_name: { $regex: new RegExp(`^${cleaned}`, "i") } });
  return found;
}

/** POST /api/upload-prescription - multipart file + optional description */
async function uploadPrescription(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const file = req.file;
    const description = (req.body && req.body.description) || "";

    let extractedText = "";
    let medicines = [];
    const mem = memory();

    if (file && file.buffer) {
      try {
        const extractedMedicines = await extractVisionDirect(file.buffer, file.originalname);
        medicines = extractedMedicines.map((m) => ({
          name: m.name || "",
          dosage: m.dosage || "",
          frequency: m.frequency || "",
          duration: m.duration || "",
        }));
        extractedText = `(Extracted ${medicines.length} medicines via Vision AI)`;
      } catch (e) {
        console.error("Vision AI extraction failed:", e);
        extractedText = "(OCR failed - paste text below)";
        if (description) {
          const structured = await getStructuredMedicines(description).catch(() => []);
          medicines = Array.isArray(structured) ? structured.map((m) => (typeof m === "string" ? { name: m, dosage: "", frequency: "" } : { name: m?.name || "", dosage: m?.dosage || "", frequency: "" })) : [];
        }
      }
    } else if (description) {
      extractedText = description;
      try {
        const structured = await getStructuredMedicines(description);
        medicines = structured.map((m) => ({
          name: typeof m === "string" ? m : (m && m.name) || "",
          dosage: (m && m.dosage) || "",
          frequency: (m && m.frequency) || "",
        }));
      } catch (e) {
        medicines = description.split(/[\n,;]+/).map((s) => ({ name: s.trim(), dosage: "", frequency: "" })).filter((m) => m.name);
      }
    }

    if (mem) {
      const prescription = mem.addPrescription(userId, extractedText, medicines);
      const withMatch = medicines.map((m) => {
        const matched = mem.findMedicineFuzzy(m.name);
        return {
          ...m,
          matchedId: matched ? matched._id : null,
          matchedName: matched ? matched.med_name : null,
          price: matched ? matched.med_price : null,
        };
      });
      return res.status(201).json({
        message: "Prescription uploaded and processed",
        prescriptionId: prescription._id,
        extractedText,
        medicines: withMatch,
      });
    }

    const prescription = new Prescription({ userId, extractedText, medicines });
    await prescription.save();
    const withMatch = await Promise.all(
      medicines.map(async (m) => {
        const matched = await fuzzyMatchMedicine(m.name);
        return {
          ...m,
          matchedId: matched ? matched._id : null,
          matchedName: matched ? matched.med_name : null,
          price: matched ? matched.med_price : null,
        };
      })
    );
    res.status(201).json({
      message: "Prescription uploaded and processed",
      prescriptionId: prescription._id,
      extractedText,
      medicines: withMatch,
    });
  } catch (err) {
    console.error("Upload prescription error:", err);
    res.status(500).json({ message: err.message || "Failed to process prescription" });
  }
}

/** GET /api/prescriptions */
async function getMyPrescriptions(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const mem = memory();
    if (mem) return res.json(mem.getPrescriptions(userId));
    const list = await Prescription.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    console.error("Get prescriptions error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  uploadPrescription,
  getMyPrescriptions,
};
