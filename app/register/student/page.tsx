
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

import { useActionState } from "react";

import { useFormStatus } from "react-dom";
import { Loader2, AlertCircle, GraduationCap } from "lucide-react";
import { studentSignUp } from "./actions";


function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      className="w-full text-lg py-5 bg-blue-600 hover:bg-blue-700 text-white transition-all mt-4" 
      type="submit" 
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creating Account...
        </>
      ) : (
        "Create Student Account"
      )}
    </Button>
  );
}


const initialState = {
  error: "",
};

export default function StudentRegister() {

  const [state, formAction] = useActionState(studentSignUp, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-blue-100 dark:border-zinc-700">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Registration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Start your German learning journey today
          </p>
        </div>

        {/* عرض رسالة الخطأ */}
        {state?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" type="text" name="firstName" placeholder="Lisa" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" type="text" name="lastName" placeholder="Müller" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="student@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" placeholder="••••••••" required minLength={6} />
          </div>

          <div className="space-y-2">
            <Label>German Level</Label>
            <Select name="level" required defaultValue="A0">
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A0">Absolute Beginner (A0)</SelectItem>
                <SelectItem value="A1">Beginner (A1)</SelectItem>
                <SelectItem value="A2">Elementary (A2)</SelectItem>
                <SelectItem value="B1">Intermediate (B1)</SelectItem>
                <SelectItem value="B2">Upper Intermediate (B2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SubmitButton />
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
