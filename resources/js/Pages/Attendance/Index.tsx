import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useMemo } from 'react';
import ConfirmationModal from '@/Components/ConfirmationModal';

interface Subject {
    id: number;
    name: string;
    color_code: string;
}

interface Attendance {
    id: number;
    subject_id: number;
    subject?: Subject;
    date: string;
    status: 'Present' | 'Excused' | 'Absent';
    notes: string | null;
}

interface Mission {
    id: number;
    name: string;
    description: string;
    requirement: number;
    progress: number;
    points_reward: number;
    completed_at: string | null;
}

interface Props extends PageProps {
    attendances: {
        data: Attendance[];
    };
    activity_stats: Record<string, number>;
    missions: Mission[];
    current_streak: number;
    today_streak: {
        status: 'none' | 'half' | 'full';
        qna_done: boolean;
        quiz_done: boolean;
    } | null;
    pending_recovery: {
        id: number;
        recovery_type: 'half_missed' | 'full_missed';
        quizzes_required: number;
        quizzes_completed: number;
    } | null;
}

const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-emerald-400 dark:bg-emerald-500'; // Hijau untuk awal aktifitas
    if (count <= 5) return 'bg-sky-300 dark:bg-sky-400';
    if (count <= 9) return 'bg-primary dark:bg-sky-600';
    return 'bg-sky-800 dark:bg-sky-200'; // Biru tua untuk aktifitas tinggi
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
});

const parseDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        return new Date(year, month - 1, day);
    }
    return new Date(value);
};

export default function Index({ auth, attendances, activity_stats, missions, current_streak, today_streak, pending_recovery }: Props) {
    const { delete: destroy, processing } = useForm();
    const { post: postRecovery, processing: recovering } = useForm();
    const [isConfirming, setIsConfirming] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleRecovery = () => {
        postRecovery(route('attendances.recover-streak'));
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsConfirming(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('attendances.destroy', deleteId), {
                onSuccess: () => {
                    setIsConfirming(false);
                    setDeleteId(null);
                },
            });
        }
    };

    // Heatmap Logic
    const heatmapDays = useMemo(() => {
        const days = [];
        const today = new Date();
        // Show last 52 weeks (1 year) for full-width ala GitHub
        const startDate = new Date();
        startDate.setDate(today.getDate() - (52 * 7));
        // Align to Sunday
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const current = new Date(startDate);
        while (current <= today) {
            const dateStr = current.toISOString().split('T')[0];
            days.push({
                date: new Date(current),
                dateStr,
                count: activity_stats[dateStr] || 0
            });
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [activity_stats]);

    const weeks = useMemo(() => {
        const w = [];
        for (let i = 0; i < heatmapDays.length; i += 7) {
            w.push(heatmapDays.slice(i, i + 7));
        }
        return w;
    }, [heatmapDays]);

    const totalActivity = Object.values(activity_stats).reduce((a, b) => a + b, 0);

    return (
        <AuthenticatedLayout
            header="Statistik Aktivitas"
        >
            <Head title="Statistik Aktivitas" />

            <div className="w-full space-y-8">
                {/* Pending Recovery Alert */}
                {pending_recovery && (
                    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 dark:bg-rose-900/20 dark:border-rose-900 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-4xl text-rose-500">heart_broken</span>
                            <div>
                                <h3 className="text-rose-800 dark:text-rose-200 font-bold text-lg">Ups, Streak Kamu Putus!</h3>
                                <p className="text-rose-600 dark:text-rose-300 text-sm">
                                    Segera pulihkan streak kamu sebelum hangus! Kamu bisa membayar dengan Poin Streak atau kerjakan {pending_recovery.quizzes_required} Kuis.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <button 
                                onClick={handleRecovery}
                                disabled={recovering}
                                className="w-full bg-rose-600 text-white rounded-xl px-4 py-2 font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
                            >
                                Pulihkan dengan Poin
                            </button>
                            <div className="text-center text-xs text-rose-600 font-medium">
                                Atau {pending_recovery.quizzes_completed}/{pending_recovery.quizzes_required} Kuis Selesai
                            </div>
                        </div>
                    </div>
                )}

                {/* Gamification Streak Fire Dashboard */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-sky-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black mb-1 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                                Hari ke-{current_streak}!
                            </h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Terus pertahankan api belajarmu. Dapatkan 1000 XP setiap 5 hari beruntun!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                                    today_streak?.qna_done 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400' 
                                        : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'
                                }`}>
                                    <span className="material-symbols-outlined text-[18px]">
                                        {today_streak?.qna_done ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    Interaksi Forum
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                                    today_streak?.quiz_done 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400' 
                                        : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'
                                }`}>
                                    <span className="material-symbols-outlined text-[18px]">
                                        {today_streak?.quiz_done ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    Selesaikan Kuis
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl">
                            {[1, 2, 3, 4, 5].map((idx) => {
                                const isCurrentDay = current_streak % 5 === idx - 1;
                                const isPassed = current_streak % 5 > idx - 1;
                                
                                let fireIcon = 'local_fire_department';
                                let fireColor = 'text-gray-300 dark:text-gray-600'; // Default mati
                                let fireBg = 'bg-white dark:bg-gray-800';
                                
                                if (isPassed) {
                                    // Sudah full fire sebelumnya
                                    fireColor = 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]';
                                    fireBg = 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30';
                                } else if (isCurrentDay) {
                                    // Status hari ini
                                    if (today_streak?.status === 'full') {
                                        fireColor = 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]';
                                        fireBg = 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30';
                                    } else if (today_streak?.status === 'half') {
                                        fireColor = 'text-amber-400 opacity-90 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]';
                                        fireBg = 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30';
                                    } else {
                                        // Belum ada api hari ini tapi dia sedang aktif di frame ini
                                        fireBg = 'bg-white border-sky-200 dark:bg-gray-800 dark:border-sky-800/50 shadow-inner';
                                    }
                                }

                                return (
                                    <div key={idx} className="flex flex-col items-center gap-1">
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl border ${fireBg} ${isCurrentDay ? 'ring-2 ring-sky-200 dark:ring-sky-800/50 scale-110' : 'border-gray-100 dark:border-gray-700'}`}>
                                            <span className={`material-symbols-outlined text-3xl transition-all duration-300 ${fireColor}`}>
                                                {fireIcon}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-400">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Aktivitas</p>
                                <h3 className="text-2xl font-black">{totalActivity}</h3>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center dark:bg-sky-900/30 dark:text-sky-400">
                                <span className="material-symbols-outlined">calendar_today</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Catatan Kehadiran</p>
                                <h3 className="text-2xl font-black">{attendances.data.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Mode */}
                <div className="bg-gradient-to-br from-primary/10 to-sky-100/50 p-8 rounded-3xl border border-sky-100 dark:from-sky-900/20 dark:to-gray-800 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-primary">rocket_launch</span>
                        <h2 className="text-xl font-bold">Mode Misi Belajar</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {missions.map(mission => {
                            const progressPercent = Math.round((mission.progress / mission.requirement) * 100);
                            const isCompleted = !!mission.completed_at;

                            return (
                                <div key={mission.id} className={`p-6 rounded-2xl border transition-all ${
                                    isCompleted 
                                    ? 'bg-white/60 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' 
                                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100">{mission.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
                                        </div>
                                        {isCompleted && (
                                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                            <span className="text-gray-400">Progress</span>
                                            <span className={isCompleted ? 'text-emerald-500' : 'text-primary'}>
                                                {mission.progress} / {mission.requirement}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-900/30 w-fit px-2 py-1 rounded-md">
                                            <span className="material-symbols-outlined text-xs">monetization_on</span>
                                            Reward: +{mission.points_reward} XP
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-bold">Kalender Aktivitas Belajar</h2>
                            <p className="text-sm text-gray-500">Visualisasi konsistensi belajar Anda dalam 1 tahun terakhir</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Sedikit</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                                <div className="w-3 h-3 rounded-sm bg-sky-300" />
                                <div className="w-3 h-3 rounded-sm bg-primary" />
                                <div className="w-3 h-3 rounded-sm bg-sky-800" />
                            </div>
                            <span>Banyak</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="inline-flex gap-1.5 min-w-max">
                            <div className="grid grid-rows-7 gap-1.5 mr-2 text-[10px] font-bold text-gray-400 uppercase pt-6">
                                <div className="h-3 flex items-center">Sen</div>
                                <div className="h-3" />
                                <div className="h-3 flex items-center">Rab</div>
                                <div className="h-3" />
                                <div className="h-3 flex items-center">Jum</div>
                                <div className="h-3" />
                                <div className="h-3" />
                            </div>
                            
                            {weeks.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-1.5">
                                    {/* Month Label */}
                                    <div className="h-4 text-[10px] font-bold text-gray-400 uppercase mb-1">
                                        {week[0].date.getDate() <= 7 ? week[0].date.toLocaleString('id-ID', { month: 'short' }) : ''}
                                    </div>
                                    <div className="grid grid-rows-7 gap-1.5">
                                        {week.map((day, dIndex) => (
                                            <div
                                                key={dIndex}
                                                title={`${day.dateStr}: ${day.count} aktifitas`}
                                                className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-help ${getActivityColor(day.count)}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Attendance List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Riwayat Kehadiran
                        </h2>
                    </div>

                    {attendances.data.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {attendances.data.map((attendance) => {
                                const parsedDate = parseDate(attendance.date);
                                const subjectColor = attendance.subject?.color_code ?? '#cbd5e1';

                                return (
                                    <div
                                        key={attendance.id}
                                        className="bg-white rounded-3xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group relative"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{weekdayFormatter.format(parsedDate)}</span>
                                                <span className="text-xl font-black">{parsedDate.getDate()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
                                                    <p className="font-bold truncate">{attendance.subject?.name || 'Mata Pelajaran'}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-3">{dateFormatter.format(parsedDate)}</p>
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    attendance.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    attendance.status === 'Absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                    {attendance.status === 'Present' ? 'Hadir' : attendance.status === 'Absent' ? 'Alpa' : 'Izin'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={route('attendances.edit', attendance.id)} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:text-primary">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </Link>
                                            <button onClick={() => handleDelete(attendance.id)} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:text-rose-600">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-center">
                            <p className="text-gray-500">Belum ada riwayat kehadiran.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                show={isConfirming}
                title="Hapus Catatan"
                message="Yakin ingin menghapus catatan kehadiran ini?"
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirming(false)}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}
