"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Users, Database } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function DoctorDashboard() {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = { "Authorization": `Bearer ${token}` };
        
        const [reportsRes, alertsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/doctor/reports`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/doctor/alerts`, { headers })
        ]);
        
        if (reportsRes.ok && alertsRes.ok) {
          setReports(await reportsRes.json());
          setAlerts(await alertsRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getToken]);

  const criticalCount = alerts.filter((a: any) => a.severity === "CRITICAL").length;
  const highSevReports = reports.filter((r: any) => ["HIGH", "CRITICAL"].includes(r.severity)).length;
  
  // Calculate average stress
  const stressValues = reports.map((r: any) => r.stress_level === "HIGH" ? 3 : r.stress_level === "MODERATE" ? 2 : r.stress_level === "LOW" ? 1 : 0).filter(v => v > 0) as number[];
  const avgStressStr = stressValues.length ? (stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1) : "N/A";

  // Calculate most reported drug
  const drugs = reports.map((r: any) => r.primary_drug).filter((d: any) => d && d !== "None");
  const mostReportedDrug = drugs.length ? drugs.sort((a,b) =>
        drugs.filter(v => v===a).length - drugs.filter(v => v===b).length
  ).pop() : "None";

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-slate-500">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Database className="w-4 h-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{reports.length}</div></CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-slate-500">
            <CardTitle className="text-sm font-medium">High Severity Cases</CardTitle>
            <Activity className="w-4 h-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{highSevReports}</div></CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-red-600">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{criticalCount}</div></CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-slate-500">
            <CardTitle className="text-sm font-medium">Monitored Patients</CardTitle>
            <Users className="w-4 h-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{new Set(reports.map((r: any) => r.user_id)).size}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-6 border-t">
        <Link href="/doctor/alerts" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">View Priority Inbox</Link>
        <Link href="/doctor/reports" className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800">Browse All Reports</Link>
        <Link href="/research" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Population Analytics</Link>
      </div>
    </div>
  );
}
