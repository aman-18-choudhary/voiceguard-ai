import os
import requests
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

# Try to see if we can use the postgres API directly
print("Checking tables...")
resp = requests.get(f"{url}/rest/v1/", headers=headers)
print(resp.status_code)
