import asyncio
import uuid
import sys
from services.supabase_service import supabase_service
from main import process_ai_pipeline

async def run_test():
    report_id = f"TEST-{str(uuid.uuid4())[:8].upper()}"
    transcript = "I took amoxicillin and within 30 minutes developed severe facial swelling, difficulty breathing, and chest tightness."
    
    print(f"Creating report {report_id}...")
    supabase_service.create_report_record(report_id, "user-test", "test.wav")
    supabase_service.update_report_status(report_id, "TRANSCRIBED", transcript)
    
    print(f"Running AI pipeline for {report_id}...")
    try:
        process_ai_pipeline(report_id, transcript)
        print("Pipeline finished.")
        
        print("Adding Doctor Note...")
        note_id = f"NOTE-{str(uuid.uuid4())[:8].upper()}"
        supabase_service.add_doctor_note(note_id, report_id, "DOC-1", "Patient needs immediate epi-pen and observation.")
        notes = supabase_service.get_doctor_notes(report_id)
        print(f"Doctor Notes for {report_id}: {notes}")
        
    except Exception as e:
        print(f"Pipeline error: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
