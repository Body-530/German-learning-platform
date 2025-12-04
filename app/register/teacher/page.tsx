// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";

// export default function TeacherRegister() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 font-sans">
//       <div className="w-full max-w-lg bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-purple-200 dark:border-zinc-700">
        
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
//           Teacher Registration
//         </h1>

//         <form className="space-y-5">
//           <div>
//             <Label className="text-gray-700 dark:text-gray-300">Full Name</Label>
//             <Input type="text" placeholder="Sarah Müller" required />
//           </div>

//           <div>
//             <Label className="text-gray-700 dark:text-gray-300">Email</Label>
//             <Input type="email" placeholder="teacher@mail.com" required />
//           </div>

//           <div>
//             <Label className="text-gray-700 dark:text-gray-300">Password</Label>
//             <Input type="password" placeholder="••••••••" required />
//           </div>

//           <div>
//             <Label className="text-gray-700 dark:text-gray-300">School / Institution (optional)</Label>
//             <Input type="text" placeholder="Goethe Institut, etc..." />
//           </div>

//           <Button className="w-full text-lg py-5" type="submit">
//             Create Teacher Account
//           </Button>
//         </form>

//         <div className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
//           Already have an account?{" "}
//           <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
// استيراد useFormState للتعامل مع استجابة السيرفر (الأخطاء)
import { useActionState  } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, AlertCircle, Briefcase, UserPlus } from "lucide-react";
import { teacherSignUp } from "./actions"; // تأكد من وجود ملف actions.ts واستيراد الدالة

// 1. مكون زر الإرسال (مفصول ليتمكن من استخدام useFormStatus)
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 transition-all"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Registering...
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5 mr-2" />
          Register as Teacher
        </>
      )}
    </Button>
  );
}

// الحالة الأولية (لتجنب أخطاء null)
const initialState = {
  error: "",
};

export default function TeacherRegisterPage() {
  // 2. ربط الأكشن مع الحالة
  const [state, formAction] = useActionState(teacherSignUp, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <Card className="w-full max-w-lg dark:bg-zinc-900 border-yellow-300 dark:border-yellow-700 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <Briefcase className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold">Teacher Registration</CardTitle>
          <CardDescription>
            Create your professional account to manage lessons and students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* عرض رسالة الخطأ إذا وجدت */}
          {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{state.error}</span>
            </div>
          )}

          {/* 3. النموذج مربوط بـ dispatch */}
          <form action={formAction} className="grid gap-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="Max" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Mustermann" required />
                </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                name="email" 
                placeholder="teacher@deutscheschule.com" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                name="password" 
                required 
                minLength={6}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="qualification">Teaching Qualification / Degree</Label>
              <Input 
                id="qualification" 
                type="text" 
                name="qualification" 
                placeholder="e.g., DaF Certification" 
                required 
              />
            </div>

            <SubmitButton /> 
          </form>
          
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400 font-semibold">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}