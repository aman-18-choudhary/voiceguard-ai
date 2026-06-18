from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from schemas.ai_schemas import AnalysisState, TimelineEvent
from pydantic import BaseModel, Field
from typing import List
from core.config import settings

class TimelineOutput(BaseModel):
    events: List[TimelineEvent] = Field(description="Chronological list of causal events")

def timeline_node(state: AnalysisState) -> AnalysisState:
    llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)
    structured_llm = llm.with_structured_output(TimelineOutput)
    
    drugs_str = ", ".join([d.name for d in state.drugs]) if state.drugs else "None extracted"
    symptoms_str = ", ".join([s.name for s in state.symptoms]) if state.symptoms else "None extracted"
    
    prompt = PromptTemplate.from_template(
        "You are an expert clinical AI assistant. Construct a chronological causal timeline of events based on the transcript.\n\n"
        "Transcript: {transcript}\n"
        "Extracted Drugs: {drugs}\n"
        "Extracted Symptoms: {symptoms}\n\n"
        "Create a timeline linking medication intake to symptom onset. If the timeline is unclear, do your best."
    )
    
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({
            "transcript": state.transcript,
            "drugs": drugs_str,
            "symptoms": symptoms_str
        })
        state.timeline = result.events
    except Exception as e:
        state.errors.append(f"Timeline Error: {str(e)}")
        
    return state
