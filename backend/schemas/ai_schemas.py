from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DrugExtraction(BaseModel):
    name: str = Field(description="The name of the drug or medication")
    timing: Optional[str] = Field(default=None, description="When the drug was taken, if mentioned")

class SymptomExtraction(BaseModel):
    name: str = Field(description="The name of the symptom or adverse reaction")
    timing: Optional[str] = Field(default=None, description="When the symptom started, if mentioned")
    severity: Optional[str] = Field(default=None, description="Severity of the symptom, if mentioned")
    location: Optional[str] = Field(default=None, description="Body location of the symptom, if mentioned")

class TimelineEvent(BaseModel):
    event_type: str = Field(description="Type of event (e.g., 'Medication Intake', 'Symptom Onset')")
    time_reference: str = Field(description="The time or day the event occurred")
    description: str = Field(description="Brief description of the event")

class ShapFeature(BaseModel):
    feature: str = Field(description="Name of the feature (e.g. pitch_variance)")
    impact: float = Field(description="SHAP impact value")

class StressMetrics(BaseModel):
    stress_score: int = Field(default=0, description="0-100 stress score")
    stress_level: str = Field(default="LOW", description="LOW, MODERATE, or HIGH")
    pitch_mean: float = Field(default=0.0)
    pitch_variance: float = Field(default=0.0)
    speech_rate: float = Field(default=0.0)
    rms_energy: float = Field(default=0.0)
    shap_explanation: List[ShapFeature] = []

class SeverityAssessment(BaseModel):
    final_severity: str = Field(default="LOW", description="LOW, MODERATE, HIGH, CRITICAL")
    fusion_logic: str = Field(default="", description="Explanation of the fusion score")

class EvidenceItem(BaseModel):
    title: str = Field(description="Title of the evidence card")
    explanation: str = Field(description="Detailed explanation of the evidence")
    confidence: int = Field(description="Confidence percentage (0-100)")
    source_type: str = Field(description="Type of source (e.g. 'Timeline', 'Symptom-Drug Link', 'Stress Biomarker')")

class EvidenceResponse(BaseModel):
    evidence: List[EvidenceItem] = Field(description="List of clinical evidence items")

class ExplainabilityResponse(BaseModel):
    severity_reason: str = Field(description="Detailed explanation of why the severity score was assigned")
    confidence_reason: str = Field(description="Explanation of the overall confidence score")
    timeline_reason: str = Field(description="Explanation of how the timeline impacts the causality assessment")

class AnalysisState(BaseModel):
    """State for the LangGraph pipeline"""
    report_id: str
    transcript: str
    audio_path: Optional[str] = None
    drugs: List[DrugExtraction] = []
    symptoms: List[SymptomExtraction] = []
    timeline: List[TimelineEvent] = []
    summary: str = ""
    confidence: int = 0
    stress_metrics: Optional[StressMetrics] = None
    severity: Optional[SeverityAssessment] = None
    evidence: List[EvidenceItem] = []
    explainability: Optional[ExplainabilityResponse] = None
    errors: List[str] = []

class AnalysisResponse(BaseModel):
    """Response returned to the frontend"""
    report_id: str
    transcript: str
    drugs: List[Dict[str, Any]]
    symptoms: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]
    summary: str
    confidence: int
    stress_metrics: Optional[Dict[str, Any]] = None
    severity: Optional[Dict[str, Any]] = None
    evidence: List[Dict[str, Any]] = []
    explainability: Optional[Dict[str, Any]] = None
