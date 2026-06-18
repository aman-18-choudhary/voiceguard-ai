from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO

class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.styles.add(ParagraphStyle(name='CustomTitle', parent=self.styles['Heading1'], fontSize=20, textColor=colors.teal))
        self.styles.add(ParagraphStyle(name='CustomHeading', parent=self.styles['Heading2'], textColor=colors.HexColor("#0f172a")))
        
    def generate_pdf(self, report_data: dict) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        
        elements = []
        
        # Header
        elements.append(Paragraph(f"VoiceGuard AI Clinical Report", self.styles['CustomTitle']))
        elements.append(Paragraph(f"Report ID: {report_data.get('report', {}).get('id', 'Unknown')}", self.styles['Normal']))
        elements.append(Spacer(1, 20))
        
        analysis = report_data.get('analysis', {})
        stress = report_data.get('stress_analysis', {})
        
        import re
        
        # Summary
        elements.append(Paragraph("Clinical Summary", self.styles['CustomHeading']))
        summary_raw = analysis.get('summary', 'No summary available.')
        # Basic markdown bold strip
        summary_clean = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', summary_raw)
        elements.append(Paragraph(summary_clean, self.styles['Normal']))
        elements.append(Spacer(1, 15))
        
        # Severity & Stress
        elements.append(Paragraph("Assessment", self.styles['CustomHeading']))
        
        sev_obj = analysis.get('severity', {})
        if isinstance(sev_obj, str):
            sev_val = sev_obj
        else:
            sev_val = sev_obj.get('final_severity', 'Unknown') if isinstance(sev_obj, dict) else 'Unknown'
            
        sev_data = [
            ["Severity", sev_val],
            ["Stress Level", stress.get('stress_level', 'Unknown')],
            ["ADR Confidence", f"{analysis.get('confidence', 0)}%"]
        ]
        t = Table(sev_data, colWidths=[150, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.lightgrey),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('GRID', (0,0), (-1,-1), 1, colors.grey)
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))
        
        # Transcript
        elements.append(Paragraph("Transcript", self.styles['CustomHeading']))
        elements.append(Paragraph(f'"{report_data.get("report", {}).get("transcript", "")}"', self.styles['Italic']))
        elements.append(Spacer(1, 15))
        
        # Extracted Entities
        elements.append(Paragraph("Extracted Drugs & Symptoms", self.styles['CustomHeading']))
        drugs = ", ".join([d.get("name", "") for d in analysis.get('drugs', [])]) or "None"
        symps = ", ".join([s.get("name", "") for s in analysis.get('symptoms', [])]) or "None"
        
        elements.append(Paragraph(f"<b>Drugs:</b> {drugs}", self.styles['Normal']))
        elements.append(Paragraph(f"<b>Symptoms:</b> {symps}", self.styles['Normal']))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer
