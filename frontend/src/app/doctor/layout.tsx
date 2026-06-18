"use client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  // Route Guard
  const role = user?.publicMetadata?.role;
  if (role !== "DOCTOR" && role !== "RESEARCHER") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
