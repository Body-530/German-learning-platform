"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle, Clock, RotateCcw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';


interface VocabularyItem {
    id: string;
    german_word: string;
    arabic_translation: string;
}

interface QuizResult {
    score: number;
    totalQuestions: number;
    incorrectWords: { word: string; correct: string; user: string }[];
}

const MAX_QUESTIONS = 10;
const TIME_PER_QUESTION = 5; // ⏳ 5 seconds only

export default function TimedQuizPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonParam = searchParams.get("lesson");
    const [quizWords, setQuizWords] = useState<VocabularyItem[]>([]);
    const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [choices, setChoices] = useState<string[]>([]);
    const [timer, setTimer] = useState(TIME_PER_QUESTION);
    const [isFinished, setIsFinished] = useState(false);
    const [answered, setAnswered] = useState(false);

    const [result, setResult] = useState<QuizResult>({
        score: 0,
        totalQuestions: MAX_QUESTIONS,
        incorrectWords: []
    });

    const currentWord = quizWords[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === MAX_QUESTIONS - 1;

    // ==========================
    // 🔵 Authentication + Fetch
    // ==========================
    useEffect(() => {
        const checkAuthAndFetchWords = async () => {
            setLoading(true);

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                router.replace('/login');
                return;
            }

            setUserId(user.id);

             let query = supabase
            .from('words')
            .select('id, german_word, arabic_translation')
            .or(`user_id.eq.${user.id},user_id.is.null`);
            
            if (lessonParam) {
                query = query.eq('lesson', lessonParam);
            }

            const { data, error } = await query;

            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }

            if (data && data.length >= 4) {
                setAllWords(data);

                const shuffled = [...data].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, Math.min(MAX_QUESTIONS, data.length));

                setQuizWords(selected);
            }

            setLoading(false);
        };

        checkAuthAndFetchWords();
    }, []);


    // ==========================
    // 🔵 Generate choices
    // ==========================
    useEffect(() => {
        if (!currentWord || allWords.length < 4) return;

        const correct = currentWord.arabic_translation;

        const wrong = allWords
            .filter(w => w.id !== currentWord.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.arabic_translation);

        const all = [correct, ...wrong].sort(() => 0.5 - Math.random());

        setChoices(all);
    }, [currentWord, allWords]);


    // ==========================
    // 🔵 Save progress
    // ==========================
    const saveQuizProgress = useCallback(async (finalResult: QuizResult) => {
        if (!userId) return;

        await supabase.from('progress').insert([
            {
                user_id: userId,
                quiz_type: 'Timed Vocabulary',
                score: finalResult.score,
                total_questions: finalResult.totalQuestions,
                incorrect_words: finalResult.incorrectWords,
            },
        ]);
    }, [userId]);


    // ==========================
    // 🔵 Handle Answer
    // ==========================
    const handleAnswer = useCallback((submitted: string, isTimeout: boolean) => {
        if (answered || isFinished || !currentWord) return;

        setAnswered(true);

        const correct = currentWord.arabic_translation.trim();
        const userAnswer = submitted.trim();
        const isCorrect = userAnswer === correct && !isTimeout;

        const updatedScore = isCorrect ? result.score + 1 : result.score;

        let incorrect = [...result.incorrectWords];
        if (!isCorrect) {
            incorrect.push({
                word: currentWord.german_word,
                correct: currentWord.arabic_translation,
                user: submitted || "No Answer (Timeout)"
            });
        }

        const updatedResult = {
            score: updatedScore,
            totalQuestions: MAX_QUESTIONS,
            incorrectWords: incorrect
        };

        setResult(updatedResult);

        setTimeout(() => {
            if (isLastQuestion) {
                setIsFinished(true);
                saveQuizProgress(updatedResult);
            } else {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setAnswered(false);
                setTimer(TIME_PER_QUESTION);
            }
        }, 1500);

    }, [answered, isFinished, currentWord, result, isLastQuestion, saveQuizProgress]);


    // ==========================
    // ⏳ Timer countdown
    // ==========================
    useEffect(() => {
        if (loading || isFinished || answered) return;

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    handleAnswer("", true);
                    return TIME_PER_QUESTION;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [loading, isFinished, answered, handleAnswer]);

    // ==========================
    // 🔵 Loading Screen
    // ==========================
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading Quiz...</p>
                </div>
            </div>
        );
    }

    // ==========================
    // ❗ Not enough words
    // ==========================
    if (quizWords.length === 0 || allWords.length < 4) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <Card className="max-w-md w-full text-center shadow-lg">
                    <CardHeader><CardTitle>Not Enough Words</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            You need at least 4 words in your vocabulary to start a quiz.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/student/vocab" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                Add More Words
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ==========================
    // 🎉 Final Result Screen
    // ==========================
    if (isFinished) {
        const percentage = Math.round((result.score / result.totalQuestions) * 100);

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <Card className="max-w-2xl w-full shadow-2xl">
                    <CardHeader className="text-center">
                        <CheckCircle
                            className={`h-16 w-16 mx-auto mb-4 ${
                                percentage >= 70 ? 'text-green-500' : 'text-yellow-500'
                            }`}
                        />
                        <CardTitle className="text-4xl">Quiz Completed!</CardTitle>
                        <p className="text-xl mt-2 text-gray-600">Score: {percentage}%</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                {result.score} / {result.totalQuestions}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Correct Answers</p>
                        </div>

                        {/* Mistakes List */}
                        {result.incorrectWords.length > 0 && (
                            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <h3 className="font-bold text-red-600 dark:text-red-300 mb-4 text-lg">
                                    Review Mistakes:
                                </h3>
                                <div className="space-y-3">
                                    {result.incorrectWords.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-red-500"
                                        >
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                {item.word}
                                            </p>
                                            <p className="text-green-600 mt-1">
                                                ✓ Correct: {item.correct}
                                            </p>
                                            <p className="text-red-600 text-sm">
                                                ✗ Your answer: {item.user}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.incorrectWords.length === 0 && (
                            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                <p className="text-xl text-green-600 font-bold">
                                    🎉 Perfect Score! 🎉
                                </p>
                                <p className="text-gray-600 mt-2">
                                    You got all answers correct!
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex gap-4">
                        <Link href="/student/dashboard" className="flex-1">
                            <Button variant="outline" className="w-full">
                                <ChevronLeft className="h-4 w-4 mr-2" /> Dashboard
                            </Button>
                        </Link>

                        <Button
                            onClick={() => window.location.reload()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" /> New Quiz
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ==========================
    // 🧩 Active Quiz Screen
    // ==========================
    const questionNumber = currentQuestionIndex + 1;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
            <Card className="max-w-2xl w-full shadow-2xl border-t-4 border-blue-500">

                {/* ---------------- Header ---------------- */}
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">

                        {/* 🟦 Question Count */}
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full">
                            Question {questionNumber} / {MAX_QUESTIONS}
                        </span>

                        {/* 🔵 Circular Timer */}
                        <div className="relative flex items-center justify-center w-14 h-14">
                            <svg className="absolute inset-0 w-full h-full">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="25"
                                    className="stroke-gray-300"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="25"
                                    className="stroke-blue-500 transition-all duration-500"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray="157"
                                    strokeDashoffset={(timer / TIME_PER_QUESTION) * 157}
                                    strokeLinecap="round"
                                />
                            </svg>

                            <span className={`text-lg font-bold ${timer <= 2 ? "text-red-500 animate-pulse" : "text-gray-700"}`}>
                                {timer}
                            </span>
                        </div>
                    </div>

                    {/* German Word */}
                    <CardTitle className="text-5xl font-extrabold text-center text-gray-900 dark:text-white mt-6" dir="ltr">
                        {currentWord.german_word}
                    </CardTitle>

                    <p className="text-center text-gray-500 mt-3 text-lg">
                        Choose the correct Arabic meaning:
                    </p>
                </CardHeader>

                {/* ---------------- Choices Grid (2×2) ---------------- */}
                <CardContent className="grid grid-cols-2 gap-4 mt-6">

                    {choices.map((choice, index) => {
                        const isSelected = selectedAnswer === choice;
                        const isCorrect = choice === currentWord.arabic_translation;
                        const showResult = answered;

                        let buttonStyle =
                            "bg-white hover:bg-gray-50 border-2 border-gray-300 shadow-sm";

                        if (showResult) {
                            if (isCorrect) buttonStyle = "bg-green-100 border-green-500 border-2";
                            else if (isSelected) buttonStyle = "bg-red-100 border-red-500 border-2";
                        } else if (isSelected) {
                            buttonStyle = "bg-blue-100 border-blue-500 border-2";
                        }

                        return (
                            <Button
                                key={index}
                                onClick={() => {
                                    if (answered) return;
                                    setSelectedAnswer(choice);
                                    handleAnswer(choice, false);
                                }}
                                disabled={answered}
                                className={`text-xl py-6 ${buttonStyle} text-gray-800 dark:text-gray-900 transition-all duration-200 rounded-xl`}
                                dir="rtl"
                            >
                                {choice}
                                {showResult && isCorrect && " ✓"}
                                {showResult && isSelected && !isCorrect && " ✗"}
                            </Button>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
