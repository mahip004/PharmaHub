/**
 * seedMedicines.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script to import the 100 medicines from memoryStore into MongoDB Atlas.
 *
 * Usage (from the backend/ directory):
 *   node seedMedicines.js
 *
 * Make sure MONGO_URI in .env points to your Atlas cluster before running.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Medicine = require("./models/Medicine");

const MEDICINES = [
    { med_name: "Paracetamol", med_desc: "Pain reliever", usage: "Pain and fever", dosage: "500mg", side_effects: "Rare allergic reactions", med_price: 25, med_quantity: 100 },
    { med_name: "Amoxicillin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "250mg", side_effects: "Nausea, diarrhea", med_price: 45, med_quantity: 80 },
    { med_name: "Cetirizine", med_desc: "Antihistamine", usage: "Allergies", dosage: "10mg", side_effects: "Drowsiness", med_price: 15, med_quantity: 120 },
    { med_name: "Omeprazole", med_desc: "Antacid", usage: "Acid reflux", dosage: "20mg", side_effects: "Headache", med_price: 35, med_quantity: 90 },
    { med_name: "Ibuprofen", med_desc: "NSAID", usage: "Pain, inflammation", dosage: "400mg", side_effects: "Stomach upset", med_price: 30, med_quantity: 70 },
    { med_name: "Aspirin", med_desc: "Pain reliever", usage: "Pain, inflammation", dosage: "325mg", side_effects: "Stomach irritation", med_price: 15, med_quantity: 60 },
    { med_name: "Lisinopril", med_desc: "ACE inhibitor", usage: "High blood pressure", dosage: "10mg", side_effects: "Dry cough", med_price: 22, med_quantity: 55 },
    { med_name: "Metformin", med_desc: "Diabetes medication", usage: "Type 2 diabetes", dosage: "500mg", side_effects: "Nausea", med_price: 12, med_quantity: 75 },
    { med_name: "Atorvastatin", med_desc: "Statin", usage: "High cholesterol", dosage: "20mg", side_effects: "Muscle pain", med_price: 40, med_quantity: 65 },
    { med_name: "Amlodipine", med_desc: "Calcium channel blocker", usage: "High blood pressure", dosage: "5mg", side_effects: "Swelling in ankles", med_price: 18, med_quantity: 80 },
    { med_name: "Albuterol", med_desc: "Bronchodilator", usage: "Asthma", dosage: "90mcg", side_effects: "Tremors", med_price: 55, med_quantity: 50 },
    { med_name: "Gabapentin", med_desc: "Anticonvulsant", usage: "Nerve pain", dosage: "300mg", side_effects: "Dizziness", med_price: 25, med_quantity: 60 },
    { med_name: "Sertraline", med_desc: "SSRI", usage: "Depression", dosage: "50mg", side_effects: "Insomnia", med_price: 30, med_quantity: 70 },
    { med_name: "Losartan", med_desc: "Angiotensin receptor blocker", usage: "High blood pressure", dosage: "50mg", side_effects: "Dizziness", med_price: 20, med_quantity: 85 },
    { med_name: "Furosemide", med_desc: "Diuretic", usage: "Fluid retention", dosage: "40mg", side_effects: "Dehydration", med_price: 10, med_quantity: 90 },
    { med_name: "Pantoprazole", med_desc: "Proton pump inhibitor", usage: "Acid reflux", dosage: "40mg", side_effects: "Headache", med_price: 35, med_quantity: 75 },
    { med_name: "Hydrochlorothiazide", med_desc: "Diuretic", usage: "High blood pressure", dosage: "25mg", side_effects: "Frequent urination", med_price: 8, med_quantity: 95 },
    { med_name: "Meloxicam", med_desc: "NSAID", usage: "Arthritis", dosage: "15mg", side_effects: "Stomach upset", med_price: 28, med_quantity: 60 },
    { med_name: "Clopidogrel", med_desc: "Blood thinner", usage: "Heart disease", dosage: "75mg", side_effects: "Bleeding", med_price: 45, med_quantity: 55 },
    { med_name: "Metoprolol", med_desc: "Beta blocker", usage: "High blood pressure", dosage: "50mg", side_effects: "Fatigue", med_price: 15, med_quantity: 80 },
    { med_name: "Escitalopram", med_desc: "SSRI", usage: "Depression, Anxiety", dosage: "10mg", side_effects: "Nausea", med_price: 32, med_quantity: 70 },
    { med_name: "Rosuvastatin", med_desc: "Statin", usage: "High cholesterol", dosage: "10mg", side_effects: "Muscle aches", med_price: 50, med_quantity: 60 },
    { med_name: "Montelukast", med_desc: "Leukotriene receptor antagonist", usage: "Asthma", dosage: "10mg", side_effects: "Headache", med_price: 42, med_quantity: 65 },
    { med_name: "Trazodone", med_desc: "Antidepressant", usage: "Depression, Insomnia", dosage: "50mg", side_effects: "Drowsiness", med_price: 25, med_quantity: 75 },
    { med_name: "Duloxetine", med_desc: "SNRI", usage: "Depression, Nerve pain", dosage: "30mg", side_effects: "Dry mouth", med_price: 48, med_quantity: 55 },
    { med_name: "Fluoxetine", med_desc: "SSRI", usage: "Depression", dosage: "20mg", side_effects: "Insomnia", med_price: 20, med_quantity: 80 },
    { med_name: "Carvedilol", med_desc: "Beta blocker", usage: "Heart failure", dosage: "6.25mg", side_effects: "Dizziness", med_price: 18, med_quantity: 70 },
    { med_name: "Venlafaxine", med_desc: "SNRI", usage: "Depression", dosage: "75mg", side_effects: "Sweating", med_price: 38, med_quantity: 60 },
    { med_name: "Fluticasone", med_desc: "Corticosteroid", usage: "Allergies", dosage: "50mcg", side_effects: "Nosebleed", med_price: 22, med_quantity: 85 },
    { med_name: "Clonazepam", med_desc: "Benzodiazepine", usage: "Anxiety, Seizures", dosage: "1mg", side_effects: "Drowsiness", med_price: 15, med_quantity: 90 },
    { med_name: "Azithromycin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "250mg", side_effects: "Diarrhea", med_price: 35, med_quantity: 75 },
    { med_name: "Tramadol", med_desc: "Pain reliever", usage: "Moderate to severe pain", dosage: "50mg", side_effects: "Nausea", med_price: 28, med_quantity: 65 },
    { med_name: "Bupropion", med_desc: "Antidepressant", usage: "Depression, Smoking cessation", dosage: "150mg", side_effects: "Insomnia", med_price: 30, med_quantity: 70 },
    { med_name: "Allopurinol", med_desc: "Xanthine oxidase inhibitor", usage: "Gout", dosage: "100mg", side_effects: "Rash", med_price: 12, med_quantity: 95 },
    { med_name: "Citalopram", med_desc: "SSRI", usage: "Depression", dosage: "20mg", side_effects: "Dry mouth", med_price: 18, med_quantity: 80 },
    { med_name: "Cyclobenzaprine", med_desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "10mg", side_effects: "Drowsiness", med_price: 16, med_quantity: 75 },
    { med_name: "Spironolactone", med_desc: "Diuretic", usage: "Heart failure, Edema", dosage: "25mg", side_effects: "High potassium", med_price: 22, med_quantity: 70 },
    { med_name: "Tamsulosin", med_desc: "Alpha blocker", usage: "Enlarged prostate", dosage: "0.4mg", side_effects: "Dizziness", med_price: 34, med_quantity: 60 },
    { med_name: "Promethazine", med_desc: "Antihistamine", usage: "Allergies, Nausea", dosage: "25mg", side_effects: "Drowsiness", med_price: 14, med_quantity: 85 },
    { med_name: "Glipizide", med_desc: "Sulfonylurea", usage: "Type 2 diabetes", dosage: "5mg", side_effects: "Low blood sugar", med_price: 10, med_quantity: 90 },
    { med_name: "Esomeprazole", med_desc: "Proton pump inhibitor", usage: "Acid reflux", dosage: "40mg", side_effects: "Headache", med_price: 45, med_quantity: 65 },
    { med_name: "Lorazepam", med_desc: "Benzodiazepine", usage: "Anxiety", dosage: "1mg", side_effects: "Sedation", med_price: 20, med_quantity: 80 },
    { med_name: "Cephalexin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side_effects: "Upset stomach", med_price: 18, med_quantity: 75 },
    { med_name: "Pravastatin", med_desc: "Statin", usage: "High cholesterol", dosage: "20mg", side_effects: "Muscle weakness", med_price: 28, med_quantity: 70 },
    { med_name: "Levofloxacin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side_effects: "Nausea", med_price: 40, med_quantity: 60 },
    { med_name: "Mirtazapine", med_desc: "Antidepressant", usage: "Depression", dosage: "15mg", side_effects: "Weight gain", med_price: 26, med_quantity: 75 },
    { med_name: "Ziprasidone", med_desc: "Antipsychotic", usage: "Schizophrenia, Bipolar", dosage: "40mg", side_effects: "Drowsiness", med_price: 55, med_quantity: 55 },
    { med_name: "Paroxetine", med_desc: "SSRI", usage: "Depression, Anxiety", dosage: "20mg", side_effects: "Sexual dysfunction", med_price: 30, med_quantity: 70 },
    { med_name: "Doxycycline", med_desc: "Antibiotic", usage: "Acne, infections", dosage: "100mg", side_effects: "Sun sensitivity", med_price: 20, med_quantity: 80 },
    { med_name: "Amitriptyline", med_desc: "Tricyclic antidepressant", usage: "Depression, Nerve pain", dosage: "25mg", side_effects: "Dry mouth", med_price: 12, med_quantity: 90 },
    { med_name: "Methotrexate", med_desc: "Immunosuppressant", usage: "Rheumatoid arthritis", dosage: "2.5mg", side_effects: "Nausea", med_price: 45, med_quantity: 55 },
    { med_name: "Loratadine", med_desc: "Antihistamine", usage: "Allergies", dosage: "10mg", side_effects: "Headache", med_price: 14, med_quantity: 100 },
    { med_name: "Acyclovir", med_desc: "Antiviral", usage: "Herpes, Shingles", dosage: "400mg", side_effects: "Malaise", med_price: 35, med_quantity: 65 },
    { med_name: "Diclofenac", med_desc: "NSAID", usage: "Pain, Arthritis", dosage: "50mg", side_effects: "Heartburn", med_price: 22, med_quantity: 80 },
    { med_name: "Valsartan", med_desc: "Angiotensin receptor blocker", usage: "High blood pressure", dosage: "80mg", side_effects: "Dizziness", med_price: 26, med_quantity: 70 },
    { med_name: "Ondansetron", med_desc: "Antiemetic", usage: "Nausea, Vomiting", dosage: "8mg", side_effects: "Constipation", med_price: 38, med_quantity: 75 },
    { med_name: "Famotidine", med_desc: "H2 blocker", usage: "Heartburn, Ulcers", dosage: "20mg", side_effects: "Headache", med_price: 15, med_quantity: 85 },
    { med_name: "Hydroxyzine", med_desc: "Antihistamine", usage: "Anxiety, Itching", dosage: "25mg", side_effects: "Drowsiness", med_price: 18, med_quantity: 80 },
    { med_name: "Digoxin", med_desc: "Cardiac glycoside", usage: "Heart failure", dosage: "0.25mg", side_effects: "Nausea", med_price: 20, med_quantity: 70 },
    { med_name: "Levothyroxine", med_desc: "Thyroid hormone", usage: "Hypothyroidism", dosage: "50mcg", side_effects: "Palpitations", med_price: 15, med_quantity: 90 },
    { med_name: "Zolpidem", med_desc: "Sedative", usage: "Insomnia", dosage: "10mg", side_effects: "Dizziness", med_price: 40, med_quantity: 60 },
    { med_name: "Tizanidine", med_desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "4mg", side_effects: "Dry mouth", med_price: 24, med_quantity: 75 },
    { med_name: "Baclofen", med_desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "10mg", side_effects: "Drowsiness", med_price: 22, med_quantity: 80 },
    { med_name: "Warfarin", med_desc: "Blood thinner", usage: "Prevent blood clots", dosage: "5mg", side_effects: "Bleeding", med_price: 18, med_quantity: 70 },
    { med_name: "Amiodarone", med_desc: "Antiarrhythmic", usage: "Irregular heartbeat", dosage: "200mg", side_effects: "Thyroid issues", med_price: 45, med_quantity: 55 },
    { med_name: "Lithium", med_desc: "Mood stabilizer", usage: "Bipolar disorder", dosage: "300mg", side_effects: "Tremor", med_price: 20, med_quantity: 75 },
    { med_name: "Prednisone", med_desc: "Corticosteroid", usage: "Inflammation", dosage: "10mg", side_effects: "Weight gain", med_price: 12, med_quantity: 90 },
    { med_name: "Insulin Glargine", med_desc: "Insulin", usage: "Diabetes", dosage: "100 units/mL", side_effects: "Low blood sugar", med_price: 120, med_quantity: 40 },
    { med_name: "Budesonide", med_desc: "Corticosteroid", usage: "Asthma, Crohn's", dosage: "9mg", side_effects: "Throat irritation", med_price: 85, med_quantity: 45 },
    { med_name: "Ciprofloxacin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side_effects: "Nausea", med_price: 25, med_quantity: 75 },
    { med_name: "Diazepam", med_desc: "Benzodiazepine", usage: "Anxiety, Seizures", dosage: "5mg", side_effects: "Drowsiness", med_price: 18, med_quantity: 80 },
    { med_name: "Sitagliptin", med_desc: "DPP-4 inhibitor", usage: "Type 2 diabetes", dosage: "100mg", side_effects: "Headache", med_price: 65, med_quantity: 60 },
    { med_name: "Finasteride", med_desc: "5-alpha-reductase inhibitor", usage: "Enlarged prostate, Hair loss", dosage: "5mg", side_effects: "Decreased libido", med_price: 30, med_quantity: 70 },
    { med_name: "Nitrofurantoin", med_desc: "Antibiotic", usage: "Urinary tract infections", dosage: "100mg", side_effects: "Upset stomach", med_price: 22, med_quantity: 85 },
    { med_name: "Topiramate", med_desc: "Anticonvulsant", usage: "Migraines, Seizures", dosage: "50mg", side_effects: "Cognitive slowness", med_price: 35, med_quantity: 65 },
    { med_name: "Ezetimibe", med_desc: "Cholesterol absorption inhibitor", usage: "High cholesterol", dosage: "10mg", side_effects: "Diarrhea", med_price: 42, med_quantity: 70 },
    { med_name: "Propranolol", med_desc: "Beta blocker", usage: "High blood pressure, Migraines", dosage: "40mg", side_effects: "Fatigue", med_price: 16, med_quantity: 80 },
    { med_name: "Latanoprost", med_desc: "Prostaglandin analog", usage: "Glaucoma", dosage: "0.005%", side_effects: "Eye redness", med_price: 55, med_quantity: 50 },
    { med_name: "Verapamil", med_desc: "Calcium channel blocker", usage: "High blood pressure, Arrhythmias", dosage: "80mg", side_effects: "Constipation", med_price: 20, med_quantity: 75 },
    { med_name: "Mometasone", med_desc: "Corticosteroid", usage: "Allergies, Skin conditions", dosage: "0.1%", side_effects: "Nasal burning", med_price: 28, med_quantity: 80 },
    { med_name: "Cefdinir", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "300mg", side_effects: "Diarrhea", med_price: 35, med_quantity: 70 },
    { med_name: "Ketoconazole", med_desc: "Antifungal", usage: "Fungal infections", dosage: "2%", side_effects: "Skin irritation", med_price: 24, med_quantity: 75 },
    { med_name: "Terbinafine", med_desc: "Antifungal", usage: "Fungal nail infections", dosage: "250mg", side_effects: "Taste changes", med_price: 30, med_quantity: 65 },
    { med_name: "Metronidazole", med_desc: "Antibiotic/Antiprotozoal", usage: "Bacterial/Parasitic infections", dosage: "500mg", side_effects: "Metallic taste", med_price: 15, med_quantity: 90 },
    { med_name: "Nystatin", med_desc: "Antifungal", usage: "Candidiasis", dosage: "100,000 units", side_effects: "Nausea", med_price: 18, med_quantity: 85 },
    { med_name: "Mupirocin", med_desc: "Antibacterial", usage: "Skin infections", dosage: "2%", side_effects: "Local burning", med_price: 22, med_quantity: 80 },
    { med_name: "Permethrin", med_desc: "Antiparasitic", usage: "Scabies, Lice", dosage: "5%", side_effects: "Itching", med_price: 25, med_quantity: 75 },
    { med_name: "Sildenafil", med_desc: "PDE5 inhibitor", usage: "Erectile dysfunction", dosage: "50mg", side_effects: "Headache", med_price: 60, med_quantity: 55 },
    { med_name: "Tadalafil", med_desc: "PDE5 inhibitor", usage: "Erectile dysfunction", dosage: "10mg", side_effects: "Back pain", med_price: 70, med_quantity: 50 },
    { med_name: "Benzonatate", med_desc: "Antitussive", usage: "Cough", dosage: "100mg", side_effects: "Numbness", med_price: 20, med_quantity: 85 },
    { med_name: "Guaifenesin", med_desc: "Expectorant", usage: "Congestion", dosage: "400mg", side_effects: "Dizziness", med_price: 10, med_quantity: 100 },
    { med_name: "Loperamide", med_desc: "Antidiarrheal", usage: "Diarrhea", dosage: "2mg", side_effects: "Constipation", med_price: 12, med_quantity: 95 },
    { med_name: "Bisacodyl", med_desc: "Laxative", usage: "Constipation", dosage: "5mg", side_effects: "Cramps", med_price: 8, med_quantity: 100 },
    { med_name: "Simethicone", med_desc: "Anti-gas", usage: "Gas, Bloating", dosage: "80mg", side_effects: "Loose stools", med_price: 10, med_quantity: 90 },
    { med_name: "Bismuth subsalicylate", med_desc: "Antidiarrheal/Antacid", usage: "Upset stomach, Diarrhea", dosage: "262mg", side_effects: "Black tongue/stool", med_price: 15, med_quantity: 85 },
    { med_name: "Meclizine", med_desc: "Antiemetic", usage: "Motion sickness, Vertigo", dosage: "25mg", side_effects: "Drowsiness", med_price: 14, med_quantity: 80 },
    { med_name: "Dicyclomine", med_desc: "Antispasmodic", usage: "Irritable bowel syndrome", dosage: "20mg", side_effects: "Dry mouth", med_price: 22, med_quantity: 75 },
    { med_name: "Sumatriptan", med_desc: "Triptan", usage: "Migraines", dosage: "50mg", side_effects: "Tingling", med_price: 45, med_quantity: 60 },
    { med_name: "Rizatriptan", med_desc: "Triptan", usage: "Migraines", dosage: "10mg", side_effects: "Dizziness", med_price: 50, med_quantity: 55 },
    { med_name: "Naloxone", med_desc: "Opioid antagonist", usage: "Opioid overdose", dosage: "4mg", side_effects: "Withdrawal symptoms", med_price: 120, med_quantity: 30 },
];

async function seed() {
    const uri = process.env.MONGO_URI;
    if (!uri || uri.includes("<username>")) {
        console.error("❌  MONGO_URI not configured. Please update backend/.env with your Atlas connection string.");
        process.exit(1);
    }

    console.log("🔌  Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("✅  Connected!");

    // Drop existing medicines so we don't create duplicates on re-run
    const existing = await Medicine.countDocuments();
    if (existing > 0) {
        console.log(`⚠️   Found ${existing} existing medicines — deleting before re-seed...`);
        await Medicine.deleteMany({});
    }

    console.log("🌱  Seeding 100 medicines...");
    await Medicine.insertMany(MEDICINES);
    console.log("✅  100 medicines seeded successfully!");

    await mongoose.disconnect();
    console.log("🔌  Disconnected. Done!");
}

seed().catch((err) => {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
});
