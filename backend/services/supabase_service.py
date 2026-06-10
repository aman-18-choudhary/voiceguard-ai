import os
import uuid
from supabase import create_client, Client
from core.config import settings

def get_supabase_client() -> Client:
    # Use empty string fallback to prevent crash if not configured yet
    url = settings.SUPABASE_URL or ""
    key = settings.SUPABASE_KEY or ""
    
    if url == "placeholder" or not url:
        # Prevent crash during local dev before keys are added
        # Return a mocked/dummy client if needed, or let it raise
        pass
        
    return create_client(url, key)

class SupabaseService:
    def __init__(self):
        try:
            self.client = get_supabase_client()
        except Exception as e:
            print(f"Warning: Supabase client not initialized: {e}")
            self.client = None
            
    def upload_audio(self, user_id: str, report_id: str, file_path: str) -> str:
        if not self.client:
            return "http://localhost/mock_audio.webm"
            
        bucket_name = "adr-audio"
        storage_path = f"{user_id}/{report_id}/audio.webm"
        
        with open(file_path, "rb") as f:
            self.client.storage.from_(bucket_name).upload(
                path=storage_path,
                file=f,
                file_options={"content-type": "audio/webm"}
            )
            
        # Get public URL
        res = self.client.storage.from_(bucket_name).get_public_url(storage_path)
        return res

    def create_report_record(self, report_id: str, user_id: str, audio_url: str):
        if not self.client:
            return
            
        data = {
            "id": report_id,
            "patient_id": user_id,
            "audio_url": audio_url,
            "status": "UPLOADING"
        }
        
        self.client.table("reports").insert(data).execute()

    def update_report_status(self, report_id: str, status: str, transcript: str = None):
        if not self.client:
            return
            
        data = {"status": status}
        if transcript is not None:
            data["transcript"] = transcript
            
        self.client.table("reports").update(data).eq("id", report_id).execute()
        
    def get_report(self, report_id: str):
        if not self.client:
            return {"id": report_id, "status": "TRANSCRIBED", "transcript": "Mock transcript."}
            
        res = self.client.table("reports").select("*").eq("id", report_id).execute()
        if res.data:
            return res.data[0]
        return None
