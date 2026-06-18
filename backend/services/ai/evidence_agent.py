from schemas.ai_schemas import AnalysisState, EvidenceResponse
from core.config import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

def evidence_node(state: AnalysisState) -> dict:
    """Agent that analyzes extracted data to generate clinical evidence cards."""
    
    # If no symptoms or drugs, we might not have much evidence. We'll still run it.
    if not state.drugs and not state.symptoms:
        print("Evidence Agent: No drugs or symptoms extracted. Skipping.")
        return {"evidence": []}

    llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)
    
    parser = PydanticOutputParser(pydantic_object=EvidenceResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Clinical Pharmacovigilance Evidence generator. "
                   "Based on the transcript, extracted drugs, extracted symptoms, timeline, stress metrics, and severity, "
                   "generate structured clinical evidence cards that support the adverse drug reaction assessment.\n"
                   "Each evidence item must have a title, an explanation, a confidence score (0-100), and a source_type "
                   "(e.g. 'Timeline', 'Symptom-Drug Link', 'Stress Biomarker', 'Transcript Detail').\n"
                   "Only output valid JSON matching the schema.\n{format_instructions}"),
        ("human", "Transcript: {transcript}\n\n"
                  "Drugs: {drugs}\n"
                  "Symptoms: {symptoms}\n"
                  "Timeline: {timeline}\n"
                  "Stress Level: {stress_level}\n"
                  "Severity: {severity}\n\n"
                  "Generate the evidence cards.")
    ])
    
    drugs_str = ", ".join([d.name for d in state.drugs]) if state.drugs else "None"
    symptoms_str = ", ".join([s.name for s in state.symptoms]) if state.symptoms else "None"
    timeline_str = "\n".join([f"- {t.time_reference}: {t.description}" for t in state.timeline]) if state.timeline else "None"
    stress_level = state.stress_metrics.stress_level if state.stress_metrics else "Unknown"
    severity = state.severity.final_severity if state.severity else "Unknown"
    
    chain = prompt | llm | parser
    
    try:
        response: EvidenceResponse = chain.invoke({
            "format_instructions": parser.get_format_instructions(),
            "transcript": state.transcript,
            "drugs": drugs_str,
            "symptoms": symptoms_str,
            "timeline": timeline_str,
            "stress_level": stress_level,
            "severity": severity
        })
        return {"evidence": response.evidence}
    except Exception as e:
        print(f"Evidence Agent Error: {e}")
        state.errors.append(f"Evidence Agent: {str(e)}")
        return {"evidence": []}
