import asyncio
import traceback
from services.supabase_service import supabase_service
from services.ai.langgraph_service import langgraph_service

def test_ai_pipeline_on_report(report_id, transcript):
    try:
        print(f"Testing LangGraph for {report_id}...")
        
        # create a dummy file
        import os
        os.makedirs("/tmp/voiceguard", exist_ok=True)
        dummy_audio = f"/tmp/voiceguard/{report_id}_test.webm"
        with open(dummy_audio, "wb") as f:
            f.write(b"dummy webm data")
            
        state = langgraph_service.analyze_report(report_id, transcript, audio_path=dummy_audio)
        print("LangGraph analysis successful.")
        
        print("Saving to ai_analysis...")
        supabase_service.save_analysis(report_id, state.model_dump())
        print("save_analysis successful.")
        
        if state.stress_metrics:
            print("Saving to stress_analysis...")
            supabase_service.save_stress_analysis(report_id, state.stress_metrics.model_dump())
            print("save_stress_analysis successful.")
            
        severity_label = state.severity.final_severity if state.severity else "LOW"
        stress_label = state.stress_metrics.stress_level if state.stress_metrics else "LOW"
        
        if severity_label in ["HIGH", "CRITICAL"] or stress_label == "HIGH":
            print("Saving alert...")
            import uuid
            alert_id = f"ALT-{str(uuid.uuid4())[:8].upper()}"
            alert_type = "CRITICAL_ADR" if severity_label == "CRITICAL" else "HIGH_RISK"
            supabase_service.create_alert(alert_id, report_id, severity_label, alert_type)
            print("create_alert successful.")
            
        print("Done.")
    except Exception as e:
        print(f"Caught Exception: {type(e).__name__}: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_ai_pipeline_on_report("VG-75FC7397", "See, this is what it looks like.  The device system is very different.")
