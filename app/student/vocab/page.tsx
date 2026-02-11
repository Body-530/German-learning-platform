

"use client";

import { ChevronLeft, Volume2, Search, ArrowRight, Loader2, AlertCircle, Trash2, BookOpen, Dumbbell, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// 1. تحديث الـ Interface ليشمل الدرس
interface VocabularyItem {
  id: string;
  user_id: string | null;
  german_word: string;
  arabic_translation: string;
  article: string | null;
  example_sentence: string | null;
  mastery_level: number | null;
  lesson?: string; // حقل اختياري مؤقتاً
}

// دالة النطق
const speakText = (text: string) => {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(v => v.lang.startsWith('de'));
  if (germanVoice) utterance.voice = germanVoice;
  window.speechSynthesis.speak(utterance);
};

export default function StudentVocabPage() {
    const [allVocab, setAllVocab] = useState<VocabularyItem[]>([]);
    const [filteredVocab, setFilteredVocab] = useState<VocabularyItem[]>([]); // للعرض الحالي
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    // 2. حالة جديدة للتحكم في العرض (قائمة الدروس vs كلمات الدرس)
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null); // null means show lesson list

  const lessons = Array.from({ length: 18 }, (_, i) => (i + 1).toString());

    useEffect(() => {
        const fetchVocab = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);

            let query = supabase.from('words').select('*').order('created_at', { ascending: false });
            
            if (user) {
                query = query.or(`user_id.eq.${user.id},user_id.is.null`);
            } else {
                query = query.is('user_id', null);
            }

            const { data, error: dbError } = await query;

            if (dbError) {
                setError("Failed to load vocabulary.");
            } else if (data) {
             
               setAllVocab(data);

            }
            setLoading(false);
        };

        fetchVocab();
    }, []);


    const handleSelectLesson = (lesson: string) => {
        setSelectedLesson(lesson);
        setSearchTerm(""); 
        if (lesson === 'all') {
            setFilteredVocab(allVocab);
        } else {
            setFilteredVocab(allVocab.filter(item => item.lesson === lesson));
        }
    };

  const parseCSV = (csvText: string): VocabularyItem[] => {
  return csvText
    .split("\n")
    .slice(1) // تجاهل العنوان
    .map(line => {
      const [german_word, article, arabic_translation, example_sentence, mastery_level, lesson] = line.split(",");
      return { id: crypto.randomUUID(), user_id: null, german_word, article, arabic_translation, example_sentence, mastery_level: Number(mastery_level), lesson };
    });
};

       // ← BATCH INSERT ADDITION
    // دالة رفع CSV كبير بأكثر من 1000 كلمة
    const handleUploadCSV = async (csvData: string) => {
        const parsedWords: VocabularyItem[] = parseCSV(csvData); // CSV -> كائنات
        const batchSize = 500; // عدد الكلمات لكل دفعة

        for (let i = 0; i < parsedWords.length; i += batchSize) {
            const batch = parsedWords.slice(i, i + batchSize);
            const { data, error } = await supabase.from('words').insert(batch);
            if (error) {
                console.error(`Error in batch ${i / batchSize + 1}:`, error);
                break;
            } else {
                console.log(`Batch ${i / batchSize + 1} uploaded`);
            }
        }

        // تحديث الـ state بعد رفع كل الدفعات
        setAllVocab(prev => [...prev, ...parsedWords]);
    };
    const displayedVocab = selectedLesson 
        ? filteredVocab.filter(item => 
            item.german_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.arabic_translation.includes(searchTerm)
          )
        : [];

    const handleRemoveWord = async (wordId: string) => {
        if (!confirm("Delete this word?")) return;
        const { error } = await supabase.from('words').delete().eq('id', wordId);
        if (error) alert("Error deleting.");
        else {
            const updated = allVocab.filter(item => item.id !== wordId);
            setAllVocab(updated);
       
            if (selectedLesson === 'all') setFilteredVocab(updated);
            else setFilteredVocab(updated.filter(item => item.lesson === selectedLesson));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* Header changes based on view */}
                <header className="flex items-center justify-between mb-8 border-b pb-4 border-gray-200 dark:border-zinc-800">
                    {selectedLesson === null ? (
                       
                        <Link href="/student/dashboard" passHref>
                            <Button variant="ghost" className="gap-2">
                                <ChevronLeft className="h-5 w-5" /> Dashboard
                            </Button>
                        </Link>
                    ) : (
        
                        <Button variant="ghost" onClick={() => setSelectedLesson(null)} className="gap-2">
                            <ChevronLeft className="h-5 w-5" /> All Lessons
                        </Button>
                    )}
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {selectedLesson === 'all' ? 'All Vocabulary 📚' : 
                         selectedLesson ? `Lektion ${selectedLesson} 📖` : 
                         'Select a Lesson 🎓'}
                    </h1>
                    <div className="w-[100px]"></div> 
                </header>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                {loading ? (
                    <div className="text-center py-20"><Loader2 className="animate-spin h-10 w-10 mx-auto text-blue-600"/></div>
                ) : (
                    <>
                        {/* VIEW 1: LESSON SELECTION GRID */}
                        {selectedLesson === null && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                {/* All Lessons Card */}
                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all border-l-4 border-indigo-500 hover:scale-[1.02]"
                                    onClick={() => handleSelectLesson('all')}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">All Lektionen</CardTitle>
                                            <CardDescription>View all {allVocab.length} words</CardDescription>
                                        </div>
                                        <LayoutGrid className="h-8 w-8 text-indigo-500" />
                                    </CardHeader>
                                </Card>

                                {/* Individual Lesson Cards */}
                                {lessons.map((lesson) => {
                                    const count = allVocab.filter(w => w.lesson === lesson).length;
                                    return (
                                        <Card 
                                            key={lesson} 
                                            className="cursor-pointer hover:shadow-xl transition-all border-l-4 border-blue-400 hover:scale-[1.02]"
                                            onClick={() => handleSelectLesson(lesson)}
                                        >
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-xl">Lektion {lesson}</CardTitle>
                                                    <CardDescription>{count} Words</CardDescription>
                                                </div>
                                                <BookOpen className="h-8 w-8 text-blue-400" />
                                            </CardHeader>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* VIEW 2: WORDS LIST FOR SELECTED LESSON */}
                        {selectedLesson !== null && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                
                                {/* Tools Section: Search + Practice */}
                                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm">
                                    <div className="relative w-full md:w-1/2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input 
                                            placeholder={`Search in ${selectedLesson === 'all' ? 'all lessons' : 'Lektion ' + selectedLesson}...`}
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    
                                    {/* Practice Button */}
                                    {selectedLesson !== 'all' && (
                                        <Link href={`/student/quiz?lesson=${selectedLesson}`}>
                                            <Button className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto">
                                                <Dumbbell className="mr-2 h-5 w-5" />
                                                Practice Lektion {selectedLesson}
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {/* Words Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayedVocab.length === 0 ? (
                                        <div className="col-span-3 text-center py-10 text-gray-500">
                                            No words found in this lesson yet.
                                        </div>
                                    ) : (
                                        displayedVocab.map((item) => (
                                            <Card key={item.id} className="shadow-md hover:shadow-lg dark:bg-zinc-900 border-l-4 border-blue-400">
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-2xl font-bold" dir="ltr">
                                                            {item.article || ''} {item.german_word}
                                                        </CardTitle>
                                                        <Button variant="ghost" size="icon" onClick={() => speakText(`${item.article || ''} ${item.german_word}`)} className="text-blue-600 rounded-full">
                                                            <Volume2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                    {/* إظهار رقم الدرس في الكارت لو احنا في وضع عرض الكل */}
                                                    {selectedLesson === 'all' && (
                                                        <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">Lektion {item.lesson}</span>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <p className="text-lg text-gray-700 dark:text-gray-300" dir="rtl">{item.arabic_translation}</p>
                                                    <p className="text-sm italic text-gray-500 pt-2 border-t">"{item.example_sentence || '...'}"</p>
                                                    
                                                    {currentUserId && item.user_id === currentUserId && (
                                                        <Button variant="destructive" size="sm" onClick={() => handleRemoveWord(item.id)} className="w-full mt-2 gap-2">
                                                            <Trash2 className="h-4 w-4" /> Remove
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
