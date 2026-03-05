import requests
import json

def fetch_rx_terms():
    print("Fetching RxTerms...")
    url = "https://rxnav.nlm.nih.gov/REST/RxTerms/allconcepts.json"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            concepts = data.get("minConceptGroup", {}).get("minConcept", [])
            names = set([concept.get("name", "").lower() for concept in concepts])
            print(f"Loaded {len(names)} medicine concepts from RxTerms.")
            print("Sample:", list(names)[:10])
        else:
            print("Failed with status:", response.status_code)
    except Exception as e:
         print("Error:", e)

fetch_rx_terms()
