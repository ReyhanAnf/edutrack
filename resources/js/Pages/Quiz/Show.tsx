import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

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
    const [showSavePrompt, setShowSavePrompt] = useState(false);
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
            setShowSavePrompt(true);
        }
    };

    const handleSavePrompt = (save: boolean) => {
        window.axios.post(route('quizzes.finish', quiz.id), {
            save_score: save,
            score: score,
            total_questions: questions.length
        }).catch(err => console.error(err));
        
        setShowSavePrompt(false);
        setShowResults(true);
    };

    if (showSavePrompt) {
        return (
            <AuthenticatedLayout header="Simpan Hasil Kuis">
                <Head title="Simpan Hasil" />
                <div className="mx-auto max-w-xl mt-12 text-center space-y-6 px-4">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                        <span className="material-symbols-outlined text-6xl text-sky-500 mb-4">save</span>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Simpan Hasil Kuis?</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Apakah Anda ingin menyimpan skor ini ke dalam Menu Nilai Anda sebagai bahan evaluasi?
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => handleSavePrompt(false)}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Tidak, Lewati Saja
                            </button>
                            <button 
                                onClick={() => handleSavePrompt(true)}
                                className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 shadow-sm transition-colors"
                            >
                                Ya, Simpan Skor
                            </button>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (showResults) {
        return (
            <AuthenticatedLayout header="Hasil Kuis">
                <Head title="Hasil Kuis" />
                <div className="mx-auto max-w-2xl mt-8 text-center space-y-6 px-4">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <span className="material-symbols-outlined text-6xl text-yellow-500 mb-4">emoji_events</span>
                        <h2 className="text-2xl font-bold mb-2">Kuis Selesai!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Kamu berhasil menyelesaikan {quiz.title}</p>
                        
                        <div className="text-5xl font-black text-sky-500 mb-2">
                            {Math.round((score / questions.length) * 100)}%
                        </div>
                        <p className="text-lg font-medium">Skor: {score} / {questions.length}</p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href={route('quizzes.index')}
                                className="px-6 py-2.5 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            >
                                Kembali ke Daftar Kuis
                            </Link>
                            <Link 
                                href={route('quizzes.my-scores')}
                                className="px-6 py-2.5 bg-sky-50 text-sky-600 rounded-xl font-semibold border border-sky-200 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800 dark:hover:bg-sky-900/50 transition-colors"
                            >
                                Lihat Menu Nilai
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={quiz.title}>
            <Head title={quiz.title} />

            <div className="mx-auto max-w-3xl space-y-6 px-4">
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
                        className="bg-sky-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
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
                                    optionClass += "border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400";
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
                                <span className="material-symbols-outlined text-sm text-sky-500">info</span>
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
                                className="px-8 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors disabled:opacity-50"
                            >
                                Periksa Jawaban
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="px-8 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors flex items-center gap-2"
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
