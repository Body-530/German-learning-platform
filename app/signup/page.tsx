"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, BookOpen, ChevronRight } from "lucide-react";

interface AccountOptionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  type: "student" | "teacher";
}

// Component: one option card (Student / Teacher)
const AccountOption = ({ title, description, icon: Icon, type }: AccountOptionProps) => (
  <Link href={`/register/${type}`} passHref>
    <Button
      asChild
      variant="outline"
      className="w-full h-auto p-6 justify-between items-center text-left bg-white dark:bg-zinc-800 
                 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-zinc-700 
                 transition duration-200 border border-gray-300 dark:border-zinc-700 
                 shadow-lg hover:shadow-xl"
    >
      <div className="flex w-full items-center justify-between">
        
        <div className="flex items-center space-x-4">
          <Icon className="w-8 h-8 text-blue-500" />
          <div className="flex flex-col items-start">
            <div className="font-bold text-xl">{title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </div>
          </div>
        </div>

        <ChevronRight className="w-6 h-6" />
      </div>
    </Button>
  </Link>
);

export default function SignupPage() {
 return (

    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans p-6">


      <div className="w-full max-w-2xl p-12 bg-white/90 dark:bg-zinc-900/90 rounded-3xl shadow-2xl 
                      border border-gray-200 dark:border-zinc-700 text-center backdrop-blur-sm">
        
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Let's get started!
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Welcome to Deutsch Lernen! Please select your account type to continue.
        </p>

    
        <div className="grid gap-6 md:grid-cols-1">
          <AccountOption 
            title="Student Learner" 
            description="I want to learn German, track my progress, and use the AI tools." 
            icon={User}
            type="student"
          />

          <AccountOption 
            title="Teacher / Educator" 
            description="I want to manage my students and assign tasks." 
            icon={BookOpen}
            type="teacher"
          />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline transition-colors">
            Go to the login page.
          </Link>
        </div>

      </div>
    </div>
  );
}