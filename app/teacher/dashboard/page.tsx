"use client";

import { useEffect, useState } from "react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Users, BookOpen, PlusCircle, LogOut, Activity, BarChart3, Loader2, GraduationCap, AlertCircle } from "lucide-react";
// 1. استبدال العميل القديم بعميل Next.js الذكي
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface TeacherProfile {
  first_name: string;
  last_name: string;
  qualification: string;
}

export default function TeacherDashboard() {
  // 2. إنشاء نسخة Supabase تقرأ الكوكيز تلقائياً
  const supabase = createClientComponentClient();
  
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      try {
        // أ. جلب المستخدم (سيعمل الآن لأنه يقرأ الكوكيز)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Auth Error:", authError);
          setDebugError("No session found. Please login again.");
          return;
        }

        console.log("Teacher Found:", user.email);

        // ب. جلب بيانات الملف الشخصي
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('*') 
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Supabase Data Error:", error.message);
          setDebugError(error.message);
        } else if (userData) {
          setProfile(userData as TeacherProfile);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false); 
      }
    };

    getProfile();
  }, [supabase, router]); 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); 
    router.refresh(); // تحديث الصفحة لمسح الكاش
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-600" />
          <p className="text-gray-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // 3. عرض الاسم الحقيقي
  const teacherName = profile ? `${profile.first_name} ${profile.last_name}` : "Lehrer";
  const qualification = profile?.qualification || "Language Instructor";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Debug Box (يظهر فقط عند وجود مشكلة) */}
        {debugError && !profile && (
           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
              <strong className="block font-bold">Debug Error:</strong>
              {debugError}
           </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {/* هنا سيظهر الاسم الحقيقي */}
              Guten Tag, {teacherName}! 👨‍🏫
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                <GraduationCap className="w-4 h-4" />
                <span>{qualification}</span>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="destructive" onClick={handleLogout} className="gap-2 shadow-md">
                 <LogOut className="h-4 w-4" />
                 Logout
             </Button>
          </div>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="border-l-4 border-blue-500 shadow-sm bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
                    <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
                    <p className="text-xs text-gray-500 mt-1">Waiting for students</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-purple-500 shadow-sm bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Lessons</CardTitle>
                    <BookOpen className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
                    <p className="text-xs text-gray-500 mt-1">Create your first lesson</p>
                </CardContent>
            </Card>
             <Card className="border-l-4 border-green-500 shadow-sm bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Performance</CardTitle>
                    <Activity className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">--</div>
                    <p className="text-xs text-gray-500 mt-1">No data available</p>
                </CardContent>
            </Card>
        </div>

        {/* Management Tools */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Classroom Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/teacher/classes" passHref>
                <Card className="hover:shadow-lg transition-all cursor-pointer group hover:bg-blue-50 dark:hover:bg-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <PlusCircle className="h-6 w-6" />
                            Manage Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create groups and add lessons.</p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/teacher/students" passHref>
                <Card className="hover:shadow-lg transition-all cursor-pointer group hover:bg-purple-50 dark:hover:bg-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                            <Users className="h-6 w-6" />
                            My Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View progress and profiles.</p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/teacher/reports" passHref>
                <Card className="hover:shadow-lg transition-all cursor-pointer group hover:bg-orange-50 dark:hover:bg-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                            <BarChart3 className="h-6 w-6" />
                            Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Check quiz results.</p>
                    </CardContent>
                </Card>
            </Link>
        </div>
      </div>
    </div>
  );
}