from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, PlainTextResponse
from services.supabase_service import supabase_service
from services.export.report_generator import PDFReportGenerator
from dependencies.auth import get_current_user
import csv
from io import StringIO

router = APIRouter(prefix="/api/v1/export", tags=["export"])
pdf_generator = PDFReportGenerator()

@router.get("/report/{report_id}/pdf")
async def export_pdf(report_id: str, user: dict = Depends(get_current_user)):
    report = supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    analysis = supabase_service.get_analysis(report_id)
    stress = supabase_service.get_stress_analysis(report_id)
    
    data = {
        "report": report,
        "analysis": analysis or {},
        "stress_analysis": stress or {}
    }
    
    pdf_buffer = pdf_generator.generate_pdf(data)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=VoiceGuard_Report_{report_id}.pdf"}
    )

@router.get("/reports/csv")
async def export_reports_csv(user: dict = Depends(get_current_user)):
    if not supabase_service.client: return PlainTextResponse("DB not connected", status_code=500)
    
    res = supabase_service.client.table("reports").select("*").execute()
    reports = res.data or []
    
    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(["Report ID", "Status", "Date", "Severity", "Stress Level"])
    
    for r in reports:
        analysis = supabase_service.get_analysis(r["id"]) or {}
        stress = supabase_service.get_stress_analysis(r["id"]) or {}
        sev_obj = analysis.get("severity", {})
        if isinstance(sev_obj, str):
            sev = sev_obj
        else:
            sev = sev_obj.get("final_severity", "Unknown") if sev_obj else "Unknown"
            
        st_lvl = stress.get("stress_level", "Unknown")
        
        writer.writerow([r["id"], r.get("status", "Unknown"), r.get("created_at", "N/A"), sev, st_lvl])
        
    f.seek(0)
    return StreamingResponse(
        f,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=voiceguard_reports.csv"}
    )
