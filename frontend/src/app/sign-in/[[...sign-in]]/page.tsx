import { SignIn } from "@clerk/nextjs";
import { Mic } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100 dark:bg-teal-900/30 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100 dark:bg-indigo-900/30 blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center space-x-2 mb-8 group">
          <div className="bg-teal-600 p-2 rounded-xl group-hover:bg-teal-700 transition-colors">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">VoiceGuard AI</span>
        </Link>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl",
              headerTitle: "text-2xl font-bold text-slate-900 dark:text-white",
              headerSubtitle: "text-slate-500 dark:text-slate-400",
              socialButtonsBlockButton: "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
              socialButtonsBlockButtonText: "font-medium",
              formFieldLabel: "text-slate-700 dark:text-slate-300 font-medium",
              formFieldInput: "rounded-lg border-slate-300 dark:border-slate-700 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-white",
              formButtonPrimary: "bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium text-base py-2.5",
              footerActionText: "text-slate-600 dark:text-slate-400",
              footerActionLink: "text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium",
            }
          }}
          routing="path" 
          path="/sign-in" 
          signUpUrl="/sign-up" 
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
