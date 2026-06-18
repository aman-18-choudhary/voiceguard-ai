import { currentUser, auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceRecorder from "@/components/VoiceRecorder";
import Link from "next/link";

export default async function PatientDashboard() {
  const user = await currentUser();
  const { getToken } = await auth();
  const token = await getToken();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  let recentReports = [];
  try {
    const res = await fetch(`${apiUrl}/api/v1/reports/history`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (res.ok) {
      recentReports = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch reports:", e);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            VoiceGuard <span className="text-teal-600">AI</span>
          </span>
        </div>
        <UserButton />
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "Patient"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Report a new adverse drug reaction or view your history.
          </p>
        </div>

        {/* Primary Action: Voice Recorder */}
        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="bg-teal-50/50 dark:bg-teal-950/20 border-b">
            <CardTitle>Report a New Reaction</CardTitle>
            <CardDescription>Use your voice to report side effects in under 30 seconds.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <VoiceRecorder />
          </CardContent>
        </Card>

        {/* Historical Data */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Reports</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recentReports.map((report: any) => (
              <Link href={`/dashboard/report/${report.id}`} key={report.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Report #{report.id.substring(0,8)}</CardTitle>
                      {report.status === "COMPLETED" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="animate-pulse">
                          {report.status}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{new Date(report.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Severity:</span>
                      <span className={`font-medium ${report.severity === "MODERATE" ? "text-amber-600" : report.severity === "HIGH" || report.severity === "CRITICAL" ? "text-red-600" : "text-slate-600"}`}>
                        {report.severity}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
