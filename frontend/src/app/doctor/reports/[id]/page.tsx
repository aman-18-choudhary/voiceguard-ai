"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Loader2, Save, Info, CheckCircle2, Activity, FileText } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";

export default function DoctorReportDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const reportId = unwrappedParams.id;

  const { user } = useUser();
  const { getToken } = useAuth();
  const doctorId = user?.id || "unknown";
  
  const [data, setData] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = await getToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/analysis/${reportId}`, { headers });
        const notesRes = await fetch(`${apiUrl}/api/v1/doctor/notes/${reportId}`, { headers });
        
        if (res.ok) {
          setData(await res.json());
          if (notesRes.ok) setNotes(await notesRes.json());
          setLoading(false);
        } else {
          setError("Failed to fetch report");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [reportId, getToken]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const token = await getToken();
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await fetch(`${apiUrl}/api/v1/doctor/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          report_id: reportId,
          doctor_id: doctorId,
          note: newNote
        })
      });
      
      setNotes([...notes, { note: newNote, created_at: new Date().toISOString() }]);
      setNewNote("");
    } catch (e) {
      console.error("Error adding note", e);
    }
  };

  const handleExportPDF = async () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/export/report/${reportId}/pdf`, "_blank");
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (error || !data) return <div className="p-12 text-center text-red-500">{error}</div>;

  const { report, analysis, stress_analysis, explanations } = data;
  const fusion_severity = analysis?.severity?.final_severity || "Unknown";
  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Review Case #{reportId}</h1>
        <Button onClick={handleExportPDF} className="bg-slate-900 text-white"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>AI Clinical Summary</CardTitle></CardHeader>
            <CardContent><p>{analysis?.summary || "No summary"}</p></CardContent>
          </Card>

          {explanations && (
            <Card className="border-slate-200">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="flex items-center text-slate-800">
                  <Info className="w-5 h-5 mr-2" /> Clinical Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <h4 className="flex items-center text-sm font-semibold text-slate-700"><Activity className="w-4 h-4 mr-2 text-red-500" /> Severity</h4>
                    <p className="text-sm text-slate-600">{explanations.severity_reason}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="flex items-center text-sm font-semibold text-slate-700"><CheckCircle2 className="w-4 h-4 mr-2 text-teal-500" /> Confidence</h4>
                    <p className="text-sm text-slate-600">{explanations.confidence_reason}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="flex items-center text-sm font-semibold text-slate-700"><FileText className="w-4 h-4 mr-2 text-blue-500" /> Timeline</h4>
                    <p className="text-sm text-slate-600">{explanations.timeline_reason}</p>
                  </div>
                </div>

                {explanations.evidence && explanations.evidence.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-slate-800 mb-3">Supporting Evidence</h4>
                    <div className="space-y-3">
                      {explanations.evidence.map((ev: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded border">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm text-slate-800">{ev.title}</span>
                            <Badge variant="outline" className="text-xs bg-white">{ev.source_type} ({ev.confidence}%)</Badge>
                          </div>
                          <p className="text-sm text-slate-600">{ev.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader><CardTitle>Doctor Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <div key={i} className="p-3 bg-slate-50 border rounded text-sm">
                    <div className="text-xs text-slate-500 mb-1">{new Date(n.created_at).toLocaleString()}</div>
                    {n.note}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea 
                  className="flex-1 p-2 border rounded text-sm min-h-[80px]"
                  placeholder="Add a clinical note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button onClick={handleAddNote} className="self-end"><Save className="w-4 h-4 mr-2" /> Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>Severity</span><Badge>{fusion_severity}</Badge></div>
              <div className="flex justify-between"><span>Stress Level</span><Badge variant="outline">{stress_analysis?.stress_level || "Unknown"}</Badge></div>
              <div className="flex justify-between"><span>ADR Confidence</span><span>{analysis?.confidence}%</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
