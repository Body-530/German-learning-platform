import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Star, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeacherAnalyticsPage() {
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

  // 1. جلب الطلاب والنتائج
  const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student');
  const { data: results } = await supabase.from('exam_results').select('user_id, score, total_questions');

  // 2. معالجة البيانات وحساب المتوسطات
  const leaderboard = students?.map(student => {
    const studentResults = results?.filter(r => r.user_id === student.id) || [];
    const examsTaken = studentResults.length;
    
    let totalPercentage = 0;
    studentResults.forEach(r => {
        const percentage = r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0;
        totalPercentage += percentage;
    });
    
    const averageScore = examsTaken > 0 ? Math.round(totalPercentage / examsTaken) : 0;

    return {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      averageScore,
      examsTaken
    };
  })
  // 3. الترتيب من الأعلى للأقل وأخذ أول 10
  .sort((a, b) => b.averageScore - a.averageScore)
  .slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Performance Analytics <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </h1>
            <p className="text-gray-500">Track your top performing students.</p>
          </div>
        </div>

        {/* Leaderboard Card */}
        <Card className="shadow-xl border-t-8 border-t-yellow-500 bg-white dark:bg-zinc-900">
          <CardHeader className="text-center border-b bg-yellow-50/50 dark:bg-yellow-900/10">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-2xl font-black">TOP 10 LEADERBOARD</CardTitle>
            <CardDescription>Based on average exam performance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {leaderboard.length > 0 ? (
                leaderboard.map((student, index) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                      index === 0 ? "bg-yellow-50/30 dark:bg-yellow-900/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Number / Icon */}
                      <div className="w-10 text-center font-black text-xl">
                        {index === 0 && <Medal className="h-8 w-8 text-yellow-500 mx-auto" />}
                        {index === 1 && <Medal className="h-8 w-8 text-gray-400 mx-auto" />}
                        {index === 2 && <Medal className="h-8 w-8 text-orange-400 mx-auto" />}
                        {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                      </div>

                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className={`${
                            index === 0 ? "bg-yellow-500 text-white" : "bg-blue-100 text-blue-700"
                          } font-bold`}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={`font-bold ${index === 0 ? "text-lg text-yellow-700 dark:text-yellow-500" : ""}`}>
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.examsTaken} Exams Completed
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right">
                      <div className={`text-2xl font-black ${
                        student.averageScore >= 80 ? "text-green-600" : 
                        student.averageScore >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {student.averageScore}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        Average Score
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-500 font-medium">
                   No data available to rank students yet. 
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-blue-600 text-white border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <GraduationCap className="h-5 w-5" /> Most Active Student
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-black">
                        {leaderboard.sort((a,b) => b.examsTaken - a.examsTaken)[0]?.name || "--"}
                    </p>
                    <p className="text-blue-100 text-sm mt-1 italic">Taking the most challenges!</p>
                </CardContent>
            </Card>
            
            <Card className="bg-emerald-600 text-white border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <Trophy className="h-5 w-5" /> Top Performer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-black">{leaderboard[0]?.name || "--"}</p>
                    <p className="text-emerald-100 text-sm mt-1 italic">Setting the gold standard.</p>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}