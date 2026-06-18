from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from schemas.ai_schemas import AnalysisState
from core.config import settings

def summary_node(state: AnalysisState) -> AnalysisState:
    llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)
    
    drugs_str = ", ".join([d.name for d in state.drugs]) if state.drugs else "None extracted"
    symptoms_str = ", ".join([s.name for s in state.symptoms]) if state.symptoms else "None extracted"
    timeline_str = "\n".join([f"- {t.time_reference}: {t.description}" for t in state.timeline]) if state.timeline else "No timeline available"
    
    prompt = PromptTemplate.from_template(
        "You are an expert clinical AI assistant.\n"
        "Generate a brief, professional clinical summary (3-4 sentences max) of the patient's adverse drug reaction report.\n\n"
        "Transcript: {transcript}\n"
        "Extracted Drugs: {drugs}\n"
        "Extracted Symptoms: {symptoms}\n"
        "Timeline:\n{timeline}\n\n"
        "Summary:"
    )
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        result = chain.invoke({
            "transcript": state.transcript,
            "drugs": drugs_str,
            "symptoms": symptoms_str,
            "timeline": timeline_str
        })
        state.summary = result.strip()
    except Exception as e:
        state.errors.append(f"Summary Error: {str(e)}")
        
    return state
