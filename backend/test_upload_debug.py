import os
import sys
import asyncio
from services.supabase_service import supabase_service
import uuid

def test_upload():
    report_id = f"VG-TEST-{str(uuid.uuid4())[:8].upper()}"
    file_path = "/tmp/voiceguard/test_audio.webm"
    
    # Create dummy audio file
    os.makedirs("/tmp/voiceguard", exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(b"dummy audio data")
        
    print(f"Testing upload for {report_id}...")
    try:
        # Step 1: Upload to Supabase Storage
        audio_url = supabase_service.upload_audio("test_user", report_id, file_path)
        print(f"Upload success! URL: {audio_url}")
        
        # Step 2: Create DB Record
        supabase_service.create_report_record(report_id, "test_user", audio_url)
        print("Record created!")
        
    except Exception as e:
        print(f"FAILED with error: {type(e).__name__} - {e}")
        
if __name__ == "__main__":
    test_upload()
