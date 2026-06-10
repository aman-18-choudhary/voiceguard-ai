import { UserButton, currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceRecorder from "@/components/VoiceRecorder";

export default async function PatientDashboard() {
  const user = await currentUser();

  // Mock data for recent reports
  const recentReports = [
    { id: "VG-9021", date: "Oct 24, 2023", status: "Completed", severity: "Moderate" },
    { id: "VG-8812", date: "Sep 12, 2023", status: "Processing", severity: "Pending" },
  ];

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
        <UserButton afterSignOutUrl="/" />
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
            {recentReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Report #{report.id}</CardTitle>
                    {report.status === "Completed" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {report.status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="animate-pulse">
                        {report.status}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{report.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-muted-foreground">Severity:</span>
                    <span className={`font-medium ${report.severity === "Moderate" ? "text-amber-600" : "text-slate-600"}`}>
                      {report.severity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
