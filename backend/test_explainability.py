import pytest
from schemas.ai_schemas import AnalysisState, DrugExtraction, SymptomExtraction, TimelineEvent, SeverityAssessment, StressMetrics, EvidenceItem, ExplainabilityResponse
from services.ai.evidence_agent import evidence_node
from services.ai.explainability_agent import explainability_node

def test_evidence_agent():
    state = AnalysisState(
        report_id="TEST-123",
        transcript="I took Paracetamol and got a rash.",
        drugs=[DrugExtraction(name="Paracetamol")],
        symptoms=[SymptomExtraction(name="rash")],
        timeline=[TimelineEvent(event_type="Symptom Onset", time_reference="unknown", description="Patient got a rash")],
        stress_metrics=StressMetrics(stress_score=50, stress_level="MODERATE"),
        severity=SeverityAssessment(final_severity="MODERATE", fusion_logic="")
    )
    
    res = evidence_node(state)
    assert "evidence" in res
    assert len(res["evidence"]) > 0
    assert isinstance(res["evidence"][0], EvidenceItem)

def test_explainability_agent():
    state = AnalysisState(
        report_id="TEST-123",
        transcript="I took Paracetamol and got a rash.",
        drugs=[DrugExtraction(name="Paracetamol")],
        symptoms=[SymptomExtraction(name="rash")],
        timeline=[TimelineEvent(event_type="Symptom Onset", time_reference="unknown", description="Patient got a rash")],
        stress_metrics=StressMetrics(stress_score=50, stress_level="MODERATE"),
        severity=SeverityAssessment(final_severity="MODERATE", fusion_logic=""),
        confidence=85,
        evidence=[EvidenceItem(title="Rash associated with Paracetamol", explanation="Test", confidence=90, source_type="Symptom-Drug Link")]
    )
    
    res = explainability_node(state)
    assert "explainability" in res
    explainability = res["explainability"]
    assert isinstance(explainability, ExplainabilityResponse)
    assert len(explainability.severity_reason) > 0
    assert len(explainability.confidence_reason) > 0
    assert len(explainability.timeline_reason) > 0
