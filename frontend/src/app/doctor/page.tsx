import { UserButton, currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Filter, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DoctorDashboard() {
  const user = await currentUser();
  
  // Protect Route
  if (user?.publicMetadata?.role !== "DOCTOR") {
    // In a real app, we might redirect to /dashboard or /unauthorized
    // redirect("/dashboard"); 
  }

  // Mock data
  const reports = [
    { id: "VG-9021", date: "Oct 24, 2023", patient: "***-192", drug: "Lisinopril", severity: "Moderate", score: 65, status: "Review Needed" },
    { id: "VG-8812", date: "Sep 12, 2023", patient: "***-044", drug: "Aspirin", severity: "Critical", score: 92, status: "Urgent" },
    { id: "VG-7734", date: "Aug 05, 2023", patient: "***-881", drug: "Metformin", severity: "Low", score: 20, status: "Reviewed" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-2 text-white">
          <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center">
            <span className="font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            VoiceGuard <span className="text-teal-500">MD</span>
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-2.5 bg-slate-800 text-white rounded-md font-medium">
            All Reports
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 hover:bg-slate-800 hover:text-white rounded-md transition-colors">
            High Risk Alerts
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 hover:bg-slate-800 hover:text-white rounded-md transition-colors">
            Analytics & Trends
          </a>
        </nav>
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3">
             <UserButton afterSignOutUrl="/" />
             <span className="text-sm font-medium">Dr. {user?.lastName || "Clinician"}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white dark:bg-slate-900 border-b px-8 py-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Patient Pharmacovigilance Portal
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Reports (30d)</p>
                <p className="text-3xl font-bold mt-2">142</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-red-100 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical Risk Detected</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-500 mt-2">5</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500 opacity-50" />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-3xl font-bold mt-2">18</p>
              </CardContent>
            </Card>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* 4. Doctor Dashboard Missing Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Drug</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="e.g. Aspirin, Lisinopril..." className="pl-9" />
              </div>
            </div>
            
            <div className="w-full md:w-48 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity Filter</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Range</label>
              <Select defaultValue="30d">
                <SelectTrigger>
                  <SelectValue placeholder="Past 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Past 7 Days</SelectItem>
                  <SelectItem value="30d">Past 30 Days</SelectItem>
                  <SelectItem value="90d">Past 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="secondary" className="w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Adverse Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Drug Involved</TableHead>
                    <TableHead>Severity Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.date}</TableCell>
                      <TableCell className="text-muted-foreground">{report.patient}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50">{report.drug}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={
                            report.severity === 'Critical' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                            report.severity === 'Moderate' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                            'bg-green-100 text-green-800 hover:bg-green-100'
                          }
                        >
                          {report.severity} ({report.score})
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${report.status === 'Urgent' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/report/${report.id}`}>
                          <Button variant="outline" size="sm">View Full Report</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
