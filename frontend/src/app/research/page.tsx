"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, PieChart as PieChartIcon, BarChart2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import { useAuth } from "@clerk/nextjs";

const COLORS = ['#0f766e', '#f59e0b', '#ef4444', '#b91c1c'];

export default function ResearchAnalytics() {
  const [drugs, setDrugs] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [stress, setStress] = useState([]);
  const [pairs, setPairs] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = await getToken();
      const headers = { "Authorization": `Bearer ${token}` };
      
      setDrugs(await (await fetch(`${url}/api/v1/analytics/drugs`, { headers })).json());
      setSeverity(await (await fetch(`${url}/api/v1/analytics/severity`, { headers })).json());
      setStress(await (await fetch(`${url}/api/v1/analytics/stress`, { headers })).json());
      setPairs(await (await fetch(`${url}/api/v1/analytics/pairs`, { headers })).json());
    };
    fetchAnalytics().catch(console.error);
  }, []);

  const handleExportCSV = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/export/reports/csv`, "_blank");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center"><PieChartIcon className="w-8 h-8 mr-2 text-teal-600"/> Pharmacovigilance Analytics</h1>
          <p className="text-muted-foreground mt-2">Aggregated population-level insights.</p>
        </div>
        <Button onClick={handleExportCSV} className="bg-teal-700 text-white">
          <Download className="w-4 h-4 mr-2" /> Export CSV Dataset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart2 className="w-5 h-5 mr-2"/> Top Reported Drugs</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drugs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severity} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {severity.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stress Biomarker Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stress} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart2 className="w-5 h-5 mr-2"/> Top Drug-Symptom Pairs</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="pair" type="category" width={140} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
