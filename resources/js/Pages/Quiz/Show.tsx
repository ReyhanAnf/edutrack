import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

interface Question {
    id: number;
    question_text: string;
    options: string[];
    correct_answer_index: number;
    explanation?: string;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    subject: { name: string, color_code: string };
    questions: Question[];
}

interface Props extends PageProps {
    quiz: Quiz;
}

export default function Show({ quiz }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const questions = quiz.questions;
    const currentQuestion = questions[currentStep];

    const handleAnswer = (index: number) => {
        if (isSubmitted) return;
        setSelectedOption(index);
    };

    const submitAnswer = () => {
        if (selectedOption === null) return;
        
        const correct = selectedOption === currentQuestion.correct_answer_index;
        if (correct) setScore(score + 1);
        
        setIsSubmitted(true);
    };

    const nextQuestion = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        } else {
            // Hit backend to mark quiz as finished for gamification streak
            axios.post(route('quizzes.finish', quiz.id)).catch(err => console.error(err));
            setShowResults(true);
        }
    };

    if (showResults) {
        return (
            <AuthenticatedLayout header="Hasil Kuis">
                <Head title="Hasil Kuis" />
                <div className="mx-auto max-w-2xl text-center space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <span className="material-symbols-outlined text-6xl text-yellow-500 mb-4">emoji_events</span>
                        <h2 className="text-2xl font-bold mb-2">Kuis Selesai!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Kamu berhasil menyelesaikan {quiz.title}</p>
                        
                        <div className="text-5xl font-black text-primary mb-2">
                            {Math.round((score / questions.length) * 100)}%
                        </div>
                        <p className="text-lg font-medium">Skor: {score} / {questions.length}</p>

                        <div className="mt-8 flex gap-4 justify-center">
                            <Link 
                                href={route('quizzes.index')}
                                className="px-6 py-2 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Kembali
                            </Link>
                            <button 
                                onClick={() => {
                                    setCurrentStep(0);
                                    setScore(0);
                                    setShowResults(false);
                                    setIsSubmitted(false);
                                    setSelectedOption(null);
                                }}
                                className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors"
                            >
                                Ulangi Kuis
                            </button>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={quiz.title}>
            <Head title={quiz.title} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                         <span 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: quiz.subject.color_code }}
                        />
                        <span className="text-sm font-medium text-gray-500">{quiz.subject.name}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-500">
                        Pertanyaan {currentStep + 1} dari {questions.length}
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-8">{currentQuestion.question_text}</h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            let optionClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                            
                            if (isSubmitted) {
                                if (index === currentQuestion.correct_answer_index) {
                                    optionClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                                } else if (index === selectedOption) {
                                    optionClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                                } else {
                                    optionClass += "border-gray-100 dark:border-gray-700 opacity-50";
                                }
                            } else {
                                if (index === selectedOption) {
                                    optionClass += "border-primary bg-sky-50 dark:bg-sky-900/20 text-primary";
                                } else {
                                    optionClass += "border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={isSubmitted}
                                    className={optionClass}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-bold">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        {option}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {isSubmitted && (
                        <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                            <h4 className="font-bold mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Penjelasan:
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{currentQuestion.explanation || 'Tidak ada penjelasan tambahan.'}</p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        {!isSubmitted ? (
                            <button
                                onClick={submitAnswer}
                                disabled={selectedOption === null}
                                className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-sky-600 transition-colors disabled:opacity-50"
                            >
                                Periksa Jawaban
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-sky-600 transition-colors flex items-center gap-2"
                            >
                                {currentStep < questions.length - 1 ? 'Pertanyaan Berikutnya' : 'Lihat Hasil'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
