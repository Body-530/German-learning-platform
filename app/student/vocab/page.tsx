"use client";

import { ChevronLeft, Volume2, Search, ArrowRight, Loader2, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface VocabularyItem {
  id: string;
  user_id: string | null;
  german_word: string;
  arabic_translation: string;
  article: string | null;
  example_sentence: string | null;
  mastery_level: number | null;
}

// ✅ Web Speech API (مجاني ومباشر)
const speakText = (text: string) => {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(voice => 
    voice.lang.startsWith('de-DE') || voice.lang.startsWith('de')
  );
  
  if (germanVoice) {
    utterance.voice = germanVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export default function StudentVocabPage() {
    const [vocabItems, setVocabItems] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchVocab = async () => {
            setLoading(true);
            setError(null);

            // التحقق من المستخدم دون إجبار
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                setCurrentUserId(user.id);
            }

            // بناء الاستعلام
            let query = supabase
                .from('words')
                .select('*')
                .order('created_at', { ascending: false });

            if (user) {
                query = query.or(`user_id.eq.${user.id},user_id.is.null`);
            } else {
                query = query.is('user_id', null);
            }

            const { data, error: dbError } = await query;

            if (dbError) {
                console.error("Supabase Vocab Fetch Error:", dbError);
                setError("Failed to load vocabulary.");
            } else if (data) {
                setVocabItems(data as VocabularyItem[]);
            }
            setLoading(false);
        };

        fetchVocab();
    }, []);

    const handleRemoveWord = async (wordId: string) => {
        if (!confirm("Are you sure you want to remove this word?")) return;
        
        const { error } = await supabase
            .from('words')
            .delete()
            .eq('id', wordId); 

        if (error) {
            alert("Failed to delete. You can only delete your own words.");
        } else {
            setVocabItems(vocabItems.filter(item => item.id !== wordId));
        }
    };

    const filteredVocab = vocabItems.filter(item => 
        item.german_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.arabic_translation.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                
                <header className="flex items-center justify-between mb-8 border-b pb-4 border-gray-200 dark:border-zinc-800">
                    <Link href="/student/dashboard" passHref>
                        <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 gap-2">
                            <ChevronLeft className="h-5 w-5" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        My Vocabulary 📚
                    </h1>
                    <div className="w-[150px]"></div>
                </header>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                            type="text" 
                            placeholder="Search German or Arabic word..." 
                            className="w-full pl-10 py-3 border-blue-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-3 text-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                            <p className="mt-2 text-gray-500">Loading vocabulary...</p>
                        </div>
                    ) : filteredVocab.length === 0 ? (
                        <div className="col-span-3 text-center py-10">
                            <p className="text-lg text-gray-500">No words found.</p>
                        </div>
                    ) : (
                        filteredVocab.map((item) => (
                            <Card key={item.id} className="shadow-md hover:shadow-lg transition-shadow dark:bg-zinc-900 border-l-4 border-blue-400 relative">
                                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white" dir="ltr">
                                            {item.article || ''} {item.german_word} 
                                        </CardTitle>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => speakText(`${item.article || ''} ${item.german_word}`)} 
                                            className="text-blue-600 rounded-full hover:bg-blue-50"
                                            title="استمع للنطق"
                                        >
                                            <Volume2 className="h-6 w-6" />
                                        </Button>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {item.mastery_level === 0 || !item.mastery_level ? 'New' : item.mastery_level}
                                    </span>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 space-y-3">
                                    <p className="text-lg text-gray-700 dark:text-gray-300" dir="rtl">{item.arabic_translation}</p>
                                    <p className="text-sm italic text-gray-500 border-t pt-2 mt-2">
                                        Example: "{item.example_sentence || 'No example'}"
                                    </p>
                                    
                                    {currentUserId && item.user_id === currentUserId && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveWord(item.id)}
                                            className="mt-2 text-xs gap-1 w-full"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove My Word
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 text-center">
                    <p className="text-lg text-gray-600 mb-4">Ready for a Quiz?</p>
                    <Link href="/student/quiz" passHref>
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-lg shadow-lg">
                            Start Timed Quiz
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
}