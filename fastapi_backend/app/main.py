from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import re
import json
import pytesseract
from PIL import Image
import io
import requests

# Configure Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Dynamically loaded set of thousands of FDA drug names
FDA_MEDICINES = set()

def load_fda_medicines():
    global FDA_MEDICINES
    if FDA_MEDICINES:
        return
    print("Pre-fetching FDA generic drug names for Local OCR...")
    try:
        url = "https://api.fda.gov/drug/label.json?count=openfda.generic_name.exact&limit=1000"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            # Only include terms longer than 3 characters to prevent matching random 2-letter combos
            FDA_MEDICINES = set([r.get("term", "").lower() for r in data.get("results", []) if len(r.get("term", "")) > 3])
            print(f"Successfully loaded {len(FDA_MEDICINES)} real medicines into OCR dictionary.")
        else:
            print("FDA API unavailable. Using fallback medicine list.")
    except Exception as e:
        print(f"Could not load FDA names: {e}")

load_fda_medicines()

app = FastAPI()

from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Global Error: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )


def clean_prescription_text(raw_text: str) -> str:
    lines = raw_text.split('\n')
    cleaned_lines = []
    medicine_section = False
    for line in lines:
        line = line.strip()
        # Detect start of medicine section by keywords
        if re.search(r'\b(Medicine|Rx|TAB\.|CAP\.|SYP\.)\b', line, re.IGNORECASE):
            medicine_section = True
        if medicine_section:
            # Normalize common patterns
            line = re.sub(r'\b(Morning|Night|Aft|Eve)\b', lambda m: m.group(0).capitalize(), line, flags=re.IGNORECASE)
            line = re.sub(r'(Before|After)\s+Food', lambda m: m.group(0).lower(), line, flags=re.IGNORECASE)
            line = re.sub(r'\s+', ' ', line)  # Remove extra spaces
            line = re.sub(r'\(Tot:(.*?)\)', '', line)  # Remove total pills info (optional)
        cleaned_lines.append(line)
    # Join everything back
    cleaned_text = '\n'.join(cleaned_lines)
    # Add basic formatting if needed
    cleaned_text = re.sub(r'\s*\|\s*', '\n', cleaned_text)  # Split pipe-separated metadata
    cleaned_text = re.sub(r'(\d+\))', r'\n\1', cleaned_text)  # Ensure medicines start on a new line
    return cleaned_text.strip()


from google.genai import types

def extract_text_from_image(image_bytes: bytes) -> str:
    """Pass raw image bytes to Gemini Vision to extract the text directly."""
    if not client:
        return "Prescription image received, but AI is offline. Could not extract text."
    
    prompt = "Extract all text from this prescription image. Be as accurate as possible."
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
                prompt,
            ]
        )
        return response.text
    except Exception as e:
        print(f"Gemini Vision Error: {e}")
        return "Error extracting text using AI Vision."

def get_medicine_info(medicine_name: str) -> str:
    if not client:
        return f"{medicine_name}: Use as directed by your doctor. Check leaflet for side effects."
    prompt = (
        f"Provide a short medical description of the medicine '{medicine_name}', "
        "including its usage and side effects. Keep it concise and simple."
    )
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Gemini Info Fetch Error for {medicine_name}: {e}")
        return "Medical details unavailable right now (AI busy)."

def validate_and_extract_medicines(text: str) -> dict:
    prompt = (
        "Extract medicine names from the following prescription text.\n"
        "Return them in Markdown format as a bulleted list using dashes (-). "
        "Each medicine name should be on a new line, using sentence case.\n\n"
        f"Prescription Text:\n{text}"
    )
    if not client:
        return "- Paracetamol\n- Amoxicillin"
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception:
        return text if "- " in text else f"- {text}"



class ExtractMedicinesRequest(BaseModel):
    text: str


class MedicineItem(BaseModel):
    name: str
    dosage: Optional[str] = ""
    duration: Optional[str] = ""
    frequency: Optional[str] = ""


@app.post("/extract_medicines/")
async def extract_medicines_structured(data: ExtractMedicinesRequest):
    """Return structured list of medicines for prescription text."""
    text = data.text or " "
    prompt = (
        "From the following COMPUTERIZED typed prescription text, extract each medicine with its dosage and duration.\n"
        "Return ONLY a valid JSON array of objects, no other text. Each object must have: name (string), dosage (string), duration (string).\n"
        "Focus only on medicine names, their specific strengths/dosages (e.g., 500mg, 1 Morning), and duration (e.g. 5 Days, 1 Month).\n"
        "Example: [{\"name\": \"Paracetamol\", \"dosage\": \"500mg - 1 Morning\", \"duration\": \"5 Days\"}]\n\n"
        f"Prescription Text:\n{text}"
    )
    if not client:
        return {"medicines": [{"name": "Paracetamol", "dosage": "500mg"}]}
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        raw = (response.text or "").strip()
        
        if raw.startswith("```"):
            raw = re.sub(r"^```\w*\n?", "", raw).replace("```", "").strip()
        arr = json.loads(raw)
        medicines = [
            {"name": str(m.get("name", "")), "dosage": str(m.get("dosage", "")), "duration": str(m.get("duration", ""))}
            for m in arr if isinstance(m, dict)
        ]
        return {"medicines": medicines}
    except Exception as e:
        print(f"Error parsing Gemini JSON: {e}")
        return {"medicines": [{"name": "Error Parsing Prescription", "dosage": ""}]}

class Message(BaseModel):
    user_input: str

@app.post("/chat")
async def chat(message: Message):
    user_text = message.user_input or ""
    if not client:
        return {"reply": "I'm here to help with medicine questions. Please ask about dosage, usage, or side effects."}
    prompt = (
        "You are a friendly pharmacy assistant. Answer the customer's query concisely. "
        "If they ask about medicines, dosage, when to take, or side effects, give clear short answers."
        f"\n\nCustomer: {user_text}"
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    reply_text = response.text or "I couldn't process that. Please try again."
    return {"reply": reply_text}

@app.post("/extract_text/")
async def extract_text(file: UploadFile = File(...)):
    contents = await file.read()
    raw_text = extract_text_from_image(contents)
    cleaned_text = clean_prescription_text(raw_text)
    
    return {"extracted_text": cleaned_text}

def fallback_local_ocr(image_bytes: bytes) -> list:
    """Uses local PyTesseract when GenAI is rate-limited or offline.
       Strategy 1: Look for numbered medicine lines (1) TAB. BRANDNAME)
       Strategy 2: Fallback to FDA dictionary matching."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')

        extracted_text = pytesseract.image_to_string(img)
        print("Tesseract Extracted:", extracted_text)

        lines = [line.strip() for line in extracted_text.split('\n') if len(line.strip()) > 2]
        medicines = []

        # ----- STRATEGY 1: Numbered prescription lines like "1) TAB. VOMILAST 500mg" -----
        # Matches lines starting with a number and TAB/CAP/SYP followed by the medicine name
        numbered_rx = re.compile(
            r'^\d+[\.\)]\s*(?:tab\.?|cap\.?|syp\.?|inj\.?|syr\.?|tab|cap|syp|inj)',
            re.IGNORECASE
        )
        for line in lines:
            if numbered_rx.match(line):
                # Strip the leading number and dosage keyword to get the name
                clean = re.sub(r'^\d+[\.\)]\s*', '', line).strip()
                clean = re.sub(r'^(?:tab\.?|cap\.?|syp\.?|inj\.?|syr\.?|tab|cap|syp|inj)\s*', '', clean, flags=re.IGNORECASE).strip()
                # Remove trailing dosage details like "/ SR" or "10/SR" at this stage - keep name
                med_name = re.split(r'\s+\d', clean)[0].strip().rstrip('/').rstrip('.').strip()
                dosage = ""
                dosage_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|iu|%))\b', line, re.IGNORECASE)
                if dosage_match:
                    dosage = dosage_match.group(1)
                frequency = ""
                freq_match = re.search(
                    r'\b(morning|night|evening|afternoon|twice\s+daily|once\s+daily|thrice\s+daily|bd|tds|od|before\s+food|after\s+food)\b',
                    line, re.IGNORECASE
                )
                if freq_match:
                    frequency = freq_match.group(0).strip()
                if med_name and len(med_name) > 1:
                    medicines.append({"name": med_name.title(), "dosage": dosage, "frequency": frequency})

        # ----- STRATEGY 2: FDA dictionary matching (only if no numbered lines found) -----
        if not medicines:
            valid_medicines = {
                "syrup", "ointment", "drops", "inhaler", "injection", "lotion",
                "cream", "gel", "powder", "tablet", "capsule", "crocin", "dolo", "calpol"
            }.union(FDA_MEDICINES)

            for line in lines:
                line_lower = line.lower()
                found_meds = [med for med in valid_medicines if med in line_lower and len(med) > 4]
                if found_meds:
                    found_meds.sort(key=len, reverse=True)
                    best_med = found_meds[0].title()
                    dosage = ""
                    dosage_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|iu|%))\b', line, re.IGNORECASE)
                    if dosage_match:
                        dosage = dosage_match.group(1)
                    medicines.append({"name": best_med, "dosage": dosage, "frequency": ""})

        # Remove duplicates and dosage-form-only entries
        form_words = {"tablet", "capsule", "syrup", "injection", "drops", "ointment", "lotion", "cream", "gel", "powder"}
        unique_medicines = []
        seen = set()
        for med in medicines:
            key = med['name'].lower()
            if key not in seen and key not in form_words:
                seen.add(key)
                unique_medicines.append(med)

        return unique_medicines or [{"name": "Could not confidently identify medicines. Please type them manually.", "dosage": "", "frequency": ""}]

    except Exception as e:
        print(f"Local OCR Fallback Error: {e}")
        return [{"name": "Error Processing Image Locally", "dosage": "", "frequency": ""}]

@app.post("/extract_vision/")
async def extract_vision(file: UploadFile = File(...)):
    contents = await file.read()
    if not client:
         return {"medicines": fallback_local_ocr(contents)}
         
    prompt = (
        "Extract all medicine names from this COMPUTERIZED typed prescription image with their dosage and duration (frequency like 1 Morning/Night and days like 5 Days).\n"
        "Return ONLY a valid JSON array of objects, no other text. Each object must have: name (string), dosage (string), duration (string).\n"
        "Focus only on medicine names, specific strengths/dosages (e.g., 500mg, 1 Morning), and duration (e.g., 8 Days, 1 Month).\n"
        "Example: [{\"name\": \"Paracetamol\", \"dosage\": \"500mg - 1 Morning\", \"duration\": \"5 Days\"}]\n\n"
    )
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                types.Part.from_bytes(data=contents, mime_type='image/jpeg'),
                prompt,
            ]
        )
        
        raw = (response.text or "").strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```\w*\n?", "", raw).replace("```", "").strip()
        arr = json.loads(raw)
        medicines = [
            {"name": str(m.get("name", "")), "dosage": str(m.get("dosage", "")), "duration": str(m.get("duration", ""))}
            for m in arr if isinstance(m, dict)
        ]
        return {"medicines": medicines}
    except Exception as e:
        print(f"Gemini API Error. Falling back to local OCR... cause: {e}")
        # Automatically fallback to local Tesseract OCR on HTTP 429 or Timeout
        fallback_results = fallback_local_ocr(contents)
        return {"medicines": fallback_results}


@app.post("/validate_prescription/")
async def validate_prescription(data: dict):
    text = data.get("text", "")
    response_text = validate_and_extract_medicines(text)
    medicine_names = [
        line.lstrip("- ").strip()
        for line in response_text.split("\n")
        if line.strip().startswith("-")
    ]
    info = {med: get_medicine_info(med) for med in medicine_names}
    return {
        "validated": response_text,
        "details": info
    }


@app.post("/medicine_info/")
async def medicine_info(data: dict):
    medicines: List[str] = data.get("medicines", [])
    info = {med: get_medicine_info(med) for med in medicines}
    return {"medicine_info": info}