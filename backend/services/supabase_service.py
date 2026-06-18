import os
import uuid
from supabase import create_client, Client
from core.config import settings

def get_supabase_client() -> Client:
    # Use empty string fallback to prevent crash if not configured yet
    url = settings.SUPABASE_URL or ""
    key = settings.SUPABASE_SERVICE_ROLE_KEY or ""
    
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

    def download_audio(self, audio_url: str, save_path: str):
        if not self.client:
            return
        
        import requests
        try:
            response = requests.get(audio_url)
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"Downloaded audio from {audio_url} to {save_path}")
        except Exception as e:
            print(f"Failed to download audio: {e}")

    def create_report_record(self, report_id: str, user_id: str, audio_url: str):
        if not self.client:
            return
            
        data = {
            "id": report_id,
            "user_id": user_id,
            "audio_url": audio_url,
            "status": "UPLOADING"
        }
        
        self.client.table("reports").insert(data).execute()

    def update_report_status(self, report_id: str, status: str, transcript: str = None, original_transcript: str = None, corrected_transcript: str = None):
        if not self.client:
            return
            
        data = {"status": status}
        if transcript is not None:
            data["transcript"] = transcript
        if original_transcript is not None:
            data["original_transcript"] = original_transcript
        if corrected_transcript is not None:
            data["corrected_transcript"] = corrected_transcript
            
        self.client.table("reports").update(data).eq("id", report_id).execute()
        
    def get_report(self, report_id: str):
        if not self.client:
            return {"id": report_id, "status": "TRANSCRIBED", "transcript": "Mock transcript."}
            
        res = self.client.table("reports").select("*").eq("id", report_id).execute()
        if res.data:
            return res.data[0]
        return None

    def save_analysis(self, report_id: str, analysis_data: dict):
        if not self.client:
            return
            
        data = {
            "report_id": report_id,
            "drugs": analysis_data.get("drugs", []),
            "symptoms": analysis_data.get("symptoms", []),
            "timeline": analysis_data.get("timeline", []),
            "summary": analysis_data.get("summary", ""),
            "confidence": analysis_data.get("confidence", 0),
            "severity": analysis_data.get("severity")
        }
        
        # Upsert just in case it's run multiple times
        self.client.table("ai_analysis").upsert(data).execute()

    def get_analysis(self, report_id: str):
        if not self.client:
            return None
            
        res = self.client.table("ai_analysis").select("*").eq("report_id", report_id).execute()
        if res.data:
            return res.data[0]
        return None

    def save_stress_analysis(self, report_id: str, stress_data: dict):
        if not self.client:
            return
            
        data = {
            "report_id": report_id,
            "stress_score": stress_data.get("stress_score", 0),
            "stress_level": stress_data.get("stress_level", "LOW"),
            "pitch_mean": stress_data.get("pitch_mean", 0.0),
            "pitch_variance": stress_data.get("pitch_variance", 0.0),
            "speech_rate": stress_data.get("speech_rate", 0.0),
            "rms_energy": stress_data.get("rms_energy", 0.0),
            "shap_explanation": stress_data.get("shap_explanation", {})
        }
        
        self.client.table("stress_analysis").upsert(data).execute()

    def get_stress_analysis(self, report_id: str):
        if not self.client:
            return None
            
        res = self.client.table("stress_analysis").select("*").eq("report_id", report_id).execute()
        if res.data:
            return res.data[0]
        return None

    def create_alert(self, alert_id: str, report_id: str, severity: str, alert_type: str):
        if not self.client: return
        data = {
            "id": alert_id,
            "report_id": report_id,
            "severity": severity,
            "alert_type": alert_type,
            "status": "PENDING"
        }
        self.client.table("alerts").insert(data).execute()

    def get_alerts(self):
        if not self.client: return []
        res = self.client.table("alerts").select("*").order("created_at", desc=True).execute()
        return res.data if res.data else []

    def save_explanation(self, report_id: str, explainability: dict, evidence: list):
        if not self.client: return
        data = {
            "report_id": report_id,
            "severity_reason": explainability.get("severity_reason", ""),
            "confidence_reason": explainability.get("confidence_reason", ""),
            "timeline_reason": explainability.get("timeline_reason", ""),
            "evidence": evidence
        }
        self.client.table("report_explanations").upsert(data).execute()

    def get_explanation(self, report_id: str):
        if not self.client: return None
        res = self.client.table("report_explanations").select("*").eq("report_id", report_id).execute()
        if res.data:
            return res.data[0]
        return None
        
    def add_doctor_note(self, note_id: str, report_id: str, doctor_id: str, note: str):
        if not self.client: return
        data = {
            "id": note_id,
            "report_id": report_id,
            "doctor_id": doctor_id,
            "note": note
        }
        self.client.table("doctor_notes").insert(data).execute()
        
    def get_doctor_notes(self, report_id: str):
        if not self.client: return []
        res = self.client.table("doctor_notes").select("*").eq("report_id", report_id).order("created_at", desc=False).execute()
        return res.data if res.data else []
        
supabase_service = SupabaseService()
