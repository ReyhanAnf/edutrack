import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface QuizAttempt {
    id: number;
    score: number;
    total_questions: number;
    updated_at: string;
    user: {
        id: number;
        name: string;
        profile_photo_url: string;
    };
}

interface Props extends PageProps {
    quiz: {
        id: number;
        title: string;
    };
    attempts: QuizAttempt[];
}

export default function Attempts({ auth, quiz, attempts }: Props) {
    return (
        <AuthenticatedLayout header={`Daftar Peserta: ${quiz.title}`}>
            <Head title={`Daftar Peserta - ${quiz.title}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Peserta Kuis</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Melihat daftar peserta yang telah menyelesaikan kuis <strong>{quiz.title}</strong>
                        </p>
                    </div>
                    <Link 
                        href={route('quizzes.index')}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Kembali
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {attempts.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">group_off</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Belum Ada Peserta</h3>
                            <p className="text-gray-500 dark:text-gray-400">Belum ada peserta yang mengerjakan dan menyimpan nilai kuis ini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peserta</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu Selesai</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Skor Terakhir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {attempts.map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={attempt.user.profile_photo_url} 
                                                        alt={attempt.user.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                                    />
                                                    <span className="font-bold text-gray-900 dark:text-white">{attempt.user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(attempt.updated_at).toLocaleDateString('id-ID', { 
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <span className="text-xl font-black text-sky-500">
                                                        {Math.round((attempt.score / attempt.total_questions) * 100)}%
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-400">
                                                        ({attempt.score}/{attempt.total_questions})
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
