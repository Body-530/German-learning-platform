import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, UserPlus } from "lucide-react";
import Link from "next/link";
import StudentTableClient from "./tableClient"; // استدعاء مكون الجدول

export default async function TeacherStudentsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // جلب البيانات
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  const { data: results, error: resultsError } = await supabase
    .from('exam_results')
    .select('user_id, score, total_questions, completed_at');

  if (studentsError || resultsError) {
    console.error("Error fetching data:", studentsError || resultsError);
  }

  // معالجة البيانات
  const studentsWithStats = students?.map(student => {
    const studentResults = results?.filter(r => r.user_id === student.id) || [];
    const examsTaken = studentResults.length;
    
    let totalPercentage = 0;
    studentResults.forEach(r => {
        const percentage = r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0;
        totalPercentage += percentage;
    });
    
    const averageScore = examsTaken > 0 ? Math.round(totalPercentage / examsTaken) : 0;
    
    const lastActive = studentResults.length > 0 
        ? new Date(Math.max(...studentResults.map((r: any) => new Date(r.completed_at).getTime()))).toISOString().slice(0, 10)
        : "No activity";

    let statusColor = "text-gray-500";
    if (examsTaken > 0) {
        if (averageScore >= 80) statusColor = "text-green-600";
        else if (averageScore >= 50) statusColor = "text-yellow-600";
        else statusColor = "text-red-600";
    }

    return {
        ...student,
        stats: { examsTaken, averageScore, lastActive, statusColor }
    };
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              My Students <GraduationCap className="h-8 w-8 text-blue-600" />
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your students and track their progress.
            </p>
          </div>
          <Link href="/register/student" passHref>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </Link>
        </div>

        {/* Card containing the Client-side Table */}
        <Card className="shadow-lg border-t-4 border-t-blue-500 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>
              Total Students: {studentsWithStats.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* هنا بنبعت الداتا الجاهزة للكلينت كومبوننت */}
            <StudentTableClient initialStudents={studentsWithStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}