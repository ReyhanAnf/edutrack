import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

interface Schedule {
    id: number;
    start_time: string;
    subject: {
        name: string;
    };
}

interface Props {
    avgGrade: number;
    pendingAssignments: number;
    todaysSchedule: Schedule[];
}

export default function Dashboard({ avgGrade, pendingAssignments, todaysSchedule }: Props) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-sky-500 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Selamat datang kembali, {auth.user.name}!</h2>
                    <p className="text-sky-100 text-lg max-w-xl">
                        Hanya mereka yang terus melangkah maju yang akan mencapai garis finish. Teruslah belajar dan berkembang!
                    </p>
                    <Link
                        href={route('notes.create')}
                        className="inline-flex items-center gap-2 mt-6 bg-white text-sky-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-sky-50 transition-colors"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Buat Catatan Baru
                    </Link>
                </div>
                {/* Decorative Circle */}
                <div className="absolute right-0 top-0 h-64 w-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Avg Grade */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rata-rata Nilai</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgGrade.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">grade</span>
                    </div>
                </div>

                {/* Pending Assignments */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tugas Belum Selesai</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pendingAssignments}</h3>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <span className="material-symbols-outlined">assignment_late</span>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jadwal Hari Ini</p>
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">calendar_today</span>
                    </div>
                    {todaysSchedule.length > 0 ? (
                        <div className="space-y-2 mt-2">
                            {todaysSchedule.slice(0, 2).map((schedule) => (
                                <div key={schedule.id} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {schedule.start_time.substring(0, 5)}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 truncate">{schedule.subject.name}</span>
                                </div>
                            ))}
                            {todaysSchedule.length > 2 && (
                                <p className="text-xs text-gray-400">+{todaysSchedule.length - 2} lainnya</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 mt-2">Tidak ada kelas hari ini</p>
                    )}
                </div>
            </div>

            {/* AI Widget Area */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Asisten Belajar AI</h3>
                <div id="ai-widget" className="mt-8 p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl mb-3 text-sky-300 dark:text-sky-900">smart_toy</span>
                        <p className="text-lg">Memuat Widget AI...</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Siap untuk integrasi fitur AI</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
