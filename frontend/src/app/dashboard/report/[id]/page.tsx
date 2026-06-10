import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share, AlertTriangle } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

export default async function ReportResultsPage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const isDoctor = user?.publicMetadata?.role === "DOCTOR";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* 5. Report Risk Banner */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-200 px-6 py-3 flex items-center justify-center space-x-2">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-semibold">High Risk ADR Detected. Recommend Clinical Review.</span>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-muted-foreground mb-4">
          Dashboard / Reports / <span className="text-slate-900 dark:text-white font-medium">{params.id}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Report #{params.id}</h1>
          <div className="flex items-center space-x-3">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-base px-3 py-1">
              Severity: Moderate (65/100)
            </Badge>
            {/* 1. Confidence Score Card */}
            <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-base px-3 py-1 flex flex-col items-start leading-tight">
              <span>ADR Confidence: 87%</span>
              <span className="text-xs font-normal opacity-80">Likely Drug Related</span>
            </Badge>
          </div>
        </div>

        {/* 2. Clinical Summary Card */}
        <Card className="border-teal-100 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-teal-700 dark:text-teal-400">
              <span className="mr-2">✨</span> AI Clinical Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Patient reported taking <strong className="text-blue-600 dark:text-blue-400">Lisinopril</strong> on Monday. 
              A <strong className="text-red-600 dark:text-red-400">dry cough</strong> developed approximately 48 hours later. 
              Temporal association suggests a likely ADR. Severity assessed as Moderate.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transcription</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border">
                "I took <span className="text-blue-600 font-medium underline decoration-blue-200">Lisinopril</span> on Monday and developed a <span className="text-red-600 font-medium underline decoration-red-200">dry cough</span> by Wednesday."
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extracted Entities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Drugs</h4>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Lisinopril</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Symptoms</h4>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Dry Cough</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Causal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white dark:ring-slate-950" />
                    <p className="text-sm font-semibold">Monday</p>
                    <p className="text-sm text-muted-foreground">Medication Intake: Lisinopril</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full ring-4 ring-white dark:ring-slate-950" />
                    <p className="text-sm font-semibold">Wednesday</p>
                    <p className="text-sm text-red-600">Symptom Onset: Dry Cough</p>
                  </div>
                </div>
                {/* 6. Timeline Confidence */}
                <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Timeline Confidence</span>
                  <span className="font-semibold text-teal-600">91%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isDoctor ? "OpenSMILE Feature Analysis" : "Stress Analysis"}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for Stress Chart */}
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-sm text-muted-foreground border border-dashed">
                  Elevated Pitch Detected (+15% deviation)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isDoctor ? "SHAP Feature Contributions" : "Explainability"}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for SHAP Explainability */}
                 <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                     <span>Symptom: Dry Cough</span>
                     <span className="text-amber-600">+40 Risk</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Acoustic Stress</span>
                     <span className="text-amber-600">+25 Risk</span>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Footer */}
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
