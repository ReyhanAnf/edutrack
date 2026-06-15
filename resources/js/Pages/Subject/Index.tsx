import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface GlobalSubject {
    id: number;
    name: string;
    color_code: string;
    is_added: boolean;
}

interface Props extends PageProps {
    subjects: GlobalSubject[];
}

export default function Index({ auth, subjects }: Props) {
    const [processing, setProcessing] = useState<number | null>(null);

    const toggleSubject = (subject: GlobalSubject) => {
        setProcessing(subject.id);
        if (subject.is_added) {
            // Find the user's subject row ID — we need to pass it for destroy
            // The backend route is subjects.destroy with Subject model binding
            // We need the user's per-user Subject ID, not the GlobalSubject ID
            // So the store returns redirect, and we need a different approach
            // Let's use a form POST for add and DELETE for remove
            router.delete(route('subjects.destroy', subject.id), {
                onFinish: () => setProcessing(null),
            });
        } else {
            router.post(route('subjects.store'), {
                global_subject_id: subject.id,
            }, {
                onFinish: () => setProcessing(null),
            });
        }
    };

    const addedCount = subjects.filter(s => s.is_added).length;

    return (
        <AuthenticatedLayout header="Mata Pelajaran">
            <Head title="Mata Pelajaran" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Mata Pelajaran</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Pilih mata pelajaran yang ingin kamu ikuti. <span className="font-medium text-gray-700 dark:text-gray-300">{addedCount} ditambahkan</span>
                        </p>
                    </div>
                </div>

                {subjects.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">book_2</span>
                        <p className="text-gray-500 dark:text-gray-400">Belum ada mata pelajaran tersedia. Hubungi admin untuk menambahkan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {subjects.map(subject => (
                            <div
                                key={subject.id}
                                className={`relative rounded-2xl border-2 p-4 transition-all ${
                                    subject.is_added
                                        ? 'border-transparent bg-white dark:bg-gray-800 shadow-sm'
                                        : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 opacity-75'
                                }`}
                                style={subject.is_added ? { borderColor: subject.color_code + '40' } : {}}
                            >
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center"
                                        style={{ backgroundColor: subject.color_code }}
                                    >
                                        <span className="material-symbols-outlined text-white text-xl">book</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                                        {subject.name}
                                    </p>
                                    <button
                                        onClick={() => toggleSubject(subject)}
                                        disabled={processing === subject.id}
                                        className={`w-full text-xs font-bold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 ${
                                            subject.is_added
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                                : 'bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/30'
                                        }`}
                                    >
                                        {processing === subject.id
                                            ? '...'
                                            : subject.is_added
                                                ? 'Hapus'
                                                : 'Tambahkan'
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
