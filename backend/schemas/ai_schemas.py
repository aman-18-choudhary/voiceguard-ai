from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DrugExtraction(BaseModel):
    name: str = Field(description="The name of the drug or medication")
    timing: Optional[str] = Field(default=None, description="When the drug was taken, if mentioned")

class SymptomExtraction(BaseModel):
    name: str = Field(description="The name of the symptom or adverse reaction")
    timing: Optional[str] = Field(default=None, description="When the symptom started, if mentioned")
    severity: Optional[str] = Field(default=None, description="Severity of the symptom, if mentioned")

class TimelineEvent(BaseModel):
    event_type: str = Field(description="Type of event (e.g., 'Medication Intake', 'Symptom Onset')")
    time_reference: str = Field(description="The time or day the event occurred")
    description: str = Field(description="Brief description of the event")

class AnalysisState(BaseModel):
    """State for the LangGraph pipeline"""
    report_id: str
    transcript: str
    drugs: List[DrugExtraction] = []
    symptoms: List[SymptomExtraction] = []
    timeline: List[TimelineEvent] = []
    summary: str = ""
    confidence: int = 0
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
