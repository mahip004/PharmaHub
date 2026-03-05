/**
 * In-memory store for running without MongoDB.
 * Used when MONGO_URI is not set or USE_MEMORY_STORE=true.
 */

const bcrypt = require("bcrypt");

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const store = {
  users: [],
  medicines: [
    { _id: "m1", med_name: "Paracetamol", med_desc: "Pain reliever", usage: "Pain and fever", dosage: "500mg", side_effects: "Rare allergic reactions", med_price: 25, med_quantity: 100 },
    { _id: "m2", med_name: "Amoxicillin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "250mg", side_effects: "Nausea, diarrhea", med_price: 45, med_quantity: 80 },
    { _id: "m3", med_name: "Cetirizine", med_desc: "Antihistamine", usage: "Allergies", dosage: "10mg", side_effects: "Drowsiness", med_price: 15, med_quantity: 120 },
    { _id: "m4", med_name: "Omeprazole", med_desc: "Antacid", usage: "Acid reflux", dosage: "20mg", side_effects: "Headache", med_price: 35, med_quantity: 90 },
    { _id: "m5", med_name: "Ibuprofen", med_desc: "NSAID", usage: "Pain, inflammation", dosage: "400mg", side_effects: "Stomach upset", med_price: 30, med_quantity: 70 },
  
    { _id: "m6", med_name: "Aspirin", med_desc: "Pain reliever", usage: "Pain, inflammation", dosage: "325mg", side_effects: "Stomach irritation", med_price: 15, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m7", med_name: "Lisinopril", med_desc: "ACE inhibitor", usage: "High blood pressure", dosage: "10mg", side_effects: "Dry cough", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m8", med_name: "Metformin", med_desc: "Diabetes medication", usage: "Type 2 diabetes", dosage: "500mg", side_effects: "Nausea", med_price: 12, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m9", med_name: "Atorvastatin", med_desc: "Statin", usage: "High cholesterol", dosage: "20mg", side_effects: "Muscle pain", med_price: 40, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m10", med_name: "Amlodipine", med_desc: "Calcium channel blocker", usage: "High blood pressure", dosage: "5mg", side_effects: "Swelling in ankles", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m11", med_name: "Albuterol", med_desc: "Bronchodilator", usage: "Asthma", dosage: "90mcg", side_effects: "Tremors", med_price: 55, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m12", med_name: "Gabapentin", med_desc: "Anticonvulsant", usage: "Nerve pain", dosage: "300mg", side_effects: "Dizziness", med_price: 25, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m13", med_name: "Sertraline", med_desc: "SSRI", usage: "Depression", dosage: "50mg", side_effects: "Insomnia", med_price: 30, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m14", med_name: "Losartan", med_desc: "Angiotensin receptor blocker", usage: "High blood pressure", dosage: "50mg", side_effects: "Dizziness", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m15", med_name: "Furosemide", med_desc: "Diuretic", usage: "Fluid retention", dosage: "40mg", side_effects: "Dehydration", med_price: 10, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m16", med_name: "Pantoprazole", med_desc: "Proton pump inhibitor", usage: "Acid reflux", dosage: "40mg", side_effects: "Headache", med_price: 35, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m17", med_name: "Hydrochlorothiazide", med_desc: "Diuretic", usage: "High blood pressure", dosage: "25mg", side_effects: "Frequent urination", med_price: 8, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m18", med_name: "Meloxicam", med_desc: "NSAID", usage: "Arthritis", dosage: "15mg", side_effects: "Stomach upset", med_price: 28, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m19", med_name: "Clopidogrel", med_desc: "Blood thinner", usage: "Heart disease", dosage: "75mg", side_effects: "Bleeding", med_price: 45, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m20", med_name: "Metoprolol", med_desc: "Beta blocker", usage: "High blood pressure", dosage: "50mg", side_effects: "Fatigue", med_price: 15, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m21", med_name: "Escitalopram", med_desc: "SSRI", usage: "Depression, Anxiety", dosage: "10mg", side_effects: "Nausea", med_price: 32, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m22", med_name: "Rosuvastatin", med_desc: "Statin", usage: "High cholesterol", dosage: "10mg", side_effects: "Muscle aches", med_price: 50, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m23", med_name: "Montelukast", med_desc: "Leukotriene receptor antagonist", usage: "Asthma", dosage: "10mg", side_effects: "Headache", med_price: 42, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m24", med_name: "Trazodone", med_desc: "Antidepressant", usage: "Depression, Insomnia", dosage: "50mg", side_effects: "Drowsiness", med_price: 25, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m25", med_name: "Duloxetine", med_desc: "SNRI", usage: "Depression, Nerve pain", dosage: "30mg", side_effects: "Dry mouth", med_price: 48, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m26", med_name: "Fluoxetine", med_desc: "SSRI", usage: "Depression", dosage: "20mg", side_effects: "Insomnia", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m27", med_name: "Carvedilol", med_desc: "Beta blocker", usage: "Heart failure", dosage: "6.25mg", side_effects: "Dizziness", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m28", med_name: "Venlafaxine", med_desc: "SNRI", usage: "Depression", dosage: "75mg", side_effects: "Sweating", med_price: 38, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m29", med_name: "Fluticasone", med_desc: "Corticosteroid", usage: "Allergies", dosage: "50mcg", side_effects: "Nosebleed", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m30", med_name: "Clonazepam", med_desc: "Benzodiazepine", usage: "Anxiety, Seizures", dosage: "1mg", side_effects: "Drowsiness", med_price: 15, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m31", med_name: "Azithromycin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "250mg", side_effects: "Diarrhea", med_price: 35, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m32", med_name: "Tramadol", med_desc: "Pain reliever", usage: "Moderate to severe pain", dosage: "50mg", side_effects: "Nausea", med_price: 28, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m33", med_name: "Bupropion", med_desc: "Antidepressant", usage: "Depression, Smoking cessation", dosage: "150mg", side_effects: "Insomnia", med_price: 30, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m34", med_name: "Allopurinol", med_desc: "Xanthine oxidase inhibitor", usage: "Gout", dosage: "100mg", side_effects: "Rash", med_price: 12, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m35", med_name: "Citalopram", med_desc: "SSRI", usage: "Depression", dosage: "20mg", side_effects: "Dry mouth", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m36", med_name: "Cyclobenzaprine", med_desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "10mg", side_effects: "Drowsiness", med_price: 16, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m37", med_name: "Spironolactone", med_desc: "Diuretic", usage: "Heart failure, Edema", dosage: "25mg", side_effects: "High potassium", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m38", med_name: "Tamsulosin", med_desc: "Alpha blocker", usage: "Enlarged prostate", dosage: "0.4mg", side_effects: "Dizziness", med_price: 34, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m39", med_name: "Promethazine", med_desc: "Antihistamine", usage: "Allergies, Nausea", dosage: "25mg", side_effects: "Drowsiness", med_price: 14, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m40", med_name: "Glipizide", med_desc: "Sulfonylurea", usage: "Type 2 diabetes", dosage: "5mg", side_effects: "Low blood sugar", med_price: 10, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m41", med_name: "Esomeprazole", med_desc: "Proton pump inhibitor", usage: "Acid reflux", dosage: "40mg", side_effects: "Headache", med_price: 45, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m42", med_name: "Lorazepam", med_desc: "Benzodiazepine", usage: "Anxiety", dosage: "1mg", side_effects: "Sedation", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m43", med_name: "Cephalexin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side_effects: "Upset stomach", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m44", med_name: "Pravastatin", med_desc: "Statin", usage: "High cholesterol", dosage: "20mg", side_effects: "Muscle weakness", med_price: 28, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m45", med_name: "Levofloxacin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side_effects: "Nausea", med_price: 40, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m46", med_name: "Mirtazapine", med_desc: "Antidepressant", usage: "Depression", dosage: "15mg", side_effects: "Weight gain", med_price: 26, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m47", med_name: "Ziprasidone", med_desc: "Antipsychotic", usage: "Schizophrenia, Bipolar", dosage: "40mg", side_effects: "Drowsiness", med_price: 55, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m48", med_name: "Paroxetine", med_desc: "SSRI", usage: "Depression, Anxiety", dosage: "20mg", side_effects: "Sexual dysfunction", med_price: 30, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m49", med_name: "Doxycycline", med_desc: "Antibiotic", usage: "Acne, infections", dosage: "100mg", side_effects: "Sun sensitivity", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m50", med_name: "Amitriptyline", med_desc: "Tricyclic antidepressant", usage: "Depression, Nerve pain", dosage: "25mg", side_effects: "Dry mouth", med_price: 12, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m51", med_name: "Methotrexate", med_desc: "Immunosuppressant", usage: "Rheumatoid arthritis", dosage: "2.5mg", side_effects: "Nausea", med_price: 45, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m52", med_name: "Loratadine", med_desc: "Antihistamine", usage: "Allergies", dosage: "10mg", side_effects: "Headache", med_price: 14, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m53", med_name: "Acyclovir", med_desc: "Antiviral", usage: "Herpes, Shingles", dosage: "400mg", side_effects: "Malaise", med_price: 35, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m54", med_name: "Diclofenac", med_desc: "NSAID", usage: "Pain, Arthritis", dosage: "50mg", side_effects: "Heartburn", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m55", med_name: "Valsartan", med_desc: "Angiotensin receptor blocker", usage: "High blood pressure", dosage: "80mg", side_effects: "Dizziness", med_price: 26, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m56", med_name: "Ondansetron", med_desc: "Antiemetic", usage: "Nausea, Vomiting", dosage: "8mg", side_effects: "Constipation", med_price: 38, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m57", med_name: "Famotidine", med_desc: "H2 blocker", usage: "Heartburn, Ulcers", dosage: "20mg", side_effects: "Headache", med_price: 15, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m58", med_name: "Hydroxyzine", med_desc: "Antihistamine", usage: "Anxiety, Itching", dosage: "25mg", side_effects: "Drowsiness", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m59", med_name: "Digoxin", med_desc: "Cardiac glycoside", usage: "Heart failure", dosage: "0.25mg", side_effects: "Nausea", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m60", med_name: "Levothyroxine", med_desc: "Thyroid hormone", usage: "Hypothyroidism", dosage: "50mcg", side_effects: "Palpitations", med_price: 15, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m61", med_name: "Zolpidem", med_desc: "Sedative", usage: "Insomnia", dosage: "10mg", side_effects: "Dizziness", med_price: 40, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m62", med_name: "Tizanidine", med_desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "4mg", side_effects: "Dry mouth", med_price: 24, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m63", med_name: "Baclofen", med_desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "10mg", side_effects: "Drowsiness", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m64", med_name: "Warfarin", med_desc: "Blood thinner", usage: "Prevent blood clots", dosage: "5mg", side_effects: "Bleeding", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m65", med_name: "Amiodarone", med_desc: "Antiarrhythmic", usage: "Irregular heartbeat", dosage: "200mg", side_effects: "Thyroid issues", med_price: 45, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m66", med_name: "Lithium", med_desc: "Mood stabilizer", usage: "Bipolar disorder", dosage: "300mg", side_effects: "Tremor", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m67", med_name: "Prednisone", med_desc: "Corticosteroid", usage: "Inflammation", dosage: "10mg", side_effects: "Weight gain", med_price: 12, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m68", med_name: "Insulin Glargine", med_desc: "Insulin", usage: "Diabetes", dosage: "100 units/mL", side_effects: "Low blood sugar", med_price: 120, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m69", med_name: "Budesonide", med_desc: "Corticosteroid", usage: "Asthma, Crohn's", dosage: "9mg", side_effects: "Throat irritation", med_price: 85, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m70", med_name: "Ciprofloxacin", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side_effects: "Nausea", med_price: 25, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m71", med_name: "Diazepam", med_desc: "Benzodiazepine", usage: "Anxiety, Seizures", dosage: "5mg", side_effects: "Drowsiness", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m72", med_name: "Sitagliptin", med_desc: "DPP-4 inhibitor", usage: "Type 2 diabetes", dosage: "100mg", side_effects: "Headache", med_price: 65, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m73", med_name: "Finasteride", med_desc: "5-alpha-reductase inhibitor", usage: "Enlarged prostate, Hair loss", dosage: "5mg", side_effects: "Decreased libido", med_price: 30, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m74", med_name: "Nitrofurantoin", med_desc: "Antibiotic", usage: "Urinary tract infections", dosage: "100mg", side_effects: "Upset stomach", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m75", med_name: "Topiramate", med_desc: "Anticonvulsant", usage: "Migraines, Seizures", dosage: "50mg", side_effects: "Cognitive slowness", med_price: 35, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m76", med_name: "Ezetimibe", med_desc: "Cholesterol absorption inhibitor", usage: "High cholesterol", dosage: "10mg", side_effects: "Diarrhea", med_price: 42, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m77", med_name: "Propranolol", med_desc: "Beta blocker", usage: "High blood pressure, Migraines", dosage: "40mg", side_effects: "Fatigue", med_price: 16, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m78", med_name: "Latanoprost", med_desc: "Prostaglandin analog", usage: "Glaucoma", dosage: "0.005%", side_effects: "Eye redness", med_price: 55, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m79", med_name: "Verapamil", med_desc: "Calcium channel blocker", usage: "High blood pressure, Arrhythmias", dosage: "80mg", side_effects: "Constipation", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m80", med_name: "Mometasone", med_desc: "Corticosteroid", usage: "Allergies, Skin conditions", dosage: "0.1%", side_effects: "Nasal burning", med_price: 28, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m81", med_name: "Cefdinir", med_desc: "Antibiotic", usage: "Bacterial infections", dosage: "300mg", side_effects: "Diarrhea", med_price: 35, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m82", med_name: "Ketoconazole", med_desc: "Antifungal", usage: "Fungal infections", dosage: "2%", side_effects: "Skin irritation", med_price: 24, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m83", med_name: "Terbinafine", med_desc: "Antifungal", usage: "Fungal nail infections", dosage: "250mg", side_effects: "Taste changes", med_price: 30, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m84", med_name: "Metronidazole", med_desc: "Antibiotic/Antiprotozoal", usage: "Bacterial/Parasitic infections", dosage: "500mg", side_effects: "Metallic taste", med_price: 15, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m85", med_name: "Nystatin", med_desc: "Antifungal", usage: "Candidiasis", dosage: "100,000 units", side_effects: "Nausea", med_price: 18, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m86", med_name: "Mupirocin", med_desc: "Antibacterial", usage: "Skin infections", dosage: "2%", side_effects: "Local burning", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m87", med_name: "Permethrin", med_desc: "Antiparasitic", usage: "Scabies, Lice", dosage: "5%", side_effects: "Itching", med_price: 25, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m88", med_name: "Sildenafil", med_desc: "PDE5 inhibitor", usage: "Erectile dysfunction", dosage: "50mg", side_effects: "Headache", med_price: 60, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m89", med_name: "Tadalafil", med_desc: "PDE5 inhibitor", usage: "Erectile dysfunction", dosage: "10mg", side_effects: "Back pain", med_price: 70, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m90", med_name: "Benzonatate", med_desc: "Antitussive", usage: "Cough", dosage: "100mg", side_effects: "Numbness", med_price: 20, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m91", med_name: "Guaifenesin", med_desc: "Expectorant", usage: "Congestion", dosage: "400mg", side_effects: "Dizziness", med_price: 10, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m92", med_name: "Loperamide", med_desc: "Antidiarrheal", usage: "Diarrhea", dosage: "2mg", side_effects: "Constipation", med_price: 12, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m93", med_name: "Bisacodyl", med_desc: "Laxative", usage: "Constipation", dosage: "5mg", side_effects: "Cramps", med_price: 8, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m94", med_name: "Simethicone", med_desc: "Anti-gas", usage: "Gas, Bloating", dosage: "80mg", side_effects: "Loose stools", med_price: 10, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m95", med_name: "Bismuth subsalicylate", med_desc: "Antidiarrheal/Antacid", usage: "Upset stomach, Diarrhea", dosage: "262mg", side_effects: "Black tongue/stool", med_price: 15, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m96", med_name: "Meclizine", med_desc: "Antiemetic", usage: "Motion sickness, Vertigo", dosage: "25mg", side_effects: "Drowsiness", med_price: 14, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m97", med_name: "Dicyclomine", med_desc: "Antispasmodic", usage: "Irritable bowel syndrome", dosage: "20mg", side_effects: "Dry mouth", med_price: 22, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m98", med_name: "Sumatriptan", med_desc: "Triptan", usage: "Migraines", dosage: "50mg", side_effects: "Tingling", med_price: 45, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m99", med_name: "Rizatriptan", med_desc: "Triptan", usage: "Migraines", dosage: "10mg", side_effects: "Dizziness", med_price: 50, med_quantity: Math.floor(Math.random() * 100) + 20 },
    { _id: "m100", med_name: "Naloxone", med_desc: "Opioid antagonist", usage: "Opioid overdose", dosage: "4mg", side_effects: "Withdrawal symptoms", med_price: 120, med_quantity: Math.floor(Math.random() * 100) + 20 },
],
  prescriptions: [],
  carts: {},
  orders: [],
  addresses: [],
  appointments: [],
};

const TIMETABLE = [
  { doctor: "Dr. Smith", specialization: "Cardiologist", day: "Monday", time: "10:00 AM - 2:00 PM" },
  { doctor: "Dr. Johnson", specialization: "Dermatologist", day: "Wednesday", time: "12:00 PM - 4:00 PM" },
  { doctor: "Dr. Brown", specialization: "Pediatrician", day: "Friday", time: "9:00 AM - 1:00 PM" },
  { doctor: "Dr. Williams", specialization: "General Physician", day: "Tuesday", time: "11:00 AM - 3:00 PM" },
  { doctor: "Dr. Davis", specialization: "Neurologist", day: "Thursday", time: "9:00 AM - 1:00 PM" },
];

function getTimetable() {
  return TIMETABLE;
}

function addAppointment(data) {
  const apt = {
    _id: id(),
    userId: data.userId || null,
    name: data.name,
    email: data.email,
    phone: data.phone,
    date: data.date,
    time: data.time,
    department: data.department || "General",
    reason: data.reason || "",
    patientType: data.patientType || "new",
    status: "pending",
    createdAt: new Date(),
  };
  store.appointments.push(apt);
  return apt;
}

function getAppointmentsByUser(userId) {
  return store.appointments
    .filter((a) => a.userId === userId || a.userId?.toString() === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function findUserByEmail(email) {
  return store.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
}

async function createUser(data) {
  const user = {
    _id: id(),
    id: null,
    email: data.email,
    password: data.password,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    phone: data.phone || "",
    isAdmin: false,
  };
  user.id = user._id;
  store.users.push(user);
  return user;
}

function getMedicines() {
  return store.medicines;
}

function findMedicineById(medId) {
  return store.medicines.find((m) => m._id === medId || m._id.toString() === medId);
}

function findMedicineByName(name) {
  if (!name || !name.trim()) return null;
  const n = name.trim().toLowerCase();
  return store.medicines.find((m) => m.med_name && m.med_name.toLowerCase().includes(n)) || null;
}

function findMedicineFuzzy(name) {
  if (!name || !name.trim()) return null;
  const cleaned = name.trim();
  let found = store.medicines.find((m) =>
    m.med_name && new RegExp(cleaned.replace(/\s+/g, "\\s*"), "i").test(m.med_name)
  );
  if (found) return found;
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    found = store.medicines.find((m) => {
      if (!m.med_name) return false;
      const lower = m.med_name.toLowerCase();
      return words.every((w) => lower.includes(w.toLowerCase()));
    });
  }
  if (!found) {
    found = store.medicines.find((m) =>
      m.med_name && m.med_name.toLowerCase().startsWith(cleaned.toLowerCase())
    );
  }
  return found || null;
}

function getOrCreateCart(userId) {
  if (!store.carts[userId]) {
    store.carts[userId] = { userId, items: [], updatedAt: new Date() };
  }
  return store.carts[userId];
}

function getCartItems(userId) {
  const cart = getOrCreateCart(userId);
  return (cart.items || []).map((item) => {
    const med = findMedicineById(item.medicineId);
    return {
      medicineId: item.medicineId,
      quantity: item.quantity,
      name: med ? med.med_name : item.name,
      price: med ? med.med_price : item.price,
    };
  });
}

function addToCart(userId, medicineId, quantity, name, price) {
  const cart = getOrCreateCart(userId);
  const existing = cart.items.find((i) => i.medicineId === medicineId || i.medicineId?.toString() === medicineId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ medicineId, quantity, name, price });
  cart.updatedAt = new Date();
  return getCartItems(userId);
}

function updateCartItem(userId, medicineId, quantity) {
  const cart = getOrCreateCart(userId);
  const idx = cart.items.findIndex((i) => i.medicineId === medicineId || i.medicineId?.toString() === medicineId);
  if (idx === -1) return null;
  if (!quantity || quantity <= 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = quantity;
  cart.updatedAt = new Date();
  return getCartItems(userId);
}

function addFromPrescriptionCart(userId, medicines) {
  const cart = getOrCreateCart(userId);
  for (const m of medicines) {
    const qty = m.quantity || 1;
    let med = m.medicineId ? findMedicineById(m.medicineId) : findMedicineByName(m.name);
    if (!med || (med.med_quantity || 0) < qty) continue;
    const existing = cart.items.find((i) => i.medicineId === med._id);
    if (existing) existing.quantity += qty;
    else cart.items.push({ medicineId: med._id, quantity: qty, name: med.med_name, price: med.med_price });
  }
  cart.updatedAt = new Date();
  return getCartItems(userId);
}

function clearCart(userId) {
  if (store.carts[userId]) store.carts[userId].items = [];
}

function createOrder(userId, items, totalAmount, shippingAddress, paymentMethod) {
  const order = {
    _id: id(),
    userId,
    items,
    totalAmount,
    status: "pending",
    paymentMethod: paymentMethod || "card",
    paymentId: null,
    shippingAddress: shippingAddress || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.orders.push(order);
  return order;
}

function getOrdersByUser(userId) {
  return store.orders.filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getOrderById(orderId, userId) {
  return store.orders.find((o) => (o._id === orderId || o._id.toString() === orderId) && o.userId === userId);
}

function updateOrderStatus(orderId, userId, status) {
  const order = getOrderById(orderId, userId);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date();
  return order;
}

function getAddresses(userId) {
  return store.addresses.filter((a) => a.userId === userId);
}

function addAddress(userId, data) {
  if (data.isDefault) {
    store.addresses.filter((a) => a.userId === userId).forEach((a) => (a.isDefault = false));
  }
  const addr = {
    _id: id(),
    userId,
    street: data.street,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    phone: data.phone,
    isDefault: !!data.isDefault,
  };
  store.addresses.push(addr);
  return addr;
}

function updateAddress(addrId, userId, data) {
  const addr = store.addresses.find((a) => (a._id === addrId || a._id.toString() === addrId) && a.userId === userId);
  if (!addr) return null;
  if (data.street !== undefined) addr.street = data.street;
  if (data.city !== undefined) addr.city = data.city;
  if (data.state !== undefined) addr.state = data.state;
  if (data.pincode !== undefined) addr.pincode = data.pincode;
  if (data.phone !== undefined) addr.phone = data.phone;
  if (data.isDefault) {
    store.addresses.filter((a) => a.userId === userId).forEach((a) => (a.isDefault = false));
    addr.isDefault = true;
  }
  return addr;
}

function getPrescriptions(userId) {
  return store.prescriptions.filter((p) => p.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function addPrescription(userId, extractedText, medicines) {
  const doc = {
    _id: id(),
    userId,
    extractedText,
    medicines: medicines || [],
    createdAt: new Date(),
  };
  store.prescriptions.push(doc);
  return doc;
}

function decrementMedicineStock(medId, qty) {
  const med = findMedicineById(medId);
  if (med && (med.med_quantity || 0) >= qty) {
    med.med_quantity = (med.med_quantity || 0) - qty;
    return true;
  }
  return false;
}

module.exports = {
  store,
  id,
  findUserByEmail,
  createUser,
  getMedicines,
  findMedicineById,
  findMedicineByName,
  findMedicineFuzzy,
  getOrCreateCart,
  getCartItems,
  addToCart,
  updateCartItem,
  addFromPrescriptionCart,
  clearCart,
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  getAddresses,
  addAddress,
  updateAddress,
  getPrescriptions,
  addPrescription,
  decrementMedicineStock,
  getTimetable,
  addAppointment,
  getAppointmentsByUser,
};
