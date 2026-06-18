from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from schemas.ai_schemas import AnalysisState
from pydantic import BaseModel, Field
from core.config import settings

class ConfidenceOutput(BaseModel):
    score: int = Field(description="Confidence score from 0 to 100 representing the likelihood of an actual ADR")

def confidence_node(state: AnalysisState) -> AnalysisState:
    llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)
    structured_llm = llm.with_structured_output(ConfidenceOutput)
    
    prompt = PromptTemplate.from_template(
        "You are an expert clinical AI assistant.\n"
        "Assess the likelihood that the patient's reported symptoms are genuinely caused by the reported medication (ADR confidence).\n\n"
        "Transcript: {transcript}\n"
        "Summary: {summary}\n\n"
        "Return an integer score from 0 to 100."
    )
    
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({
            "transcript": state.transcript,
            "summary": state.summary
        })
        state.confidence = result.score
    except Exception as e:
        state.errors.append(f"Confidence Error: {str(e)}")
        
    return state
