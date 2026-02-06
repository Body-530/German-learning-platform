"use client";
import { GraduationCap, ChevronRight, LayoutGrid, FileText } from "lucide-react";
import { useEffect, useState } from "react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, LogOut, Loader2, ArrowRight, TrendingUp, Zap, BarChart3, Activity, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; 

interface Profile {
  id: string; // Added ID to match results
  first_name: string;
  last_name: string;
  german_level: string; 
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New States for Dynamic Data
  const [averageScore, setAverageScore] = useState(0);
  const [globalRank, setGlobalRank] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 1. Get Profile
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, german_level') 
            .eq('id', user.id)
            .single();

          if (userData) setProfile(userData as Profile);

          // 2. Logic for Average Score and Rank
          const { data: allStudents } = await supabase.from('profiles').select('id').eq('role', 'student');
          const { data: allResults } = await supabase.from('exam_results').select('user_id, score, total_questions');

          if (allStudents && allResults) {
            setTotalStudents(allStudents.length);

            const studentStats = allStudents.map(s => {
              const res = allResults.filter(r => r.user_id === s.id);
              let scoreSum = 0;
              let qSum = 0;
              res.forEach(r => { scoreSum += r.score; qSum += r.total_questions; });
              
              const avg = qSum > 0 ? Math.round((scoreSum / qSum) * 100) : 0;
              return { id: s.id, avg };
            });

            const sorted = [...studentStats].sort((a, b) => b.avg - a.avg);
            const rank = sorted.findIndex(s => s.id === user.id) + 1;
            const currentAvg = sorted.find(s => s.id === user.id)?.avg || 0;

            setGlobalRank(rank);
            setAverageScore(currentAvg);
          }
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false); 
      }
    };

    getDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const nextLevelsMap: Record<string, string> = {
    A0: 'A1', A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'Final'
  };
  
  const studentName = profile ? `${profile.first_name} ${profile.last_name}` : "Student";
  const studentLevel = profile?.german_level ? profile.german_level.toUpperCase() : "A0";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guten Tag, {studentName}! 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Your dashboard for learning German.</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="gap-2 shadow-md">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </header>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Level Card */}
          <Card className="border-l-4 border-blue-500 shadow-lg bg-white dark:bg-zinc-900 transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase">Current Level</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-blue-600">{studentLevel}</div>
              <p className="text-xs text-gray-500 mt-1">Next Level: {nextLevelsMap[studentLevel] || 'Expert'}</p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="border-l-4 border-green-500 shadow-lg bg-white dark:bg-zinc-900 transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase">Average Score</CardTitle>
              <Activity className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-900 dark:text-white">{averageScore}%</div>
              <p className="text-xs text-gray-500 mt-1">{averageScore >= 50 ? "Doing great!" : "Keep practicing!"}</p>
            </CardContent>
          </Card>

          {/* Global Rank Card */}
          <Card className="border-l-4 border-yellow-500 shadow-lg bg-white dark:bg-zinc-900 transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase">Global Rank</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-900 dark:text-white">#{globalRank}</div>
              <p className="text-xs text-gray-500 mt-1">Among {totalStudents} students</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Center Grid */}
        <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
          <LayoutGrid className="h-6 w-6 text-gray-400" />
          <h2 className="text-2xl font-bold">Student Management Center</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/student/vocab" className="group">
            <Card className="relative h-full min-h-[220px] overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-zinc-900 text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 text-blue-600"><BookOpen size={120} /></div>
              <CardHeader className="pt-8 px-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 transition-colors group-hover:bg-blue-600">
                  <BookOpen className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Worte</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Review your saved vocabulary and master new German words.</p>
                <div className="flex items-center text-blue-600 font-bold text-sm">Review Words <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" /></div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/exams" className="group">
            <Card className="relative h-full min-h-[220px] overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-zinc-900 border-l-4 border-l-indigo-500 text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 text-indigo-600"><GraduationCap size={120} /></div>
              <CardHeader className="pt-8 px-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-600">
                  <FileText className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Official Exams</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Practice with URT and TOC official models for certification.</p>
                <div className="flex items-center text-indigo-600 font-bold text-sm">Start Exam <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" /></div>
              </CardContent>
            </Card>
          </Link>

         <Link href="/student/leaderboard" className="group">
            <Card className="relative h-full min-h-[220px] overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-zinc-900 text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 text-orange-600"><BarChart3 size={120} /></div>
              <CardHeader className="pt-8 px-8">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 transition-colors group-hover:bg-orange-600">
                  <BarChart3 className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Discover top achievers and analyze class performance.</p>
                <div className="flex items-center text-orange-600 font-bold text-sm">Open Leaderboard <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" /></div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/quiz" className="group">
            <Card className="relative h-full min-h-[220px] overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-zinc-900 text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 text-purple-600"><Zap size={120} /></div>
              <CardHeader className="pt-8 px-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 transition-colors group-hover:bg-purple-600">
                  <Zap className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Vokabeltest</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Test your knowledge with quick quizzes to boost your level.</p>
                <div className="flex items-center text-purple-600 font-bold text-sm">Start Quiz <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" /></div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
