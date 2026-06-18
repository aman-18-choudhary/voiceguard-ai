"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mic, Activity, FileText, Database, Layers, ShieldCheck, Stethoscope } from "lucide-react";
import Hero3D from "@/components/landing/Hero3D";
import { UserButton, useAuth } from "@clerk/nextjs";

const MotionLink = motion.create(Link);

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
      
      {/* NAVBAR */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mic className="w-6 h-6 text-teal-600" />
          <span className="text-xl font-bold tracking-tight">VoiceGuard AI</span>
        </div>
        <div className="flex items-center space-x-4">
          {!isSignedIn ? (
            <>
              <Link href="/sign-in" className="text-sm font-medium hover:text-teal-600 transition-colors">Sign In</Link>
              <Link href="/sign-up" className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">Get Started</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-medium mr-2 hover:text-teal-600 transition-colors">Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </>
          )}
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        <Hero3D />
        
        <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-4xl mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-teal-100/50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-4 py-1.5 rounded-full text-sm font-medium border border-teal-200 dark:border-teal-800 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Now with Stress-Aware Explainable AI</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
          >
            Report Drug Reactions <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400">
              Intelligently
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
          >
            VoiceGuard AI transforms patient voice reports into clinical-grade pharmacovigilance data using LangGraph and Acoustic Biomarkers.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <MotionLink
              href="/dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium text-lg flex items-center shadow-lg shadow-teal-600/20 transition-colors"
            >
              Start Recording <Mic className="ml-2 w-5 h-5" />
            </MotionLink>
            
            <MotionLink
              href="/doctor"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-full font-medium text-lg flex items-center transition-colors"
            >
              Doctor Portal <Stethoscope className="ml-2 w-5 h-5" />
            </MotionLink>
          </motion.div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Traditional ADR Reporting Fails</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Adverse Drug Reactions (ADRs) are significantly underreported because the process is slow, text-heavy, and lacks clinical empathy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Complex Forms", desc: "Patients abandon long, confusing regulatory medical forms.", icon: FileText },
              { title: "Lost Context", desc: "Text inputs fail to capture patient stress, urgency, or timeline nuances.", icon: Activity },
              { title: "Data Silos", desc: "Doctors lack clear, structured insights to make rapid clinical decisions.", icon: Database }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 text-center"
              >
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">The VoiceGuard Pipeline</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                We replace forms with natural speech. VoiceGuard AI listens to the patient, measures acoustic stress biomarkers, extracts structured clinical events, and builds an explainable causality timeline.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Voice-first interface with Whisper transcription",
                  "LangGraph Multi-Agent clinical analysis",
                  "Acoustic Stress Biomarker Fusion",
                  "Explainable Clinical Decision Support"
                ].map((text, i) => (
                  <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                    <div className="w-6 h-6 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mr-3 shrink-0">
                      <CheckIcon className="w-4 h-4" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-4">
                  <FlowCard title="1. Voice Input" desc="Patient records symptom timeline" icon={Mic} />
                  <FlowArrow />
                  <FlowCard title="2. AI Extraction" desc="LangGraph identifies drugs & symptoms" icon={Layers} />
                  <FlowArrow />
                  <FlowCard title="3. Biomarker Fusion" desc="Acoustic stress informs severity score" icon={Activity} />
                  <FlowArrow />
                  <FlowCard title="4. Doctor Review" desc="Explainable evidence dashboard" icon={ShieldCheck} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Platform Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              { title: "Voice Reporting", desc: "Record ADRs naturally using our web audio interface." },
              { title: "Timeline Reconstruction", desc: "AI automatically builds a chronological sequence of events." },
              { title: "Stress Analysis", desc: "Librosa analyzes pitch variance and speech rate for distress." },
              { title: "Explainable AI", desc: "SHAP-based feature importance for algorithmic transparency." },
              { title: "Doctor Dashboard", desc: "Triage high-risk cases with confidence scores and clinical notes." },
              { title: "Research Analytics", desc: "Population-level insights on drug-symptom pairs." }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Mic className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-bold tracking-tight">VoiceGuard AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} VoiceGuard AI. Final Year Project Demo.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Helpers
function CheckIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FlowCard({ title, desc, icon: Icon }: any) {
  return (
    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-md flex items-center justify-center mr-4 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-center -my-2 relative z-10">
      <div className="bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-100 dark:border-slate-700">
        <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
      </div>
    </div>
  );
}
