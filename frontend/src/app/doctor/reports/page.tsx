"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@clerk/nextjs";

export default function DoctorReportsList() {
  const [reports, setReports] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await getToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/doctor/reports`, { headers });
        if (res.ok) setReports(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchReports();
  }, [getToken]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">All Patient Reports</h1>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Report ID</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Drug</th>
              <th className="px-6 py-3">Symptom</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Stress Level</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-xs">{r.id}</td>
                <td className="px-6 py-4">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">{r.primary_drug}</td>
                <td className="px-6 py-4">{r.primary_symptom}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={r.severity === 'CRITICAL' ? 'bg-red-50 text-red-700' : ''}>
                    {r.severity}
                  </Badge>
                </td>
                <td className="px-6 py-4">{r.stress_level}</td>
                <td className="px-6 py-4">
                  <Link href={`/doctor/reports/${r.id}`} className="text-teal-600 hover:underline font-medium">Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
