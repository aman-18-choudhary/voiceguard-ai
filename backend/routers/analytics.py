from fastapi import APIRouter, Depends
from services.supabase_service import supabase_service
from collections import Counter
from dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/drugs")
async def get_drug_analytics(user: dict = Depends(get_current_user)):
    if not supabase_service.client: return []
    res = supabase_service.client.table("ai_analysis").select("drugs").execute()
    
    drugs = []
    for row in (res.data or []):
        row_drugs = row.get("drugs", [])
        for d in row_drugs:
            if d and "name" in d:
                drugs.append(d["name"].lower().strip())
                
    counts = Counter(drugs).most_common(10)
    total = sum(c[1] for c in counts) if counts else 1
    
    return [{"name": c[0].capitalize(), "count": c[1], "percentage": round((c[1]/total)*100)} for c in counts]

@router.get("/symptoms")
async def get_symptom_analytics(user: dict = Depends(get_current_user)):
    if not supabase_service.client: return []
    res = supabase_service.client.table("ai_analysis").select("symptoms").execute()
    
    symptoms = []
    for row in (res.data or []):
        row_sym = row.get("symptoms", [])
        for s in row_sym:
            if s and "name" in s:
                symptoms.append(s["name"].lower().strip())
                
    counts = Counter(symptoms).most_common(10)
    return [{"name": c[0].capitalize(), "count": c[1]} for c in counts]

@router.get("/severity")
async def get_severity_analytics(user: dict = Depends(get_current_user)):
    if not supabase_service.client: return []
    res = supabase_service.client.table("ai_analysis").select("confidence").execute()
    
    levels = {"LOW": 0, "MODERATE": 0, "HIGH": 0, "CRITICAL": 0}
    for row in (res.data or []):
        conf = row.get("confidence", 0)
        
        # Calculate derived severity
        if conf >= 90:
            lvl = "CRITICAL"
        elif conf >= 70:
            lvl = "HIGH"
        elif conf >= 40:
            lvl = "MODERATE"
        else:
            lvl = "LOW"
            
        if lvl in levels:
            levels[lvl] += 1
            
    return [{"name": k, "value": v} for k, v in levels.items()]

@router.get("/stress")
async def get_stress_analytics(user: dict = Depends(get_current_user)):
    if not supabase_service.client: return []
    res = supabase_service.client.table("stress_analysis").select("stress_level").execute()
    
    levels = {"LOW": 0, "MODERATE": 0, "HIGH": 0}
    for row in (res.data or []):
        lvl = row.get("stress_level", "LOW")
        if lvl in levels:
            levels[lvl] += 1
            
    return [{"name": k, "value": v} for k, v in levels.items()]

@router.get("/pairs")
async def get_drug_symptom_pairs(user: dict = Depends(get_current_user)):
    if not supabase_service.client: return []
    res = supabase_service.client.table("ai_analysis").select("drugs, symptoms").execute()
    
    pairs = []
    for row in (res.data or []):
        row_drugs = row.get("drugs", [])
        row_sym = row.get("symptoms", [])
        for d in row_drugs:
            if not d or "name" not in d: continue
            d_name = d["name"].lower().strip()
            for s in row_sym:
                if not s or "name" not in s: continue
                s_name = s["name"].lower().strip()
                pairs.append(f"{d_name.capitalize()} → {s_name.capitalize()}")
                
    counts = Counter(pairs).most_common(10)
    return [{"pair": c[0], "count": c[1]} for c in counts]
