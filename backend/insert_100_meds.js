const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, 'store', 'memoryStore.js');

const newMeds = [
    { name: "Aspirin", desc: "Pain reliever", usage: "Pain, inflammation", dosage: "325mg", side: "Stomach irritation", price: 15 },
    { name: "Lisinopril", desc: "ACE inhibitor", usage: "High blood pressure", dosage: "10mg", side: "Dry cough", price: 22 },
    { name: "Metformin", desc: "Diabetes medication", usage: "Type 2 diabetes", dosage: "500mg", side: "Nausea", price: 12 },
    { name: "Atorvastatin", desc: "Statin", usage: "High cholesterol", dosage: "20mg", side: "Muscle pain", price: 40 },
    { name: "Amlodipine", desc: "Calcium channel blocker", usage: "High blood pressure", dosage: "5mg", side: "Swelling in ankles", price: 18 },
    { name: "Albuterol", desc: "Bronchodilator", usage: "Asthma", dosage: "90mcg", side: "Tremors", price: 55 },
    { name: "Gabapentin", desc: "Anticonvulsant", usage: "Nerve pain", dosage: "300mg", side: "Dizziness", price: 25 },
    { name: "Sertraline", desc: "SSRI", usage: "Depression", dosage: "50mg", side: "Insomnia", price: 30 },
    { name: "Losartan", desc: "Angiotensin receptor blocker", usage: "High blood pressure", dosage: "50mg", side: "Dizziness", price: 20 },
    { name: "Furosemide", desc: "Diuretic", usage: "Fluid retention", dosage: "40mg", side: "Dehydration", price: 10 },
    { name: "Pantoprazole", desc: "Proton pump inhibitor", usage: "Acid reflux", dosage: "40mg", side: "Headache", price: 35 },
    { name: "Hydrochlorothiazide", desc: "Diuretic", usage: "High blood pressure", dosage: "25mg", side: "Frequent urination", price: 8 },
    { name: "Meloxicam", desc: "NSAID", usage: "Arthritis", dosage: "15mg", side: "Stomach upset", price: 28 },
    { name: "Clopidogrel", desc: "Blood thinner", usage: "Heart disease", dosage: "75mg", side: "Bleeding", price: 45 },
    { name: "Metoprolol", desc: "Beta blocker", usage: "High blood pressure", dosage: "50mg", side: "Fatigue", price: 15 },
    { name: "Escitalopram", desc: "SSRI", usage: "Depression, Anxiety", dosage: "10mg", side: "Nausea", price: 32 },
    { name: "Rosuvastatin", desc: "Statin", usage: "High cholesterol", dosage: "10mg", side: "Muscle aches", price: 50 },
    { name: "Montelukast", desc: "Leukotriene receptor antagonist", usage: "Asthma", dosage: "10mg", side: "Headache", price: 42 },
    { name: "Trazodone", desc: "Antidepressant", usage: "Depression, Insomnia", dosage: "50mg", side: "Drowsiness", price: 25 },
    { name: "Duloxetine", desc: "SNRI", usage: "Depression, Nerve pain", dosage: "30mg", side: "Dry mouth", price: 48 },
    { name: "Fluoxetine", desc: "SSRI", usage: "Depression", dosage: "20mg", side: "Insomnia", price: 20 },
    { name: "Carvedilol", desc: "Beta blocker", usage: "Heart failure", dosage: "6.25mg", side: "Dizziness", price: 18 },
    { name: "Venlafaxine", desc: "SNRI", usage: "Depression", dosage: "75mg", side: "Sweating", price: 38 },
    { name: "Fluticasone", desc: "Corticosteroid", usage: "Allergies", dosage: "50mcg", side: "Nosebleed", price: 22 },
    { name: "Clonazepam", desc: "Benzodiazepine", usage: "Anxiety, Seizures", dosage: "1mg", side: "Drowsiness", price: 15 },
    { name: "Azithromycin", desc: "Antibiotic", usage: "Bacterial infections", dosage: "250mg", side: "Diarrhea", price: 35 },
    { name: "Tramadol", desc: "Pain reliever", usage: "Moderate to severe pain", dosage: "50mg", side: "Nausea", price: 28 },
    { name: "Bupropion", desc: "Antidepressant", usage: "Depression, Smoking cessation", dosage: "150mg", side: "Insomnia", price: 30 },
    { name: "Allopurinol", desc: "Xanthine oxidase inhibitor", usage: "Gout", dosage: "100mg", side: "Rash", price: 12 },
    { name: "Citalopram", desc: "SSRI", usage: "Depression", dosage: "20mg", side: "Dry mouth", price: 18 },
    { name: "Cyclobenzaprine", desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "10mg", side: "Drowsiness", price: 16 },
    { name: "Spironolactone", desc: "Diuretic", usage: "Heart failure, Edema", dosage: "25mg", side: "High potassium", price: 22 },
    { name: "Tamsulosin", desc: "Alpha blocker", usage: "Enlarged prostate", dosage: "0.4mg", side: "Dizziness", price: 34 },
    { name: "Promethazine", desc: "Antihistamine", usage: "Allergies, Nausea", dosage: "25mg", side: "Drowsiness", price: 14 },
    { name: "Glipizide", desc: "Sulfonylurea", usage: "Type 2 diabetes", dosage: "5mg", side: "Low blood sugar", price: 10 },
    { name: "Esomeprazole", desc: "Proton pump inhibitor", usage: "Acid reflux", dosage: "40mg", side: "Headache", price: 45 },
    { name: "Lorazepam", desc: "Benzodiazepine", usage: "Anxiety", dosage: "1mg", side: "Sedation", price: 20 },
    { name: "Cephalexin", desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side: "Upset stomach", price: 18 },
    { name: "Pravastatin", desc: "Statin", usage: "High cholesterol", dosage: "20mg", side: "Muscle weakness", price: 28 },
    { name: "Levofloxacin", desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side: "Nausea", price: 40 },
    { name: "Mirtazapine", desc: "Antidepressant", usage: "Depression", dosage: "15mg", side: "Weight gain", price: 26 },
    { name: "Ziprasidone", desc: "Antipsychotic", usage: "Schizophrenia, Bipolar", dosage: "40mg", side: "Drowsiness", price: 55 },
    { name: "Paroxetine", desc: "SSRI", usage: "Depression, Anxiety", dosage: "20mg", side: "Sexual dysfunction", price: 30 },
    { name: "Doxycycline", desc: "Antibiotic", usage: "Acne, infections", dosage: "100mg", side: "Sun sensitivity", price: 20 },
    { name: "Amitriptyline", desc: "Tricyclic antidepressant", usage: "Depression, Nerve pain", dosage: "25mg", side: "Dry mouth", price: 12 },
    { name: "Methotrexate", desc: "Immunosuppressant", usage: "Rheumatoid arthritis", dosage: "2.5mg", side: "Nausea", price: 45 },
    { name: "Loratadine", desc: "Antihistamine", usage: "Allergies", dosage: "10mg", side: "Headache", price: 14 },
    { name: "Acyclovir", desc: "Antiviral", usage: "Herpes, Shingles", dosage: "400mg", side: "Malaise", price: 35 },
    { name: "Diclofenac", desc: "NSAID", usage: "Pain, Arthritis", dosage: "50mg", side: "Heartburn", price: 22 },
    { name: "Valsartan", desc: "Angiotensin receptor blocker", usage: "High blood pressure", dosage: "80mg", side: "Dizziness", price: 26 },
    { name: "Ondansetron", desc: "Antiemetic", usage: "Nausea, Vomiting", dosage: "8mg", side: "Constipation", price: 38 },
    { name: "Famotidine", desc: "H2 blocker", usage: "Heartburn, Ulcers", dosage: "20mg", side: "Headache", price: 15 },
    { name: "Hydroxyzine", desc: "Antihistamine", usage: "Anxiety, Itching", dosage: "25mg", side: "Drowsiness", price: 18 },
    { name: "Digoxin", desc: "Cardiac glycoside", usage: "Heart failure", dosage: "0.25mg", side: "Nausea", price: 20 },
    { name: "Levothyroxine", desc: "Thyroid hormone", usage: "Hypothyroidism", dosage: "50mcg", side: "Palpitations", price: 15 },
    { name: "Zolpidem", desc: "Sedative", usage: "Insomnia", dosage: "10mg", side: "Dizziness", price: 40 },
    { name: "Tizanidine", desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "4mg", side: "Dry mouth", price: 24 },
    { name: "Baclofen", desc: "Muscle relaxant", usage: "Muscle spasms", dosage: "10mg", side: "Drowsiness", price: 22 },
    { name: "Warfarin", desc: "Blood thinner", usage: "Prevent blood clots", dosage: "5mg", side: "Bleeding", price: 18 },
    { name: "Amiodarone", desc: "Antiarrhythmic", usage: "Irregular heartbeat", dosage: "200mg", side: "Thyroid issues", price: 45 },
    { name: "Lithium", desc: "Mood stabilizer", usage: "Bipolar disorder", dosage: "300mg", side: "Tremor", price: 20 },
    { name: "Prednisone", desc: "Corticosteroid", usage: "Inflammation", dosage: "10mg", side: "Weight gain", price: 12 },
    { name: "Insulin Glargine", desc: "Insulin", usage: "Diabetes", dosage: "100 units/mL", side: "Low blood sugar", price: 120 },
    { name: "Budesonide", desc: "Corticosteroid", usage: "Asthma, Crohn's", dosage: "9mg", side: "Throat irritation", price: 85 },
    { name: "Ciprofloxacin", desc: "Antibiotic", usage: "Bacterial infections", dosage: "500mg", side: "Nausea", price: 25 },
    { name: "Diazepam", desc: "Benzodiazepine", usage: "Anxiety, Seizures", dosage: "5mg", side: "Drowsiness", price: 18 },
    { name: "Sitagliptin", desc: "DPP-4 inhibitor", usage: "Type 2 diabetes", dosage: "100mg", side: "Headache", price: 65 },
    { name: "Finasteride", desc: "5-alpha-reductase inhibitor", usage: "Enlarged prostate, Hair loss", dosage: "5mg", side: "Decreased libido", price: 30 },
    { name: "Nitrofurantoin", desc: "Antibiotic", usage: "Urinary tract infections", dosage: "100mg", side: "Upset stomach", price: 22 },
    { name: "Topiramate", desc: "Anticonvulsant", usage: "Migraines, Seizures", dosage: "50mg", side: "Cognitive slowness", price: 35 },
    { name: "Ezetimibe", desc: "Cholesterol absorption inhibitor", usage: "High cholesterol", dosage: "10mg", side: "Diarrhea", price: 42 },
    { name: "Propranolol", desc: "Beta blocker", usage: "High blood pressure, Migraines", dosage: "40mg", side: "Fatigue", price: 16 },
    { name: "Latanoprost", desc: "Prostaglandin analog", usage: "Glaucoma", dosage: "0.005%", side: "Eye redness", price: 55 },
    { name: "Verapamil", desc: "Calcium channel blocker", usage: "High blood pressure, Arrhythmias", dosage: "80mg", side: "Constipation", price: 20 },
    { name: "Mometasone", desc: "Corticosteroid", usage: "Allergies, Skin conditions", dosage: "0.1%", side: "Nasal burning", price: 28 },
    { name: "Cefdinir", desc: "Antibiotic", usage: "Bacterial infections", dosage: "300mg", side: "Diarrhea", price: 35 },
    { name: "Ketoconazole", desc: "Antifungal", usage: "Fungal infections", dosage: "2%", side: "Skin irritation", price: 24 },
    { name: "Terbinafine", desc: "Antifungal", usage: "Fungal nail infections", dosage: "250mg", side: "Taste changes", price: 30 },
    { name: "Metronidazole", desc: "Antibiotic/Antiprotozoal", usage: "Bacterial/Parasitic infections", dosage: "500mg", side: "Metallic taste", price: 15 },
    { name: "Nystatin", desc: "Antifungal", usage: "Candidiasis", dosage: "100,000 units", side: "Nausea", price: 18 },
    { name: "Mupirocin", desc: "Antibacterial", usage: "Skin infections", dosage: "2%", side: "Local burning", price: 22 },
    { name: "Permethrin", desc: "Antiparasitic", usage: "Scabies, Lice", dosage: "5%", side: "Itching", price: 25 },
    { name: "Sildenafil", desc: "PDE5 inhibitor", usage: "Erectile dysfunction", dosage: "50mg", side: "Headache", price: 60 },
    { name: "Tadalafil", desc: "PDE5 inhibitor", usage: "Erectile dysfunction", dosage: "10mg", side: "Back pain", price: 70 },
    { name: "Benzonatate", desc: "Antitussive", usage: "Cough", dosage: "100mg", side: "Numbness", price: 20 },
    { name: "Guaifenesin", desc: "Expectorant", usage: "Congestion", dosage: "400mg", side: "Dizziness", price: 10 },
    { name: "Loperamide", desc: "Antidiarrheal", usage: "Diarrhea", dosage: "2mg", side: "Constipation", price: 12 },
    { name: "Bisacodyl", desc: "Laxative", usage: "Constipation", dosage: "5mg", side: "Cramps", price: 8 },
    { name: "Simethicone", desc: "Anti-gas", usage: "Gas, Bloating", dosage: "80mg", side: "Loose stools", price: 10 },
    { name: "Bismuth subsalicylate", desc: "Antidiarrheal/Antacid", usage: "Upset stomach, Diarrhea", dosage: "262mg", side: "Black tongue/stool", price: 15 },
    { name: "Meclizine", desc: "Antiemetic", usage: "Motion sickness, Vertigo", dosage: "25mg", side: "Drowsiness", price: 14 },
    { name: "Dicyclomine", desc: "Antispasmodic", usage: "Irritable bowel syndrome", dosage: "20mg", side: "Dry mouth", price: 22 },
    { name: "Sumatriptan", desc: "Triptan", usage: "Migraines", dosage: "50mg", side: "Tingling", price: 45 },
    { name: "Rizatriptan", desc: "Triptan", usage: "Migraines", dosage: "10mg", side: "Dizziness", price: 50 },
    { name: "Naloxone", desc: "Opioid antagonist", usage: "Opioid overdose", dosage: "4mg", side: "Withdrawal symptoms", price: 120 }
];

let content = fs.readFileSync(storePath, 'utf-8');

// Find where medicines array is
const medsIndex = content.indexOf('medicines: [');
if (medsIndex !== -1) {
    // We need to inject the logic to replace or append to the medicines array.
    // The simplest is string manipulation if the structure is simple.

    const endBracket = content.indexOf('],', medsIndex);

    if (endBracket !== -1) {
        let medsStr = "";

        // We already have 5, so we add the rest with generic IDs
        for (let i = 0; i < newMeds.length; i++) {
            const m = newMeds[i];
            medsStr += `    { _id: "m${i + 6}", med_name: "${m.name}", med_desc: "${m.desc}", usage: "${m.usage}", dosage: "${m.dosage}", side_effects: "${m.side}", med_price: ${m.price}, med_quantity: Math.floor(Math.random() * 100) + 20 },\n`;
        }

        // insert right before the closing bracket
        content = content.slice(0, endBracket) + "\n" + medsStr + content.slice(endBracket);

        fs.writeFileSync(storePath, content);
        console.log("Successfully seeded 95 more medicines (Total 100).");
    }
}

