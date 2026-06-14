import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ stats }: { stats: any }) {
    return (
        <AuthenticatedLayout header="Dasbor Admin">
            <Head title="Dasbor Admin" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                        <span className="material-symbols-outlined text-4xl text-primary mb-2">group</span>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Pengguna</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total_users}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                        <span className="material-symbols-outlined text-4xl text-green-500 mb-2">how_to_reg</span>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Pengguna Aktif</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.active_users}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                        <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">forum</span>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Diskusi</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total_questions}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                        <span className="material-symbols-outlined text-4xl text-purple-500 mb-2">psychology_alt</span>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Kuis AI</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total_quizzes}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
