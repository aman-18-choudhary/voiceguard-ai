from services.export.report_generator import PDFReportGenerator

def test_pdf_generation():
    generator = PDFReportGenerator()
    
    mock_data = {
        "report": {"id": "REP-123", "transcript": "Patient took aspirin and had a rash."},
        "analysis": {
            "summary": "Mild allergic reaction.",
            "severity": {"final_severity": "LOW"},
            "confidence": 85,
            "drugs": [{"name": "Aspirin"}],
            "symptoms": [{"name": "Rash"}]
        },
        "stress_analysis": {
            "stress_level": "LOW"
        }
    }
    
    pdf_buffer = generator.generate_pdf(mock_data)
    
    assert pdf_buffer is not None
    pdf_buffer.seek(0)
    header = pdf_buffer.read(4)
    assert header == b'%PDF' # Verify it starts with standard PDF magic number
