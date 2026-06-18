import os
import sys
import uuid
import json
from dotenv import load_dotenv

# Load env before importing services
load_dotenv()

from services.supabase_service import SupabaseService
from services.ai.langgraph_service import langgraph_service

def run_validation():
    print("\n--- Starting Phase 4 Validation ---")
    
    # 1. Init Supabase
    db = SupabaseService()
    if not db.client:
        print("✗ Supabase client failed to initialize")
        sys.exit(1)
    print("✓ Supabase connected")
    
    # 2. Check LangGraph
    if not langgraph_service.pipeline:
        print("✗ LangGraph pipeline failed to compile")
        sys.exit(1)
    print("✓ LangGraph initialized")
    
    # 3. Create Mock Report
    report_id = f"VG-TEST-{str(uuid.uuid4())[:6].upper()}"
    transcript = "I started taking Lisinopril on Monday and developed a dry cough on Wednesday."
    
    print(f"\n[Test Report ID]: {report_id}")
    print(f"[Input Transcript]: {transcript}")
    
    db.client.table("reports").insert({
        "id": report_id,
        "patient_id": "test_user",
        "audio_url": "http://test.com/audio.webm",
        "status": "TRANSCRIBED",
        "transcript": transcript
    }).execute()
    
    # 4. Run LangGraph Pipeline
    print("\nRunning AI Pipeline (this may take a few seconds)...")
    state = langgraph_service.analyze_report(report_id, transcript)
    
    # 5. Save Analysis
    analysis_data = state.model_dump()
    db.save_analysis(report_id, analysis_data)
    db.update_report_status(report_id, "COMPLETED")
    
    # 6. Fetch from DB to verify
    fetched = db.get_analysis(report_id)
    if not fetched:
        print("✗ Failed to fetch analysis from database")
        sys.exit(1)
        
    print("\n--- Validation Results ---")
    print(f"Drugs Extracted: {json.dumps(fetched['drugs'], indent=2)}")
    print(f"Symptoms Extracted: {json.dumps(fetched['symptoms'], indent=2)}")
    print(f"Timeline: {json.dumps(fetched['timeline'], indent=2)}")
    print(f"Summary: {fetched['summary']}")
    print(f"Confidence Score: {fetched['confidence']}")
    print(f"Errors: {state.errors}")
    print("\n--- Exact ai_analysis row inserted into Supabase ---")
    print(json.dumps(fetched, indent=2))
    print("\n✓ Phase 4 Validation Complete!")

if __name__ == "__main__":
    run_validation()
