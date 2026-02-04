
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { ChevronLeft, Calendar, Trophy, Target, TrendingUp, Mail, Send, Edit, BookOpen, GraduationCap } from "lucide-react"; 
import Link from "next/link";
import StudentChart from "@/components/StudentChart";

interface StudentClientProps {
  student: any;
  results: any[];
  chartData: any[];
  stats: {
    examsCount: number;
    averageScore: number;
    bestScore: number;
  };
  email: string;
}

export default function StudentClientView({ student, results, chartData, stats, email }: StudentClientProps) {
  const [note, setNote] = useState("");
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHomeworkOpen, setIsHomeworkOpen] = useState(false);
  
  // States للواجب
  const [hwTitle, setHwTitle] = useState("");
  const [hwDate, setHwDate] = useState("");

  // وظيفة موحدة لفتح Gmail
  const openGmail = (subject: string, body: string) => {
    if (!email || email === "No Email") {
      alert("This student has no registered email!");
      return;
    }
    // رابط Gmail المباشر لإنشاء رسالة جديدة
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank");
  };

  // 1. منطق "Send Note via Email" (ملاحظات تفاعلية)
  const handleSendNote = () => {
    const subject = `Progress Feedback: ${student.first_name}`;
    const body = `Hallo ${student.first_name},\n\nI have reviewed your recent performance on the platform and wanted to share this feedback:\n\n"${note}"\n\nKeep up the good work!\nBest regards.`;
    openGmail(subject, body);
    setIsNoteOpen(false);
    setNote("");
  };

  // 2. منطق "Assign Homework" (تكليف واجب عبر Gmail)
  const handleAssignHomework = () => {
    const subject = `New German Assignment: ${hwTitle}`;
    const body = `Hallo ${student.first_name},\n\nYou have a new homework assignment to complete:\n\nTask: ${hwTitle}\nDue Date: ${hwDate}\n\nPlease let me know if you have any questions.\n\nViel Erfolg!`;
    openGmail(subject, body);
    setIsHomeworkOpen(false);
    setHwTitle("");
    setHwDate("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/teacher/student">
            <Button variant="ghost" className="gap-2 text-gray-600 hover:text-blue-600">
              <ChevronLeft className="h-4 w-4" /> Back to Students
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <Avatar className="h-24 w-24 border-4 border-blue-50 shadow-sm">
            <AvatarImage src={student.avatar_url} />
            <AvatarFallback className="text-3xl bg-blue-600 text-white font-bold uppercase">
              {student.first_name?.[0]}{student.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                {student.first_name} {student.last_name}
              </h1>
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none text-sm px-3 py-1">
                {student.german_level || 'Level A0'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                    <Mail className="h-3.5 w-3.5 text-blue-500" /> 
                    <span className="select-all">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                    <Calendar className="h-3.5 w-3.5 text-orange-500" /> 
                    Joined: {new Date(student.created_at).toLocaleDateString("en-GB")}
                </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-sm border-t-4 border-t-blue-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Exams</CardTitle>
                    <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent><div className="text-3xl font-bold">{stats.examsCount}</div></CardContent>
            </Card>
            <Card className="shadow-sm border-t-4 border-t-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold ${stats.averageScore >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                        {stats.averageScore}%
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm border-t-4 border-t-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Best Score</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent><div className="text-3xl font-bold text-yellow-600">{Math.round(stats.bestScore)}%</div></CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card><CardHeader><CardTitle>Performance Trend</CardTitle></CardHeader>
                    <CardContent className="pl-0"><StudentChart data={chartData} /></CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Recent Exams Log</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.slice(0).reverse().map((exam: any) => {
                                    const percentage = exam.total_questions > 0 ? (exam.score / exam.total_questions) * 100 : 0;
                                    return (
                                        <TableRow key={exam.id}>
                                            <TableCell>{new Date(exam.completed_at).toLocaleDateString("en-GB")}</TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{Math.round(percentage)}%</div>
                                                <div className="text-xs text-gray-400">{exam.score}/{exam.total_questions}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={percentage >= 50 ? "default" : "destructive"} className={percentage >= 50 ? "bg-green-500" : ""}>
                                                    {percentage >= 50 ? "Passed" : "Failed"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Actions */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* 1. Send Note via Email */}
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-blue-700 flex items-center gap-2">Teacher's Feedback 📨</CardTitle>
                        <CardDescription>Send personal feedback to Gmail.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                    <Send className="h-4 w-4" /> Send Note via Email
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Feedback for {student.first_name}</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Label>Your Feedback Message</Label>
                                    <Textarea placeholder="Write your notes here..." value={note} onChange={(e) => setNote(e.target.value)} />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsNoteOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSendNote} disabled={!note.trim()}>Open Gmail</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        
                        {/* 2. Assign Homework (Gmail Based) */}
                        <Dialog open={isHomeworkOpen} onOpenChange={setIsHomeworkOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full justify-start gap-2 border-orange-200 hover:bg-orange-50">
                                    <BookOpen className="h-4 w-4 text-orange-600" /> Assign Homework
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Assign Task via Gmail</DialogTitle>
                                    <DialogDescription>This will generate an assignment email.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Homework Title</Label>
                                        <Input placeholder="e.g., Vocabulary Unit 3" value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Due Date</Label>
                                        <Input type="date" value={hwDate} onChange={(e) => setHwDate(e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAssignHomework} className="bg-orange-600 hover:bg-orange-700">Compose Assignment Email</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* 3. Send Regular Email (Blank) */}
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => openGmail("General Inquiry", "Hello,")}>
                            <Mail className="h-4 w-4" /> Send Regular Email
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}