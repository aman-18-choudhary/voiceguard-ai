"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Edit3, Send, RotateCcw } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function ReviewTranscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const reportId = unwrappedParams.id;
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reportData, setReportData] = useState<any>(null);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = await getToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/reports/${reportId}`, { headers });
        
        if (res.ok) {
          const data = await res.json();
          if (data.status === "TRANSCRIBED") {
            setReportData(data.report);
            setTranscript(data.transcript || "");
            setLoading(false);
          } else if (data.status === "ANALYZING" || data.status === "COMPLETED") {
            // Already submitted, redirect to results
            router.push(`/dashboard/report/${reportId}`);
          } else {
            // Might still be transcribing
            setTimeout(fetchReport, 2000);
          }
        } else {
          setError("Failed to fetch report");
          setLoading(false);
        }
      } catch (err) {
        setError("Error connecting to server");
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, router, getToken]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/v1/reports/${reportId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ corrected_transcript: transcript }),
      });

      if (res.ok) {
        router.push(`/dashboard/report/${reportId}`);
      } else {
        throw new Error("Failed to submit");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit transcript for analysis");
      setSubmitting(false);
    }
  };

  const handleRerecord = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <h2 className="text-xl font-medium">Loading Transcript...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          Dashboard / Review / <span className="text-slate-900 dark:text-white font-medium">{reportId}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Edit3 className="mr-3 w-8 h-8 text-teal-600" /> Review Transcript
          </h1>
        </div>

        <Card className="border-teal-100 shadow-sm">
          <CardHeader>
            <CardTitle>AI Transcription Generated</CardTitle>
            <CardDescription>
              Please review the transcript below. If the AI misunderstood any medication names or symptoms (e.g. spelling errors), you can edit the text directly before submitting it to the clinical analysis engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {reportData?.audio_url && (
              <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md flex items-center justify-center">
                <audio src={reportData.audio_url} controls className="w-full max-w-md" />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Transcription Output
              </label>
              <Textarea
                className="min-h-[150px] text-base p-4"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="No speech detected..."
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handleRerecord} disabled={submitting}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Discard & Re-record
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || transcript.trim().length === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Analyze Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
