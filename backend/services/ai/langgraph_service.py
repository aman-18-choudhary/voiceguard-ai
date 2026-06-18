from langgraph.graph import StateGraph, END
from schemas.ai_schemas import AnalysisState
from services.ai.extractor_agent import extractor_node
from services.ai.timeline_agent import timeline_node
from services.ai.summary_agent import summary_node
from services.ai.confidence_agent import confidence_node
from services.ai.stress_agent import stress_node
from services.ai.severity_agent import severity_node
from services.ai.evidence_agent import evidence_node
from services.ai.explainability_agent import explainability_node

def build_adr_pipeline() -> StateGraph:
    """Builds and returns the LangGraph for ADR analysis"""
    
    workflow = StateGraph(AnalysisState)
    
    # Add nodes
    workflow.add_node("extractor", extractor_node)
    workflow.add_node("timeline", timeline_node)
    workflow.add_node("confidence", confidence_node)
    workflow.add_node("stress", stress_node)
    workflow.add_node("severity", severity_node)
    workflow.add_node("evidence", evidence_node)
    workflow.add_node("explainability", explainability_node)
    workflow.add_node("summary", summary_node)
    
    # Add edges
    # Flow: Extractor -> Timeline -> Confidence -> Stress -> Severity -> Evidence -> Explainability -> Summary
    workflow.set_entry_point("extractor")
    workflow.add_edge("extractor", "timeline")
    workflow.add_edge("timeline", "confidence")
    workflow.add_edge("confidence", "stress")
    workflow.add_edge("stress", "severity")
    workflow.add_edge("severity", "evidence")
    workflow.add_edge("evidence", "explainability")
    workflow.add_edge("explainability", "summary")
    workflow.add_edge("summary", END)
    
    # Compile graph
    return workflow.compile()

class LangGraphService:
    def __init__(self):
        self.pipeline = build_adr_pipeline()
        
    def analyze_report(self, report_id: str, transcript: str, audio_path: str = None) -> AnalysisState:
        """Run the full LangGraph pipeline for a given transcript"""
        
        initial_state = AnalysisState(
            report_id=report_id,
            transcript=transcript,
            audio_path=audio_path
        )
        
        # Invoke the pipeline
        result = self.pipeline.invoke(initial_state)
        
        # The result is a dict representing the final AnalysisState
        final_state = AnalysisState(**result)
        
        import json
        print("\n=== AI Pipeline Debug Logs ===")
        print(f"Transcript: {final_state.transcript}")
        print(f"Drugs: {json.dumps([d.model_dump() for d in final_state.drugs], indent=2)}")
        print(f"Symptoms: {json.dumps([s.model_dump() for s in final_state.symptoms], indent=2)}")
        print(f"Timeline: {json.dumps([t.model_dump() for t in final_state.timeline], indent=2)}")
        print("==============================\n")
        
        return final_state

langgraph_service = LangGraphService()
