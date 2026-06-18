from schemas.ai_schemas import AnalysisState, ExplainabilityResponse
from core.config import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

def explainability_node(state: AnalysisState) -> dict:
    """Agent that generates clinical explainability text for Severity, Confidence, and Timeline."""
    
    llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=settings.GROQ_API_KEY)
    
    parser = PydanticOutputParser(pydantic_object=ExplainabilityResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an Explainable AI Clinical Reasoning Agent for an Adverse Drug Reaction platform. "
                   "Your job is to explain the reasoning behind the system's severity score, confidence score, and timeline causality.\n"
                   "Write clear, professional, medical-grade explanations.\n"
                   "- severity_reason: Why is this considered {severity} severity? Mention symptoms and stress metrics.\n"
                   "- confidence_reason: Why does the system have {confidence}% confidence in this ADR association?\n"
                   "- timeline_reason: How does the temporal sequence (timeline) support or contradict a causal relationship?\n"
                   "Output ONLY valid JSON matching the schema.\n{format_instructions}"),
        ("human", "Drugs: {drugs}\n"
                  "Symptoms: {symptoms}\n"
                  "Timeline: {timeline}\n"
                  "Stress: {stress_level} (Score: {stress_score})\n"
                  "Severity: {severity}\n"
                  "Confidence: {confidence}\n"
                  "Evidence Cards: {evidence}\n\n"
                  "Generate the explanations.")
    ])
    
    drugs_str = ", ".join([d.name for d in state.drugs]) if state.drugs else "None"
    symptoms_str = ", ".join([s.name for s in state.symptoms]) if state.symptoms else "None"
    timeline_str = "\n".join([f"- {t.time_reference}: {t.description}" for t in state.timeline]) if state.timeline else "None"
    stress_level = state.stress_metrics.stress_level if state.stress_metrics else "Unknown"
    stress_score = state.stress_metrics.stress_score if state.stress_metrics else 0
    severity = state.severity.final_severity if state.severity else "Unknown"
    evidence_str = "\n".join([f"- {e.title}: {e.explanation}" for e in state.evidence]) if state.evidence else "None"
    
    chain = prompt | llm | parser
    
    try:
        response: ExplainabilityResponse = chain.invoke({
            "format_instructions": parser.get_format_instructions(),
            "drugs": drugs_str,
            "symptoms": symptoms_str,
            "timeline": timeline_str,
            "stress_level": stress_level,
            "stress_score": stress_score,
            "severity": severity,
            "confidence": state.confidence,
            "evidence": evidence_str
        })
        return {"explainability": response}
    except Exception as e:
        print(f"Explainability Agent Error: {e}")
        state.errors.append(f"Explainability Agent: {str(e)}")
        # Provide fallback explanations
        fallback = ExplainabilityResponse(
            severity_reason=f"Assessed as {severity} severity based on extracted symptoms and stress metrics.",
            confidence_reason=f"Calculated {state.confidence}% confidence based on transcript clarity and entity extraction.",
            timeline_reason="Timeline sequence was analyzed for causal relationship."
        )
        return {"explainability": fallback}
