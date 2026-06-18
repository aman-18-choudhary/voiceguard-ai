"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share, AlertTriangle, Loader2, Info, Search, Activity, FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function ReportResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const reportId = unwrappedParams.id;

  const { user } = useUser();
  const { getToken } = useAuth();
  const isDoctor = user?.publicMetadata?.role === "DOCTOR";
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchAnalysis = async () => {
      try {
        const token = await getToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/analysis/${reportId}`, { headers });
        
        if (res.ok) {
          const result = await res.json();
          
          if (result.report.status === "COMPLETED" && result.analysis) {
            setData(result);
            setLoading(false);
            if (interval) clearInterval(interval);
          } else if (result.report.status === "ANALYSIS_FAILED") {
            setError("AI analysis failed to process this report.");
            setLoading(false);
            if (interval) clearInterval(interval);
          } else if (result.report.status === "TRANSCRIBED") {
            // Self-healing: if stuck in TRANSCRIBED, explicitly trigger the analysis
            fetch(`${apiUrl}/api/v1/analyze/${reportId}`, { method: 'POST', headers }).catch(console.error);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalysis();
    interval = setInterval(fetchAnalysis, 2000);

    return () => clearInterval(interval);
  }, [reportId, getToken]);

  const handleDownloadPDF = async () => {
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/v1/export/report/${reportId}/pdf`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoiceGuard_Report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert("Report link copied to clipboard! You can share this securely with your doctor.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
          
          <div className="flex justify-between items-center">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="flex space-x-3">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>

          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          
          <div className="grid md:grid-cols-3 gap-4">
             <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
             <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
             <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
             <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          </div>
          
          <div className="flex flex-col items-center justify-center pt-8 opacity-50">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Analyzing clinical biomarkers...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Analysis Failed</h2>
          <p className="text-muted-foreground">{error || "Could not load report data."}</p>
        </div>
      </div>
    );
  }

  const { report, analysis, stress_analysis, explanations } = data;
  
  // Use fusion severity if available, fallback to basic confidence
  const confidence = analysis.confidence || 0;
  const fusion_severity = analysis.severity ? analysis.severity.final_severity : null;
  
  const severityLabel = fusion_severity ? 
    (fusion_severity.charAt(0) + fusion_severity.slice(1).toLowerCase()) :
    (confidence >= 80 ? "High" : confidence >= 50 ? "Moderate" : "Low");
    
  const severityColor = (severityLabel === "Critical" || severityLabel === "High") ? "bg-red-100 text-red-800 border-red-200" : 
                        (severityLabel === "Moderate") ? "bg-amber-100 text-amber-800 border-amber-200" : 
                        "bg-green-100 text-green-800 border-green-200";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {confidence >= 80 && (
        <div className="w-full bg-red-500/10 border-b border-red-500/20 text-red-800 dark:text-red-200 px-6 py-3 flex items-center justify-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">High Risk ADR Detected. Recommend Clinical Review.</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          Dashboard / Reports / <span className="text-slate-900 dark:text-white font-medium">{reportId}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Report #{reportId}</h1>
          <div className="flex items-center space-x-3">
            <Badge className={`${severityColor} text-base px-3 py-1`}>
              Severity: {severityLabel}
            </Badge>
            <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-base px-3 py-1 flex flex-col items-start leading-tight">
              <span>ADR Confidence: {confidence}%</span>
              <span className="text-xs font-normal opacity-80">AI Assessment</span>
            </Badge>
          </div>
        </div>

        <Card className="border-teal-100 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-teal-700 dark:text-teal-400">
              <span className="mr-2">✨</span> AI Clinical Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {analysis.summary || "No summary generated."}
            </p>
          </CardContent>
        </Card>

        {explanations && explanations.evidence && explanations.evidence.length > 0 && (
          <Card className="border-indigo-100 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-indigo-700 dark:text-indigo-400">
                <Search className="w-5 h-5 mr-2" /> Evidence Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {explanations.evidence.map((ev: any, idx: number) => (
                  <div key={idx} className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-md border border-indigo-100 dark:border-indigo-900 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-white dark:bg-slate-800 text-xs text-indigo-700 border-indigo-200">
                          {ev.source_type}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-500">{ev.confidence}%</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{ev.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ev.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {explanations && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-slate-800 dark:text-slate-200">
                <Info className="w-5 h-5 mr-2" /> AI Explainability Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300"><Activity className="w-4 h-4 mr-2 text-red-500" /> Severity Reason</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border h-full">{explanations.severity_reason}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300"><CheckCircle2 className="w-4 h-4 mr-2 text-teal-500" /> Confidence Reason</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border h-full">{explanations.confidence_reason}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300"><FileText className="w-4 h-4 mr-2 text-blue-500" /> Timeline Reason</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border h-full">{explanations.timeline_reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transcription</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border">
                "{report.transcript}"
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extracted Entities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Drugs</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.drugs && analysis.drugs.length > 0 ? (
                      analysis.drugs.map((drug: any, i: number) => (
                        <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {drug.name} {drug.timing ? `(${drug.timing})` : ""}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">None extracted</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.symptoms && analysis.symptoms.length > 0 ? (
                      analysis.symptoms.map((sym: any, i: number) => (
                        <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {sym.name} {sym.timing ? `(${sym.timing})` : ""}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">None extracted</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Causal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2">
                  {analysis.timeline && analysis.timeline.length > 0 ? (
                    analysis.timeline.map((event: any, i: number) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-950 ${event.event_type.toLowerCase().includes('symptom') ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <p className="text-sm font-semibold">{event.time_reference}</p>
                        <p className={`text-sm ${event.event_type.toLowerCase().includes('symptom') ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {event.event_type}: {event.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No timeline events extracted.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {stress_analysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Stress Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md border">
                      <span className="font-medium">Stress Score</span>
                      <span className="text-xl font-bold">{stress_analysis.stress_score}/100</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md border">
                      <span className="font-medium">Stress Level</span>
                      <Badge variant="outline">{stress_analysis.stress_level}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                        <p className="text-muted-foreground">Pitch Mean</p>
                        <p className="font-mono">{stress_analysis.pitch_mean.toFixed(1)} Hz</p>
                      </div>
                      <div className="text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                        <p className="text-muted-foreground">Pitch Var</p>
                        <p className="font-mono">{stress_analysis.pitch_variance.toFixed(1)}</p>
                      </div>
                      <div className="text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                        <p className="text-muted-foreground">Speech Rate</p>
                        <p className="font-mono">{stress_analysis.speech_rate.toFixed(1)}</p>
                      </div>
                      <div className="text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                        <p className="text-muted-foreground">Energy</p>
                        <p className="font-mono">{stress_analysis.rms_energy.toFixed(3)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Explainable AI (SHAP)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stress_analysis.shap_explanation && stress_analysis.shap_explanation.length > 0 ? (
                      stress_analysis.shap_explanation.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{item.feature.replace('_', ' ')}</span>
                            <span className={item.impact >= 0 ? "text-red-500" : "text-green-500"}>
                              {item.impact >= 0 ? "+" : ""}{item.impact.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.impact >= 0 ? "bg-red-400" : "bg-green-400"}`}
                              style={{ width: `${Math.min(Math.abs(item.impact) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No SHAP data available.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t mt-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share with Doctor
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
