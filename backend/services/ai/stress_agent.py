from schemas.ai_schemas import AnalysisState
from services.stress.stress_pipeline import stress_pipeline

def stress_node(state: AnalysisState) -> AnalysisState:
    """LangGraph node to extract stress biomarkers from audio"""
    
    try:
        if state.audio_path:
            metrics = stress_pipeline.analyze_audio(state.audio_path)
            state.stress_metrics = metrics
        else:
            state.errors.append("Stress Agent Error: No audio path provided")
    except Exception as e:
        state.errors.append(f"Stress Agent Error: {str(e)}")
        
    return state
