from schemas.ai_schemas import AnalysisState, StressMetrics, SymptomExtraction
from services.ai.severity_agent import severity_node

def test_severity_fusion_engine():
    # Setup mock state
    state = AnalysisState(
        report_id="test_1",
        transcript="dummy",
        confidence=80, # 80 * 0.5 = 40
        symptoms=[SymptomExtraction(name="rash")], # 1 symptom = 30 * 0.3 = 9
        stress_metrics=StressMetrics(stress_score=50) # 50 * 0.2 = 10
    )
    
    # Expected final_score: 40 + 9 + 10 = 59 -> MODERATE
    
    result_state = severity_node(state)
    
    assert result_state.severity is not None
    assert result_state.severity.final_severity == "MODERATE"
    assert "Fused Score: 59" in result_state.severity.fusion_logic
