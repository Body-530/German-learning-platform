import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Star, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ExamResultWithExam {
  user_id: string;
  score: number;
  total_questions: number;
  exams: { title: string; type: string } | { title: string; type: string }[]; 
}

export default async function StudentLeaderboardPage() {
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

  // التأكد من تسجيل الدخول
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // جلب البيانات
  const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student');
  const { data: resultsRaw } = await supabase.from('exam_results').select(`user_id, score, total_questions, exams (title, type)`);

  const results = (resultsRaw as unknown as ExamResultWithExam[]) || [];

  // معالجة البيانات
  const leaderboard = (students || []).map(student => {
    const studentResults = results.filter(r => r.user_id === student.id);
    const examsTaken = studentResults.length;
    
    let totalPercentage = 0;
    const examTypes = Array.from(new Set(studentResults.map(r => {
        const examData = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        return examData?.type;
    }))).filter(Boolean) as string[];

    studentResults.forEach(r => {
        const percentage = r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0;
        totalPercentage += percentage;
    });
    
    const averageScore = examsTaken > 0 ? Math.round(totalPercentage / examsTaken) : 0;
    const rankPower = averageScore + (examsTaken * 5); 

    return {
      id: student.id,
      name: `${student.first_name || ''} ${student.last_name || ''}`,
      averageScore,
      examsTaken,
      rankPower,
      examTypes
    };
  })
  .sort((a, b) => b.rankPower - a.rankPower);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header - زر الرجوع يوجه للوحة تحكم الطالب */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-200">
            <Link href="/student/dashboard"><ArrowLeft className="h-6 w-6 text-[#1B4332]" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black text-[#1B4332] flex items-center gap-2">
              Rangliste <Trophy className="h-8 w-8 text-yellow-500" />
            </h1>
            <p className="text-slate-500 font-medium">Schau dir an, wo du stehst!</p>
          </div>
        </div>

        {/* الكارت الرئيسي */}
        <Card className="shadow-xl border-none rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="text-center border-b bg-slate-50/50 py-6">
            <CardTitle className="text-2xl font-black text-[#1B4332]">HALL OF FAME</CardTitle>
            <CardDescription className="font-bold text-slate-400">Alle Schüler im Vergleich</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {leaderboard.length > 0 ? (
                leaderboard.map((student, index) => {
                  // تمييز الطالب الحالي بلون مختلف
                  const isCurrentUser = student.id === user.id;

                  return (
                    <div 
                      key={student.id} 
                      className={`flex items-center justify-between p-5 transition-all ${
                        isCurrentUser ? "bg-[#1B4332]/10 border-l-4 border-[#1B4332]" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center font-black text-xl text-slate-400">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-100">
                            <AvatarFallback className={`${isCurrentUser ? "bg-[#1B4332] text-white" : "bg-slate-200 text-slate-600"} font-black text-xs`}>
                              {student.name.substring(0,2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-black text-slate-800 flex items-center gap-2">
                              {student.name} {isCurrentUser && <span className="text-[10px] bg-[#1B4332] text-white px-2 rounded-full">DU</span>}
                            </div>
                            <div className="flex gap-1 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> {student.examsTaken} Prüfungen
                                </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-2xl font-black ${
                            student.averageScore >= 80 ? "text-green-600" : 
                            student.averageScore >= 50 ? "text-yellow-600" : "text-red-600"
                        }`}>
                            {student.averageScore}%
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-slate-300 font-bold">Noch keine Daten.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}