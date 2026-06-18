"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

import { useAuth } from "@clerk/nextjs";

export default function DoctorAlerts() {
  const [alerts, setAlerts] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = await getToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/doctor/alerts`, { headers });
        if (res.ok) {
          setAlerts(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
  }, [getToken]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 text-red-600">
        <AlertTriangle className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Priority Inbox</h1>
      </div>
      
      <p className="text-muted-foreground">High-risk and critical ADR cases requiring immediate review.</p>
      
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-500">No active alerts.</div>
        ) : alerts.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-800">{a.alert_type.replace('_', ' ')}</span>
                <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">{a.severity}</span>
              </div>
              <p className="text-sm text-red-700/80 font-mono">Report: {a.report_id}</p>
              <p className="text-xs text-red-700/60 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" /> {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
            <Link 
              href={`/doctor/reports/${a.report_id}`}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Review Case
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
