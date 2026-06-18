from langgraph.graph import StateGraph, END
from schemas.ai_schemas import AnalysisState
from services.ai.extractor_agent import extractor_node
from services.ai.timeline_agent import timeline_node
from services.ai.summary_agent import summary_node
from services.ai.confidence_agent import confidence_node

def build_adr_pipeline() -> StateGraph:
    """Builds and returns the LangGraph for ADR analysis"""
    
    workflow = StateGraph(AnalysisState)
    
    # Add nodes
    workflow.add_node("extractor", extractor_node)
    workflow.add_node("timeline", timeline_node)
    workflow.add_node("summary", summary_node)
    workflow.add_node("confidence", confidence_node)
    
    # Add edges
    workflow.set_entry_point("extractor")
    workflow.add_edge("extractor", "timeline")
    workflow.add_edge("timeline", "summary")
    workflow.add_edge("summary", "confidence")
    workflow.add_edge("confidence", END)
    
    # Compile graph
    return workflow.compile()

class LangGraphService:
    def __init__(self):
        self.pipeline = build_adr_pipeline()
        
    def analyze_report(self, report_id: str, transcript: str) -> AnalysisState:
        """Run the full LangGraph pipeline for a given transcript"""
        
        initial_state = AnalysisState(
            report_id=report_id,
            transcript=transcript
        )
        
        # Invoke the pipeline
        result = self.pipeline.invoke(initial_state)
        
        # The result is a dict representing the final AnalysisState
        return AnalysisState(**result)

langgraph_service = LangGraphService()
