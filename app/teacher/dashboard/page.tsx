import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {  ChevronRight, LayoutGrid } from "lucide-react";
import { Users, BookOpen, Activity, LogOut, PlusCircle, BarChart3, GraduationCap } from "lucide-react";
import Link from "next/link";


export default async function TeacherDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 1. جلب بيانات البروفايل
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();

  // 2. جلب عدد الطلاب
  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  // 3. جلب عدد الدروس (تأكد أن اسم الجدول 'lessons')
  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true });

  // 4. حساب متوسط الأداء العام
  const { data: allResults } = await supabase
    .from("exam_results")
    .select("score, total_questions");

  let avgPerformance = 0;
  if (allResults && allResults.length > 0) {
    const totalScore = allResults.reduce((acc, curr) => acc + curr.score, 0);
    const totalPossible = allResults.reduce((acc, curr) => acc + curr.total_questions, 0);
    avgPerformance = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  }

  const teacherName = profile ? `${profile.first_name} ${profile.last_name}` : "Lehrer";
  const qualification = profile?.qualification || "Language Instructor";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Guten Tag, {teacherName}! 👨‍🏫
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                <GraduationCap className="w-4 h-4" />
                <span>{qualification}</span>
            </div>
          </div>
          <Link href="/logout"> {/* يفضل عمل صفحة أو route للخروج */}
            <Button variant="destructive" className="gap-2 shadow-md">
                <LogOut className="h-4 w-4" /> Logout
            </Button>
          </Link>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Students */}
            <Card className="border-l-4 border-blue-500 shadow-sm bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
                    <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{studentCount || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">Active learners</p>
                </CardContent>
            </Card>

            {/* Lessons Count */}
            <Card className="border-l-4 border-purple-500 shadow-sm bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Lessons</CardTitle>
                    <BookOpen className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{lessonCount || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {lessonCount ? "Published lessons" : "No lessons yet"}
                    </p>
                </CardContent>
            </Card>

            {/* Global Performance */}
            <Card className="border-l-4 border-green-500 shadow-sm bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Performance</CardTitle>
                    <Activity className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {avgPerformance}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Average quiz score</p>
                </CardContent>
            </Card>
        </div>
{/* Classroom Management Section */}
<div className="mt-12">
    <div className="flex items-center gap-2 mb-6">
        <LayoutGrid className="h-6 w-6 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Classroom Management</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Manage Classes Card */}
        <Link href="/teacher/classes" className="group">
            <Card className="relative h-full min-h-[220px] overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-zinc-900">
                {/* خلفية ملونة خفيفة بتظهر عند الهوفر */}
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <PlusCircle size={120} />
                </div>
                
                <CardHeader className="pt-8 px-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 transition-colors group-hover:bg-blue-600">
                        <PlusCircle className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Manage Classes</CardTitle>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                        Create new student groups, assign lessons, and organize your teaching schedule.
                    </p>
                    <div className="flex items-center text-blue-600 font-bold text-sm">
                        Go to Classes <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" />
                    </div>
                </CardContent>
            </Card>
        </Link>

        {/* My Students Card */}
        <Link href="/teacher/student" className="group">
            <Card className="relative h-full min-h-[220px] overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-zinc-900">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <Users size={120} />
                </div>
                
                <CardHeader className="pt-8 px-8">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 transition-colors group-hover:bg-purple-600">
                        <Users className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">My Students</CardTitle>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                        Monitor student activity, view individual profiles, and track their learning path.
                    </p>
                    <div className="flex items-center text-purple-600 font-bold text-sm">
                        View Directory <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" />
                    </div>
                </CardContent>
            </Card>
        </Link>

        {/* Leaderboard Card */}
        <Link href="/teacher/Analytics" className="group">
            <Card className="relative h-full min-h-[220px] overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-zinc-900">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <BarChart3 size={120} />
                </div>
                
                <CardHeader className="pt-8 px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 transition-colors group-hover:bg-orange-600">
                        <BarChart3 className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</CardTitle>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                        Discover top achievers and analyze class performance based on recent test scores.
                    </p>
                    <div className="flex items-center text-orange-600 font-bold text-sm">
                        Open Analytics <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" />
                    </div>
                </CardContent>
            </Card>
        </Link>
        </div>
      </div>
        </div>
      </div>
  );
}
