from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from schemas.ai_schemas import AnalysisState, DrugExtraction, SymptomExtraction
from pydantic import BaseModel, Field
from typing import List
from core.config import settings

class ExtractionOutput(BaseModel):
    drugs: List[DrugExtraction] = Field(description="List of extracted drugs")
    symptoms: List[SymptomExtraction] = Field(description="List of extracted symptoms")

def extractor_node(state: AnalysisState) -> AnalysisState:
    llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)
    structured_llm = llm.with_structured_output(ExtractionOutput)
    
    prompt = PromptTemplate.from_template(
        "You are an expert clinical AI assistant. Extract the drugs and symptoms mentioned in the patient's transcript.\n\n"
        "Transcript: {transcript}\n\n"
        "Extract the drugs and symptoms. If none are mentioned, return empty lists."
    )
    
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({"transcript": state.transcript})
        state.drugs = result.drugs
        state.symptoms = result.symptoms
    except Exception as e:
        state.errors.append(f"Extractor Error: {str(e)}")
        
    return state
