import os
import sys
import uuid
import random
from datetime import datetime, timedelta, timezone
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.supabase_service import SupabaseService

def generate_demo_data():
    s = SupabaseService()
    if not s.client:
        print("Failed to initialize Supabase client.")
        return

    print("Generating 30 demo reports...")
    
    drugs = ["Amoxicillin", "Lisinopril", "Atorvastatin", "Metformin", "Ibuprofen", "Omeprazole", "Sertraline", "Albuterol"]
    symptoms = [
        ("Facial Swelling", "severe"),
        ("Hives", "moderate"),
        ("Nausea", "mild"),
        ("Dizziness", "moderate"),
        ("Chest Pain", "severe"),
        ("Headache", "mild"),
        ("Shortness of breath", "severe"),
        ("Joint Pain", "moderate"),
        ("Fatigue", "mild"),
        ("Anaphylaxis", "severe")
    ]
    
    # 30 days of data
    now = datetime.now(timezone.utc)
    
    for i in range(30):
        report_id = f"VG-DEMO{str(uuid.uuid4())[:4].upper()}"
        user_id = "demo_user"
        
        # Distribute created_at over the last 30 days
        created_at = (now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))).isoformat()
        
        # 1. Report
        selected_drug = random.choice(drugs)
        sym1 = random.choice(symptoms)
        sym2 = random.choice(symptoms) if random.random() > 0.5 else None
        
        transcript = f"I took {selected_drug} and started experiencing {sym1[0]}."
        if sym2:
            transcript += f" I also had {sym2[0]}."
            
        s.client.table("reports").insert({
            "id": report_id,
            "patient_id": user_id,
            "status": "COMPLETED",
            "audio_url": "https://example.com/audio.webm",
            "transcript": transcript,
            "original_transcript": transcript,
            "processing_completed_at": created_at
        }).execute()
        
        # 2. AI Analysis
        has_severe = sym1[1] == "severe" or (sym2 and sym2[1] == "severe")
        confidence = random.randint(60, 99) if has_severe else random.randint(40, 80)
        
        symptoms_list = [{"name": sym1[0], "severity": sym1[1]}]
        if sym2:
            symptoms_list.append({"name": sym2[0], "severity": sym2[1]})
            
        s.client.table("ai_analysis").insert({
            "report_id": report_id,
            "drugs": [{"name": selected_drug}],
            "symptoms": symptoms_list,
            "timeline": [{"event_type": "Medication", "description": f"Took {selected_drug}"}, {"event_type": "Symptom", "description": f"Developed {sym1[0]}"}],
            "summary": f"Patient reported {sym1[0]} after taking {selected_drug}.",
            "confidence": confidence,
            "created_at": created_at
        }).execute()
        
        # 3. Stress Analysis
        stress_score = random.randint(70, 95) if has_severe else random.randint(20, 60)
        stress_level = "HIGH" if stress_score > 75 else ("MODERATE" if stress_score > 40 else "LOW")
        
        s.client.table("stress_analysis").insert({
            "report_id": report_id,
            "stress_score": stress_score,
            "stress_level": stress_level,
            "pitch_mean": round(random.uniform(150, 250), 2),
            "pitch_variance": round(random.uniform(500, 2000), 2),
            "speech_rate": round(random.uniform(3.5, 5.5), 2),
            "rms_energy": round(random.uniform(0.01, 0.08), 4),
            "created_at": created_at
        }).execute()
        
        # 4. Explanations
        severity = "HIGH" if has_severe else "MODERATE"
        if has_severe and stress_level == "HIGH":
            severity = "CRITICAL"
            
        s.client.table("report_explanations").insert({
            "report_id": report_id,
            "severity_reason": f"Severity assessed as {severity} due to symptoms.",
            "confidence_reason": f"Confidence is {confidence}% based on temporal timeline.",
            "timeline_reason": "Symptoms started shortly after medication.",
            "evidence": [{"title": "Symptom Link", "explanation": f"Known link between {selected_drug} and {sym1[0]}", "confidence": confidence, "source_type": "Clinical Rules"}],
            "created_at": created_at
        }).execute()
        
        # 5. Alerts
        if severity in ["HIGH", "CRITICAL"] or stress_level == "HIGH":
            alert_id = f"ALT-{str(uuid.uuid4())[:8].upper()}"
            s.client.table("alerts").insert({
                "id": alert_id,
                "report_id": report_id,
                "severity": severity,
                "alert_type": "CRITICAL_ADR" if severity == "CRITICAL" else "HIGH_RISK",
                "status": "PENDING",
                "created_at": created_at
            }).execute()

    print("Demo data generated successfully.")

if __name__ == "__main__":
    generate_demo_data()
