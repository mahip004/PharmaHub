import requests
import json

def fetch_fda_drugs():
    print("Fetching Drugs from OpenFDA...")
    url = "https://api.fda.gov/drug/label.json?count=openfda.generic_name.exact"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            names = set([res.get("term", "").lower() for res in results if res.get("term")])
            print(f"Loaded {len(names)} generic drug names from FDA.")
            print("Sample:", list(names)[:20])
        else:
            print("Failed with status:", response.status_code)
    except Exception as e:
         print("Error:", e)

fetch_fda_drugs()
