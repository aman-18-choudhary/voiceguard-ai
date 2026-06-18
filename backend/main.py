from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.supabase_service import SupabaseService
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

app = FastAPI(title="VoiceGuard AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_service = SupabaseService()
whisper_service = WhisperService(model_size="tiny")

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
        
        # Step 5: Store Transcript & Final Status
        supabase_service.update_report_status(report_id, "TRANSCRIBED", transcript)
        
    except Exception as e:
        print(f"Error in processing pipeline: {e}")
        supabase_service.update_report_status(report_id, "FAILED")
    finally:
        # Cleanup temp file
        if os.path.exists(file_path):
            os.remove(file_path)


@app.get("/")
def read_root():
    return {"status": "online", "service": "VoiceGuard AI Phase 3"}

@app.post("/api/v1/reports/upload")
async def upload_audio(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    user_id: str = Form("anonymous")
):
    try:
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

@app.get("/api/v1/reports/{report_id}")
async def get_report(report_id: str):
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
    try:
        supabase_service.update_report_status(report_id, "ANALYZING")
        state = langgraph_service.analyze_report(report_id, transcript)
        supabase_service.save_analysis(report_id, state.model_dump())
        supabase_service.update_report_status(report_id, "COMPLETED")
    except Exception as e:
        print(f"Error in AI pipeline: {e}")
        supabase_service.update_report_status(report_id, "ANALYSIS_FAILED")

@app.post("/api/v1/analyze/{report_id}")
async def analyze_report(report_id: str, background_tasks: BackgroundTasks):
    report = supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    transcript = report.get("transcript")
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript not ready")
        
    background_tasks.add_task(process_ai_pipeline, report_id, transcript)
    return {"status": "ANALYZING", "message": "AI analysis started"}

@app.get("/api/v1/analysis/{report_id}")
async def get_analysis(report_id: str):
    report = supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    analysis = supabase_service.get_analysis(report_id)
    
    return {
        "report": report,
        "analysis": analysis
    }
