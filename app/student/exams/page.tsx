
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 
import { 
  Loader2, BookOpen, PenTool, CheckCircle, XCircle, 
  ArrowRight, ChevronLeft, Calendar, AlertCircle, MessageSquare, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

// --- Types ---
type ViewState = 'TYPE_SELECTION' | 'EXAM_SELECTION' | 'QUIZ' | 'RESULT';
type ExamType = 'URT' | 'TOC';

interface Question {
  id: string;
  question_text: string;
  context_text?: string;
  options: string[] | string; 
  correct_answer: string;
  order_index: number;
  question_type: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  type: string;
  year: number;
}

interface StudentResult extends Question {
  studentAnswer: string;
  isCorrect: boolean;
}

export default function ExamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('TYPE_SELECTION');
  
  const [selectedType, setSelectedType] = useState<ExamType | null>(null);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);

  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState(""); 
  const [allStudentAnswers, setAllStudentAnswers] = useState<StudentResult[]>([]);
  const [score, setScore] = useState(0);

  const wordCount = writtenAnswer.trim() ? writtenAnswer.trim().split(/\s+/).length : 0;

  // --- Functions ---
  const handleTypeSelect = async (type: ExamType) => {
    setLoading(true);
    setSelectedType(type);
    try {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('type', type)
            .order('year', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
            setAvailableExams(data as Exam[]);
            setViewState('EXAM_SELECTION');
        } else {
            alert(`No exams found for ${type}`);
        }
    } catch (error) {
        console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (exam: Exam) => {
    setLoading(true);
    setCurrentExam(exam);
    try {
      const { data: questionsData, error: qError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('order_index', { ascending: true });

      if (qError || !questionsData || questionsData.length === 0) throw new Error('No questions found');

      setQuestions(questionsData as Question[]);
      setViewState('QUIZ');
      setCurrentIndex(0);
      setScore(0);
      setAllStudentAnswers([]);
      setSelectedOption(null);
      setWrittenAnswer("");
    } catch (error) {
      alert('عذراً، لم يتم العثور على أسئلة.');
    } finally {
      setLoading(false);
    }
  };

  const confirmAnswer = () => {
    const currentQuestion = questions[currentIndex];
    const isWritten = currentQuestion.question_type?.includes('Schriftlicher');
    
    if (!isWritten && !selectedOption) return;
    if (isWritten && wordCount < 2) return; 

    const studentAnswer = isWritten ? writtenAnswer : (selectedOption || "");
    // trim() بتمسح أي مسافة فاضية زيادة في الأول أو الآخر عشان المقارنة تبقى دقيقة
  const isCorrect = isWritten ? true : studentAnswer?.trim() === currentQuestion.correct_answer?.trim();

    if (isCorrect) setScore(prev => prev + 1);

    // تخزين الإجابة مع تفاصيل السؤال للمراجعة لاحقاً
    const resultEntry: StudentResult = {
      ...currentQuestion,
      studentAnswer,
      isCorrect
    };

    setAllStudentAnswers(prev => [...prev, resultEntry]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setWrittenAnswer("");
    } else {
      finishExam(isCorrect ? score + 1 : score, [...allStudentAnswers, resultEntry]);
    }
  };

  const finishExam = async (finalScore: number, finalAnswers: StudentResult[]) => {
    setViewState('RESULT');
    const { data: { user } } = await supabase.auth.getUser();
    if (user && currentExam) {
        await supabase.from('exam_results').insert({
            user_id: user.id,
            exam_id: currentExam.id,
            score: finalScore,
            total_questions: questions.length,
            details: finalAnswers
        });
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">
      <Loader2 className="h-10 w-10 animate-spin text-[#8B0000]" />
    </div>
  );

  // --- View: Type Selection ---
  if (viewState === 'TYPE_SELECTION') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-8 flex flex-col items-center justify-center">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-black text-[#1B4332] font-serif uppercase tracking-tight">Viel Erfolg! 🇩🇪</h1>
          <p className="text-slate-400 font-bold text-sm tracking-widest">WÄHLEN SIE IHREN PRÜFUNGSTYP</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          <ExamCard 
            title="URT Exam" 
            desc="Universitäts-Reife-Test"
            icon={<BookOpen className="w-10 h-10"/>} 
            color="black" 
            onClick={() => handleTypeSelect('URT')} 
          />
          <ExamCard 
            title="TOC Exam" 
            desc="Test of Competence"
            icon={<PenTool className="w-10 h-10"/>} 
            color="red" 
            onClick={() => handleTypeSelect('TOC')} 
          />
        </div>
      </div>
    );
  }

  // --- View: Exam Selection ---
  if (viewState === 'EXAM_SELECTION') {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Button variant="ghost" onClick={() => setViewState('TYPE_SELECTION')} className="text-[#8B0000] font-bold">
          <ChevronLeft className="w-4 h-4 mr-1" /> ZURÜCK
        </Button>
        <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4 border-[#1B4332]">
            <h2 className="text-2xl font-black text-[#1B4332] mb-6 flex items-center gap-3">
               <Calendar className="w-6 h-6" /> {selectedType} Jahr wählen
            </h2>
            <div className="grid gap-3">
                {availableExams.map((exam) => (
                    <div 
                        key={exam.id}
                        onClick={() => startExam(exam)}
                        className="group flex items-center justify-between p-5 rounded-xl border hover:border-[#1B4332] hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-bold">
                                {exam.year}
                            </div>
                            <span className="font-bold text-slate-700">{exam.title}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1B4332]" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  // --- View: Quiz ---
  if (viewState === 'QUIZ' && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const isWritten = currentQuestion.question_type?.includes('Schriftlicher');
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const optionsArray = typeof currentQuestion.options === 'string' 
        ? JSON.parse(currentQuestion.options) 
        : currentQuestion.options;

    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col pt-6">
        <div className="mb-6 space-y-3">
            <div className="flex justify-between items-end">
                <p className="text-[#8B0000] font-bold text-xs uppercase tracking-widest">{currentQuestion.question_type}</p>
                <span className="text-slate-400 font-bold text-xs">{currentIndex + 1} / {questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg border-none rounded-2xl overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4 border-t-4 border-[#1B4332]">
            {currentQuestion.context_text && (
                <div className="mb-6 p-5 bg-slate-50 rounded-xl border-l-4 border-[#FFCE00] italic font-serif text-lg text-slate-700">
                    {currentQuestion.context_text}
                </div>
            )}
            <CardTitle className="text-2xl font-black text-slate-800 font-serif leading-snug">
                {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            {isWritten ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#1B4332] font-bold text-xs uppercase tracking-widest">
                        <MessageSquare className="w-4 h-4" /> Ihre Antwort
                    </div>
                    <Textarea 
                        placeholder="Schreiben Sie hier..."
                        className="min-h-[250px] text-lg p-6 rounded-xl border-2 border-slate-100 focus:border-[#1B4332] bg-[#FDFBF7] text-black font-medium leading-relaxed"
                        value={writtenAnswer}
                        onChange={(e) => setWrittenAnswer(e.target.value)}
                    />
                    <div className="text-right font-bold text-xs text-slate-400">
                        {wordCount} WÖRTER
                    </div>
                </div>
            ) : (
                <div className="grid gap-3">
                    {optionsArray.map((option: string, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(option)}
                            className={`w-full flex items-center p-5 rounded-xl border-2 text-left transition-all font-bold ${selectedOption === option ? 'border-[#1B4332] bg-[#1B4332] text-white' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-xs ${selectedOption === option ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {option}
                        </button>
                    ))}
                </div>
            )}
          </CardContent>

          <CardFooter className="p-8 bg-slate-50 flex justify-end items-center">
             <Button 
                onClick={confirmAnswer} 
                disabled={(!isWritten && !selectedOption) || (isWritten && wordCount < 2)}
                className="bg-[#1B4332] hover:bg-black text-white px-10 h-12 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors"
            >
                {currentIndex === questions.length - 1 ? 'Prüfung beenden' : 'Bestätigen'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- View: Result & Review ---
  if (viewState === 'RESULT') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
        <div className="min-h-screen py-12 px-6 bg-[#FDFBF7]">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Score Card */}
                <Card className="text-center shadow-xl border-none rounded-3xl p-10 bg-white border-t-8 border-[#1B4332]">
                    <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${percentage >= 50 ? 'bg-[#1B4332]' : 'bg-[#8B0000]'} text-white shadow-lg`}>
                        {percentage >= 50 ? <CheckCircle className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
                    </div>
                    <h2 className="text-5xl font-black text-slate-800 mb-2">{percentage}%</h2>
                    <p className="text-slate-500 font-bold text-xl mb-8">Ergebnis: {score} von {questions.length} richtig</p>
                    
                    <div className="flex gap-4">
                        <Button className="flex-1 h-12 bg-[#1B4332] hover:bg-black font-bold" onClick={() => window.location.reload()}>NEU STARTEN</Button>
                        <Button variant="outline" className="flex-1 h-12 border-2" onClick={() => router.push('/student/dashboard')}>ZUM DASHBOARD</Button>
                    </div>
                </Card>

                {/* Review Section */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-[#1B4332] flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" /> IHRE ANTWORTEN IM DETAIL
                    </h3>
                    
                    {allStudentAnswers.map((item, index) => (
                        <Card key={index} className={`overflow-hidden border-none shadow-md ${item.isCorrect ? 'bg-white' : 'bg-red-50/30'}`}>
                            <div className={`h-1 w-full ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Frage {index + 1}</span>
                                    {item.isCorrect ? (
                                        <span className="flex items-center gap-1 text-green-600 font-bold text-sm"><Check className="w-4 h-4"/> Richtig</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 font-bold text-sm"><X className="w-4 h-4"/> Falsch</span>
                                    )}
                                </div>
                                <p className="font-bold text-slate-800 text-lg mb-4">{item.question_text}</p>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ihre Antwort</p>
                                        <p className={`font-bold ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                            {item.studentAnswer || "Keine Antwort"}
                                        </p>
                                    </div>
                                    {!item.isCorrect && (
                                        <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                                            <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Richtige Antwort</p>
                                            <p className="font-bold text-green-800">{item.correct_answer}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  return null;
}

// --- Sub-components ---
function ExamCard({ title, desc, icon, color, onClick }: { title: string, desc: string, icon: any, color: 'black' | 'red', onClick: () => void }) {
    return (
        <Card 
          onClick={onClick} 
          className="cursor-pointer border-2 border-slate-100 transition-all group hover:border-[#1B4332] hover:shadow-xl rounded-3xl overflow-hidden bg-white flex flex-col justify-center items-center p-10 text-center"
        >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${color === 'black' ? 'bg-slate-900' : 'bg-[#8B0000]'} text-white group-hover:scale-110 shadow-lg`}>
                {icon}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{title}</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">{desc}</p>
            <div className="text-[#1B4332] font-black text-sm flex items-center gap-2">JETZT STARTEN <ArrowRight className="w-4 h-4" /></div>
        </Card>
    );
}