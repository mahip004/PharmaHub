const axios = require("axios");

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://localhost:8000";

async function extractTextFromImage(imageBuffer, filename = "prescription.png") {
  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("file", imageBuffer, { filename });
  const { data } = await axios.post(`${FASTAPI_BASE}/extract_text/`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
  });
  return data.extracted_text;
}

async function validatePrescriptionAndGetMedicines(text) {
  const { data } = await axios.post(`${FASTAPI_BASE}/validate_prescription/`, {
    text,
  });
  return data;
}

/** Call structured extraction endpoint if available; else parse validated markdown */
async function getStructuredMedicines(text) {
  try {
    const res = await axios.post(`${FASTAPI_BASE}/extract_medicines/`, {
      text,
    });
    if (res.data && Array.isArray(res.data.medicines)) {
      return res.data.medicines;
    }
  } catch (_) {
    // fallback: use validate_prescription and parse bullets
  }
  const data = await validatePrescriptionAndGetMedicines(text);
  const medicineNames = (data.validated || "")
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim());
  return medicineNames.map((name) => ({ name, dosage: "", frequency: "" }));
}

async function extractVisionDirect(imageBuffer, filename = "prescription.png") {
  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("file", imageBuffer, { filename });
  const { data } = await axios.post(`${FASTAPI_BASE}/extract_vision/`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
  });
  return data.medicines; // Returns array of {name, dosage}
}

module.exports = {
  extractTextFromImage,
  validatePrescriptionAndGetMedicines,
  getStructuredMedicines,
  extractVisionDirect,
};
