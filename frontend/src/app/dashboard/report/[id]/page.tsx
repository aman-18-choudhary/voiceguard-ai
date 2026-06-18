"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share, AlertTriangle, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function ReportResultsPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const isDoctor = user?.publicMetadata?.role === "DOCTOR";
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchAnalysis = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/analysis/${params.id}`);
        
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
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalysis();
    interval = setInterval(fetchAnalysis, 2000);

    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200">Analyzing ADR...</h2>
        <p className="text-muted-foreground text-sm">Our AI is extracting symptoms and building a causal timeline.</p>
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

  const { report, analysis } = data;
  const confidence = analysis.confidence || 0;
  
  // Basic severity mapping based on confidence for MVP
  const severityLabel = confidence >= 80 ? "High" : confidence >= 50 ? "Moderate" : "Low";
  const severityColor = confidence >= 80 ? "bg-red-100 text-red-800 border-red-200" : 
                        confidence >= 50 ? "bg-amber-100 text-amber-800 border-amber-200" : 
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
          Dashboard / Reports / <span className="text-slate-900 dark:text-white font-medium">{params.id}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Report #{params.id}</h1>
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

            <Card>
              <CardHeader>
                <CardTitle>{isDoctor ? "OpenSMILE Feature Analysis" : "Stress Analysis"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-sm text-muted-foreground border border-dashed">
                  Feature pending Phase 5 implementation
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t mt-8">
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share with Doctor
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </main>
    </div>
  );
}
