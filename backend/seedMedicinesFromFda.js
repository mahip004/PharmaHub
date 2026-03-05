const axios = require("axios");
const mongoose = require("mongoose");
const Medicine = require("./models/Medicine");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

/**
 * Fetches ~1000 common generic medicine names from openFDA
 */
async function fetchFdaMedicines() {
    console.log("Fetching drug names from openFDA...");
    try {
        const url = "https://api.fda.gov/drug/label.json?count=openfda.generic_name.exact&limit=1000";
        const res = await axios.get(url);
        if (res.status && res.status === 200) {
            const results = res.data.results || [];
            return results
                .map((r) => r.term.toLowerCase())
                .filter((name) => name.length > 3 && !name.includes(","));
        }
        return [];
    } catch (err) {
        console.error("Error fetching from FDA API:", err.message);
        return [];
    }
}

async function seed() {
    if (!MONGO_URI) {
        console.error("MONGO_URI not found in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        const drugNames = await fetchFdaMedicines();
        if (drugNames.length === 0) {
            console.log("No drug names fetched. Exiting.");
            process.exit(0);
        }

        console.log(`Preparing to seed ${drugNames.length} medicines...`);

        const medicinesToInsert = drugNames.map((name) => ({
            med_name: name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            med_desc: `General medical usage for ${name}. Consult a doctor for details.`,
            usage: "Common medical treatment.",
            dosage: "As prescribed.",
            side_effects: "Consult physician.",
            med_price: Math.floor(Math.random() * 450) + 50, // Random price between 50-500
            med_quantity: Math.floor(Math.random() * 100) + 20, // Random stock
        }));

        // Clear existing (optional, but good for fresh start for hackathon)
        // await Medicine.deleteMany({});

        // Insert many with ordered: false to skip duplicates if any
        let count = 0;
        for (const med of medicinesToInsert) {
            try {
                await Medicine.findOneAndUpdate(
                    { med_name: med.med_name },
                    { $setOnInsert: med },
                    { upsert: true }
                );
                count++;
                if (count % 100 === 0) console.log(`Seeded ${count} medicines...`);
            } catch (e) {
                // Ignore duplicates
            }
        }

        console.log(`Successfully seeded ${count} medicines into the database!`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
