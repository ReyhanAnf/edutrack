import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description: string;
    is_public: boolean;
    created_at: string;
    user: { name: string };
    subject: { name: string, color_code: string };
}

interface Props extends PageProps {
    quizzes: Quiz[];
    subjects: { data: { id: number, name: string }[] };
}

export default function Index({ auth, quizzes, subjects }: Props) {
    const [generating, setGenerating] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    const generateQuiz = () => {
        if (!selectedSubject) return;
        
        setGenerating(true);
        window.axios.post(route('quizzes.generate'), {
            subject_id: selectedSubject,
            count: 5
        })
        .then(response => {
            if (response.data.success) {
                router.visit(route('quizzes.show', response.data.data.id));
            }
        })
        .catch(error => {
            alert(error.response?.data?.message || 'Gagal generate kuis. Pastikan Anda punya cukup catatan atau pertanyaan di mata pelajaran ini.');
        })
        .finally(() => {
            setGenerating(false);
        });
    };

    const togglePublic = (quizId: number) => {
        router.post(route('quizzes.toggle-public', quizId), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header="Kuis AI">
            <Head title="Kuis AI" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4">Generate Kuis Baru</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select 
                            className="flex-1 rounded-xl border-gray-300 dark:bg-gray-900 dark:border-gray-700"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={subjects.data.length === 0}
                        >
                            <option value="">{subjects.data.length === 0 ? 'Buat Mata Pelajaran terlebih dahulu...' : 'Pilih Mata Pelajaran...'}</option>
                            {subjects.data.map(subject => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={generateQuiz}
                            disabled={generating || !selectedSubject || subjects.data.length === 0}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">psychology</span>
                            {generating ? 'Sedang Generate...' : 'Buat Kuis AI'}
                        </button>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">AI akan membuat kuis berdasarkan catatan dan pertanyaan Anda pada mata pelajaran yang dipilih.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <span 
                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{ backgroundColor: `${quiz.subject.color_code}20`, color: quiz.subject.color_code }}
                                    >
                                        {quiz.subject.name}
                                    </span>
                                    {quiz.is_public && (
                                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                                            Publik
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{quiz.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{quiz.description}</p>
                                <div className="text-xs text-gray-500 mb-4">
                                    Dibuat oleh: <span className="font-medium">{quiz.user.name}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <Link 
                                    href={route('quizzes.show', quiz.id)}
                                    className="text-primary font-semibold text-sm hover:underline"
                                >
                                    Mulai Kuis
                                </Link>
                                {quiz.user.name === auth.user.name && (
                                    <button 
                                        onClick={() => togglePublic(quiz.id)}
                                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                                    >
                                        {quiz.is_public ? 'Jadikan Privat' : 'Bagikan ke Teman'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {quizzes.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 dark:bg-gray-800/50 dark:border-gray-700">
                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">quiz</span>
                        <p className="text-gray-500">Belum ada kuis. Ayo buat kuis pertamamu!</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
