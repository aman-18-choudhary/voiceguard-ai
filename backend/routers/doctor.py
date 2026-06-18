from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.supabase_service import supabase_service
from dependencies.auth import get_current_user
import uuid

router = APIRouter(prefix="/api/v1/doctor", tags=["doctor"])

class NoteRequest(BaseModel):
    report_id: str
    doctor_id: str
    note: str

@router.get("/reports")
async def get_all_reports(user: dict = Depends(get_current_user)):
    if not supabase_service.client:
        return []
        
    res = supabase_service.client.table("reports").select("*").order("created_at", desc=True).execute()
    
    # Enrich with analysis summary and severity
    reports = res.data if res.data else []
    enriched = []
    for r in reports:
        analysis = supabase_service.get_analysis(r["id"])
        stress = supabase_service.get_stress_analysis(r["id"])
        
        severity = analysis.get("severity", {}).get("final_severity", "Unknown") if analysis else "Unknown"
        stress_lvl = stress.get("stress_level", "Unknown") if stress else "Unknown"
        
        # Only take first drug/symptom for table preview
        drug = "None"
        symptom = "None"
        if analysis:
            drugs = analysis.get("drugs", [])
            symptoms = analysis.get("symptoms", [])
            if drugs: drug = drugs[0].get("name", "Unknown")
            if symptoms: symptom = symptoms[0].get("name", "Unknown")
            
        r["severity"] = severity
        r["stress_level"] = stress_lvl
        r["primary_drug"] = drug
        r["primary_symptom"] = symptom
        enriched.append(r)
        
    return enriched

@router.get("/alerts")
async def get_alerts(user: dict = Depends(get_current_user)):
    return supabase_service.get_alerts()

@router.post("/notes")
async def add_note(req: NoteRequest, user: dict = Depends(get_current_user)):
    note_id = f"NOTE-{str(uuid.uuid4())[:8].upper()}"
    supabase_service.add_doctor_note(note_id, req.report_id, req.doctor_id, req.note)
    return {"status": "success", "note_id": note_id}

@router.get("/notes/{report_id}")
async def get_notes(report_id: str, user: dict = Depends(get_current_user)):
    return supabase_service.get_doctor_notes(report_id)
