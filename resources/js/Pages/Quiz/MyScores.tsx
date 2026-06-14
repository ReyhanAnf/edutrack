import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface QuizAttempt {
    id: number;
    score: number;
    total_questions: number;
    updated_at: string;
    quiz: {
        id: number;
        title: string;
        subject: {
            name: string;
            color_code: string;
        };
        user: {
            name: string;
        };
    };
}

interface Props extends PageProps {
    attempts: QuizAttempt[];
}

export default function MyScores({ auth, attempts }: Props) {
    return (
        <AuthenticatedLayout header="Menu Nilai">
            <Head title="Menu Nilai Kuis" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-sky-500 text-3xl">military_tech</span>
                            Menu Nilai Kuis
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Evaluasi performa belajar Anda dari kuis-kuis yang telah dikerjakan.
                        </p>
                    </div>
                </div>

                {attempts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center py-16 px-4">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">sentiment_dissatisfied</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Belum Ada Nilai Kuis</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Anda belum mengerjakan atau menyimpan nilai kuis apa pun.</p>
                        <Link 
                            href={route('quizzes.index')}
                            className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 shadow-sm transition-colors"
                        >
                            Mulai Latihan Kuis
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attempts.map((attempt) => (
                            <div 
                                key={attempt.id} 
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span 
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                                        style={{ 
                                            backgroundColor: `${attempt.quiz.subject.color_code}20`,
                                            color: attempt.quiz.subject.color_code 
                                        }}
                                    >
                                        <span 
                                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                                            style={{ backgroundColor: attempt.quiz.subject.color_code }}
                                        />
                                        {attempt.quiz.subject.name}
                                    </span>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                        {new Date(attempt.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
                                    {attempt.quiz.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    Dibuat oleh {attempt.quiz.user.name}
                                </p>

                                <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl font-black text-sky-500">
                                            {Math.round((attempt.score / attempt.total_questions) * 100)}<span className="text-xl">%</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Skor: {attempt.score}/{attempt.total_questions}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
