from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.supabase_service import supabase_service
from services.whisper_service import WhisperService
import uuid
import os
import shutil

from contextlib import asynccontextmanager
import sys
from core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate environment variables
    if not settings.SUPABASE_URL or settings.SUPABASE_URL == "placeholder":
        print("Missing environment variable:\nSUPABASE_URL", file=sys.stderr)
        sys.exit(1)
        
    if not settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_SERVICE_ROLE_KEY == "placeholder":
        print("Missing environment variable:\nSUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        sys.exit(1)
        
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder":
        print("Missing environment variable:\nGROQ_API_KEY", file=sys.stderr)
        sys.exit(1)
        
    print("✓ Environment Ready: .env loaded")
    
    # Initialize/verify clients
    from services.supabase_service import supabase_service
    if supabase_service.client:
        print("✓ Database Ready: Supabase connected")
    else:
        print("✗ Database Error: Supabase client failed to initialize", file=sys.stderr)
        sys.exit(1)
        
    from langchain_groq import ChatGroq
    try:
        # A quick initialization to ensure the key is accepted by the library
        test_llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)
        print("✓ Groq Ready: ChatGroq client connected")
    except Exception as e:
        print(f"✗ Groq Error: {e}", file=sys.stderr)
        sys.exit(1)
        
    from services.ai.langgraph_service import langgraph_service
    if langgraph_service.pipeline:
        print("✓ LangGraph Ready: Pipeline compiled and initialized")
        
    yield

from routers import doctor, analytics, export

app = FastAPI(title="VoiceGuard AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(doctor.router)
app.include_router(analytics.router)
app.include_router(export.router)

whisper_service = WhisperService(model_size="base")

# Ensure temp directory exists for audio uploads
os.makedirs("/tmp/voiceguard", exist_ok=True)

def process_audio_pipeline(report_id: str, user_id: str, file_path: str):
    """Background task to handle the end-to-end processing pipeline"""
    try:
        # Step 1: Upload to Supabase Storage
        audio_url = supabase_service.upload_audio(user_id, report_id, file_path)
        
        # Step 2: Create DB Record (UPLOADING state)
        supabase_service.create_report_record(report_id, user_id, audio_url)
        
        # Step 3: Trigger Transcribing State
        supabase_service.update_report_status(report_id, "TRANSCRIBING")
        
        # Step 4: Run Faster Whisper
        transcript = whisper_service.transcribe(file_path)
        
        # Step 5: Store Transcript & Final Status (Halting for Human Review)
        supabase_service.update_report_status(
            report_id, 
            "TRANSCRIBED", 
            transcript=transcript, 
            original_transcript=transcript
        )
        
        # Step 6: Wait for human review (AI pipeline is now triggered via /submit endpoint)
        print(f"[{report_id}] Ready for human review.")
        
    except Exception as e:
        print(f"Error in processing pipeline: {e}")
        supabase_service.update_report_status(report_id, "FAILED")
    finally:
        # Cleanup temp file (we will re-download it when AI pipeline runs)
        if os.path.exists(file_path):
            os.remove(file_path)


from dependencies.auth import get_current_user
from fastapi import Depends

@app.get("/")
def read_root():
    return {"status": "online", "service": "VoiceGuard AI Phase 3"}

@app.post("/api/v1/reports/upload")
async def upload_audio(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    try:
        user_id = user.get("sub")
        report_id = f"VG-{str(uuid.uuid4())[:8].upper()}"
        temp_file_path = f"/tmp/voiceguard/{report_id}_{audio.filename}"
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
            
        # Start the background processing pipeline
        background_tasks.add_task(process_audio_pipeline, report_id, user_id, temp_file_path)
        
        return {
            "report_id": report_id,
            "status": "UPLOADING",
            "message": "Audio received. Processing started."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/reports/history")
async def get_user_reports(user: dict = Depends(get_current_user)):
    if not supabase_service.client:
        return []
    
    user_id = user.get("sub")
    res = supabase_service.client.table("reports").select("*").eq("user_id", user_id).order("processing_started_at", desc=True).execute()
    
    reports = res.data if res.data else []
    enriched = []
    for r in reports:
        analysis = supabase_service.get_analysis(r["id"])
        severity_obj = analysis.get("severity") if analysis else None
        severity = severity_obj.get("final_severity", "Unknown") if severity_obj else "Unknown"
        r["severity"] = severity
        enriched.append(r)
        
    return enriched

@app.get("/api/v1/reports/{report_id}")
async def get_report(report_id: str, user: dict = Depends(get_current_user)):
    report = supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return {
        "report": report,
        "status": report.get("status"),
        "transcript": report.get("transcript")
    }

def process_ai_pipeline(report_id: str, transcript: str):
    from services.ai.langgraph_service import langgraph_service
    import os
    try:
        print("\n=== AI Analysis Input Payload ===")
        print(f"Report ID: {report_id}")
        print(f"Transcript Length: {len(transcript) if transcript else 0}")
        print(f"Transcript Content: '{transcript}'")
        print("=================================\n")
        
        # Download audio for stress analysis
        report = supabase_service.get_report(report_id)
        audio_url = report.get("audio_url") if report else None
        
        audio_path = None
        if audio_url:
            os.makedirs("/tmp/voiceguard", exist_ok=True)
            audio_path = f"/tmp/voiceguard/{report_id}_downloaded.webm"
            supabase_service.download_audio(audio_url, audio_path)
        
        if not transcript or len(transcript.strip()) < 10:
            raise ValueError("Transcript too short for analysis")
            
        supabase_service.update_report_status(report_id, "ANALYZING")
        state = langgraph_service.analyze_report(report_id, transcript, audio_path)
        supabase_service.save_analysis(report_id, state.model_dump())
        
        if state.stress_metrics:
            supabase_service.save_stress_analysis(report_id, state.stress_metrics.model_dump())
            
        if state.explainability:
            evidence_data = [e.model_dump() for e in state.evidence] if state.evidence else []
            supabase_service.save_explanation(report_id, state.explainability.model_dump(), evidence_data)
            
        # --- ALERT SYSTEM LOGIC ---
        severity_label = state.severity.final_severity if state.severity else "LOW"
        stress_label = state.stress_metrics.stress_level if state.stress_metrics else "LOW"
        
        if severity_label in ["HIGH", "CRITICAL"] or stress_label == "HIGH":
            import uuid
            alert_id = f"ALT-{str(uuid.uuid4())[:8].upper()}"
            alert_type = "CRITICAL_ADR" if severity_label == "CRITICAL" else "HIGH_RISK"
            supabase_service.create_alert(alert_id, report_id, severity_label, alert_type)
            
        supabase_service.update_report_status(report_id, "COMPLETED")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in AI pipeline: {e}")
        supabase_service.update_report_status(report_id, "ANALYSIS_FAILED")
    finally:
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            
from pydantic import BaseModel
class SubmitReportRequest(BaseModel):
    corrected_transcript: str

@app.post("/api/v1/reports/{report_id}/submit")
async def submit_report(report_id: str, payload: SubmitReportRequest, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)):
    report = supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    corrected = payload.corrected_transcript
    
    # Save corrected transcript
    supabase_service.update_report_status(
        report_id, 
        "ANALYZING", 
        transcript=corrected,
        corrected_transcript=corrected
    )
    
    # Run analysis
    background_tasks.add_task(process_ai_pipeline, report_id, corrected)
    return {"status": "ANALYZING", "message": "Report submitted. AI analysis started."}

@app.post("/api/v1/analyze/{report_id}")
async def analyze_report(report_id: str, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)):
    report = supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    transcript = report.get("transcript")
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript not ready")
        
    background_tasks.add_task(process_ai_pipeline, report_id, transcript)
    return {"status": "ANALYZING", "message": "AI analysis started"}

@app.get("/api/v1/analysis/{report_id}")
async def get_analysis(report_id: str, user: dict = Depends(get_current_user)):
    report = supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    analysis = supabase_service.get_analysis(report_id)
    stress = supabase_service.get_stress_analysis(report_id)
    explanation = supabase_service.get_explanation(report_id)
    
    return {
        "report": report,
        "analysis": analysis,
        "stress_analysis": stress,
        "explanations": explanation
    }

@app.get("/api/v1/stress/{report_id}")
async def get_stress(report_id: str, user: dict = Depends(get_current_user)):
    stress = supabase_service.get_stress_analysis(report_id)
    if not stress:
        raise HTTPException(status_code=404, detail="Stress analysis not found")
    return stress

@app.get("/api/v1/severity/{report_id}")
async def get_severity(report_id: str, user: dict = Depends(get_current_user)):
    analysis = supabase_service.get_analysis(report_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"severity": analysis.get("severity")}

@app.get("/api/v1/explanations/{report_id}")
async def get_explanations(report_id: str, user: dict = Depends(get_current_user)):
    explanation = supabase_service.get_explanation(report_id)
    if not explanation:
        raise HTTPException(status_code=404, detail="Explainability data not found")
    return explanation

@app.get("/api/v1/evidence/{report_id}")
async def get_evidence(report_id: str, user: dict = Depends(get_current_user)):
    explanation = supabase_service.get_explanation(report_id)
    if not explanation:
        raise HTTPException(status_code=404, detail="Evidence data not found")
    return {"evidence": explanation.get("evidence", [])}
