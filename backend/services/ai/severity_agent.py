from schemas.ai_schemas import AnalysisState, SeverityAssessment

def severity_node(state: AnalysisState) -> AnalysisState:
    """LangGraph node to fuse ADR confidence, symptoms, and stress into a final severity score"""
    
    try:
        # Extract inputs
        adr_confidence = state.confidence  # 0-100
        stress_score = state.stress_metrics.stress_score if state.stress_metrics else 0
        
        # Calculate symptom severity (heuristic based on number of symptoms)
        # e.g. 1 symptom = 30, 2 = 60, 3+ = 90
        symptom_count = len(state.symptoms)
        symptom_severity = min(symptom_count * 30, 100)
        
        # Fusion Formula
        final_score = (0.5 * adr_confidence) + (0.3 * symptom_severity) + (0.2 * stress_score)
        
        if final_score < 40:
            final_level = "LOW"
        elif final_score < 70:
            final_level = "MODERATE"
        elif final_score < 90:
            final_level = "HIGH"
        else:
            final_level = "CRITICAL"
            
        logic = (f"Fused Score: {final_score:.2f} "
                 f"(Confidence: {adr_confidence} * 0.5 + "
                 f"Symptom Severity: {symptom_severity} * 0.3 + "
                 f"Stress: {stress_score} * 0.2)")
                 
        state.severity = SeverityAssessment(
            final_severity=final_level,
            fusion_logic=logic
        )
        
    except Exception as e:
        state.errors.append(f"Severity Agent Error: {str(e)}")
        
    return state
