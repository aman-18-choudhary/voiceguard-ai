"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, UploadCloud, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

type ProcessingStatus = "idle" | "recording" | "review" | "UPLOADING" | "TRANSCRIBING" | "TRANSCRIBED" | "FAILED";

export default function VoiceRecorder() {
  const router = useRouter();
  const { userId } = useAuth();
  
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [time, setTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setStatus("review");
      };

      mediaRecorder.start();
      setTime(0);
      setStatus("recording");
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Microphone access is required to record ADRs.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTime(0);
    setStatus("idle");
    setReportId(null);
  };

  const pollStatus = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        
        if (data.status === "TRANSCRIBING") {
           setStatus("TRANSCRIBING");
        } else if (data.status === "TRANSCRIBED") {
           setStatus("TRANSCRIBED");
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           // Redirect to results
           router.push(`/dashboard/report/${id}`);
        } else if (data.status === "FAILED") {
           setStatus("FAILED");
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      }
    } catch (err) {
      console.error("Polling error", err);
    }
  };

  const submitReport = async () => {
    if (!audioBlob) return;
    setStatus("UPLOADING");
    
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("user_id", userId || "anonymous");

      const response = await fetch("http://localhost:8000/api/v1/reports/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setReportId(data.report_id);

      // Start polling
      pollIntervalRef.current = setInterval(() => pollStatus(data.report_id), 2000);
      
    } catch (error) {
      console.error(error);
      setStatus("FAILED");
    }
  };

  const isProcessing = ["UPLOADING", "TRANSCRIBING"].includes(status);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Record Your Experience</h2>
        <p className="text-muted-foreground text-sm">
          Please clearly state the medication name, when you took it, and the symptoms you are experiencing.
        </p>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 shadow-inner">
        {status === "idle" && (
          <Button
            size="lg"
            className="w-32 h-32 rounded-full shadow-lg hover:scale-105 transition-transform"
            onClick={startRecording}
          >
            <Mic className="w-12 h-12" />
          </Button>
        )}

        {status === "recording" && (
          <div className="flex flex-col items-center animate-pulse">
            <Button
              variant="destructive"
              size="lg"
              className="w-32 h-32 rounded-full shadow-lg hover:scale-105 transition-transform"
              onClick={stopRecording}
            >
              <Square className="w-10 h-10" />
            </Button>
            <div className="absolute -bottom-8 font-mono text-xl font-medium text-red-500">
              {formatTime(time)}
            </div>
          </div>
        )}

        {(status === "review" || isProcessing || status === "TRANSCRIBED" || status === "FAILED") && audioUrl && (
          <div className="flex flex-col items-center w-full px-4">
            <audio src={audioUrl} controls className="w-full max-w-[200px]" />
          </div>
        )}
      </div>

      {status === "review" && (
        <div className="flex space-x-4 pt-4">
          <Button variant="outline" onClick={resetRecording}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Re-record
          </Button>
          <Button onClick={submitReport} className="bg-teal-600 hover:bg-teal-700 text-white">
            <UploadCloud className="w-4 h-4 mr-2" />
            Submit Report
          </Button>
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center space-y-4 pt-4 w-full max-w-sm">
          <p className="text-sm font-medium animate-pulse text-teal-600">
            {status === "UPLOADING" ? "Uploading audio securely..." : "Transcribing your experience..."}
          </p>
          <div className="w-full space-y-2 bg-slate-50 p-4 rounded-md border border-slate-100">
             <div className="flex items-center text-sm font-medium">
               <span className="text-teal-600 mr-2">✓</span> Uploaded
             </div>
             <div className="flex items-center text-sm font-medium">
               <span className={status === "TRANSCRIBING" ? "text-teal-600 mr-2" : "text-slate-400 mr-2"}>
                 {status === "TRANSCRIBING" ? "✓" : "○"}
               </span> 
               Stored
             </div>
             <div className="flex items-center text-sm">
               <span className="text-teal-600 mr-2 animate-spin">⏳</span> Transcribing
             </div>
             <div className="flex items-center text-sm text-slate-400">
               <span className="mr-2">⏳</span> Analysis Pending
             </div>
          </div>
        </div>
      )}

      {status === "FAILED" && (
        <div className="flex flex-col items-center space-y-4 pt-4 w-full max-w-sm text-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="font-semibold">Processing Failed</p>
            <p className="text-sm mt-1">There was an issue uploading or transcribing your audio. Please try again.</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={resetRecording}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={submitReport} className="bg-teal-600 hover:bg-teal-700 text-white">
              <UploadCloud className="w-4 h-4 mr-2" />
              Retry Upload
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
