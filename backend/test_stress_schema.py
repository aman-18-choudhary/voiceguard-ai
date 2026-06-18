import os
import requests
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Accept": "application/json"
}

data = {
    "report_id": "FAKE",
    "stress_score": 50,
    "stress_level": "LOW",
    "pitch_mean": 1.0,
    "speech_rate": 1.0,
    "rms_energy": 1.0
}
resp = requests.post(f"{url}/rest/v1/stress_analysis", headers=headers, json=data)
print("Status:", resp.status_code)
print("Response:", resp.text)
