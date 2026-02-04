
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Star, ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 1. تعريف شكل البيانات الناتج عن الـ Join لحل مشكلة TypeScript
interface ExamResultWithExam {
  user_id: string;
  score: number;
  total_questions: number;
  exams: {
    title: string;
    type: string;
  } | { title: string; type: string }[]; 
}

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

  // جلب الطلاب والنتائج مع تفاصيل الامتحان
  const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student');
  
  const { data: resultsRaw } = await supabase
    .from('exam_results')
    .select(`
      user_id, 
      score, 
      total_questions,
      exams (title, type)
    `);

  // عمل Type Casting للبيانات الخام للنوع اللي عرفناه فوق
  const results = (resultsRaw as unknown as ExamResultWithExam[]) || [];

  // 2. معالجة البيانات وحساب الرانك المتقدم
  const leaderboard = (students || []).map(student => {
    const studentResults = results.filter(r => r.user_id === student.id);
    const examsTaken = studentResults.length;
    
    let totalPercentage = 0;
    
    // استخراج أنواع الامتحانات (URT, TOC) بأمان
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
  .sort((a, b) => b.rankPower - a.rankPower) // الترتيب بناءً على القوة (درجة + نشاط)
  .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/teacher/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
              Bestenliste <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </h1>
            <p className="text-slate-500 font-medium">Leistungsanalyse und Ranking der Schüler.</p>
          </div>
        </div>

        {/* Leaderboard Card */}
        <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="text-center border-b bg-slate-50/50 py-8">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <CardTitle className="text-3xl font-black text-[#1B4332] tracking-tight">TOP 10 SCHÜLER</CardTitle>
            <CardDescription className="font-bold text-slate-400">Basierend auf Durchschnittsnote und Aktivität</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {leaderboard.length > 0 ? (
                leaderboard.map((student, index) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-6 transition-colors hover:bg-slate-50/80 ${
                      index === 0 ? "bg-yellow-50/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      {/* Rank Number */}
                      <div className="w-10 text-center font-black text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </div>

                      {/* Student Info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarFallback className="bg-[#1B4332] text-white font-black">
                            {student.name.substring(0,2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={`font-black text-lg ${index === 0 ? "text-[#1B4332]" : "text-slate-700"}`}>
                            {student.name}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {student.examTypes.map(type => (
                              <span key={type} className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-lg font-black uppercase shadow-sm">
                                {type}
                              </span>
                            ))}
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 ml-1">
                               <CheckCircle2 className="h-3 w-3" /> {student.examsTaken} Prüfungen
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className={`text-3xl font-black ${
                        student.averageScore >= 80 ? "text-green-600" : 
                        student.averageScore >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {student.averageScore}%
                      </div>
                      <div className="text-[10px] uppercase font-black text-slate-300 tracking-widest">
                        Durchschnitt
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-slate-300 font-bold italic">
                   Noch keine Prüfungsdaten verfügbar.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-[#1B4332] text-white border-none shadow-xl p-8 rounded-[32px] relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-emerald-300 text-xs font-black uppercase tracking-[0.2em] mb-2">Fleißigster Schüler</p>
                    <h3 className="text-3xl font-black tracking-tight">
                        {leaderboard.sort((a,b) => b.examsTaken - a.examsTaken)[0]?.name || "N/A"}
                    </h3>
                    {/* <p className="text-emerald-100/70 text-sm mt-3 font-medium flex items-center gap-2">
                        <activity className="h-4 w-4" /> Höchste Prüfungsbeteiligung
                    </p> */}
                </div>
                <GraduationCap className="absolute -bottom-6 -right-6 h-32 w-32 text-emerald-900/40" />
            </Card>

            <Card className="bg-white border-none shadow-xl p-8 rounded-[32px] border-l-8 border-yellow-500">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Klassendurchschnitt</p>
                        <h3 className="text-4xl font-black text-slate-800">
                            {leaderboard.length > 0 
                                ? Math.round(leaderboard.reduce((acc, curr) => acc + curr.averageScore, 0) / leaderboard.length) 
                                : 0}%
                        </h3>
                    </div>
                    <div className="h-16 w-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                        <Star className="h-8 w-8 text-yellow-600 fill-yellow-600" />
                    </div>
                </div>
                <p className="text-slate-400 text-xs mt-4 font-bold">Basierend auf den Top 10 Schülern.</p>
            </Card>
        </div>

      </div>
    </div>
  );
}