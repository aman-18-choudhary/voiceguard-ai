import os
import sys
import asyncio
from dotenv import load_dotenv

# Load env before importing SupabaseService
load_dotenv()

# Add backend to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.supabase_service import get_supabase_client

client = get_supabase_client()

def run_validations():
    print("--- DATABASE VALIDATION ---")
    
    # COUNT QUERIES
    for table in ["alerts", "doctor_notes", "reports", "ai_analysis", "stress_analysis"]:
        try:
            res = client.table(table).select("*", count="exact").execute()
            print(f"SELECT COUNT(*) FROM {table}; => {res.count}")
        except Exception as e:
            print(f"SELECT COUNT(*) FROM {table}; => ERROR: {e}")
            
    print("\n--- NEWEST ALERT ---")
    try:
        res = client.table("alerts").select("*").order("created_at", desc=True).limit(1).execute()
        print(res.data)
    except Exception as e:
        print(f"ERROR: {e}")
    
    print("\n--- NEWEST DOCTOR NOTE ---")
    try:
        res = client.table("doctor_notes").select("*").order("created_at", desc=True).limit(1).execute()
        print(res.data)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    run_validations()
