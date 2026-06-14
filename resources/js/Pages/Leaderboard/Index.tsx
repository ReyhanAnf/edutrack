import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Subject {
    id: number;
    name: string;
    color_code: string;
}

interface LeaderboardEntry {
    id: number;
    user_id: number;
    global_subject_id: number;
    xp: number;
    tier: string;
    user: {
        id: number;
        name: string;
        profile_photo_url: string;
    };
    global_subject: Subject;
}

interface Props extends PageProps {
    leaderboard: LeaderboardEntry[];
    subjects: Subject[];
    filters: {
        subject_id?: string;
    };
}

export default function Leaderboard({ auth, leaderboard, subjects, filters }: Props) {
    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subjectId = e.target.value;
        if (subjectId) {
            router.get(route('leaderboard.index'), { subject_id: subjectId }, { preserveState: true });
        } else {
            router.get(route('leaderboard.index'), {}, { preserveState: true });
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier.toLowerCase()) {
            case 'grandmaster': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 ring-purple-200 dark:ring-purple-800/50';
            case 'master': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-blue-200 dark:ring-blue-800/50';
            case 'expert': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 ring-orange-200 dark:ring-orange-800/50';
            case 'apprentice': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-green-200 dark:ring-green-800/50';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 ring-gray-200 dark:ring-gray-700';
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier.toLowerCase()) {
            case 'grandmaster': return 'workspace_premium';
            case 'master': return 'military_tech';
            case 'expert': return 'verified';
            case 'apprentice': return 'school';
            default: return 'hotel_class';
        }
    };

    return (
        <AuthenticatedLayout header="Leaderboard">
            <Head title="Leaderboard" />

            <div className="mx-auto max-w-4xl space-y-4 pb-28">
                {/* Clean & Compact Hero Section */}
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 bg-indigo-600 dark:bg-indigo-900 p-5 sm:p-6 rounded-xl shadow-sm text-white overflow-hidden">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm shrink-0">
                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-yellow-300">trophy</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl sm:text-2xl font-bold truncate">Hall of Fame</h2>
                            <p className="text-indigo-100 text-xs sm:text-sm mt-0.5 line-clamp-1">Peringkat XP tertinggi dari seluruh pelajar.</p>
                        </div>
                    </div>
                    <div className="bg-white/10 px-4 py-2 sm:px-5 sm:py-3 rounded-lg backdrop-blur-sm border border-white/10 text-center sm:text-right shrink-0 w-full sm:w-auto min-w-[140px]">
                        <p className="text-indigo-200 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5">Total XP Anda</p>
                        <div className="text-xl sm:text-2xl font-bold flex items-center justify-center sm:justify-end gap-1">
                            {leaderboard.filter(l => l.user_id === auth.user.id).reduce((acc, curr) => acc + curr.xp, 0).toLocaleString()}
                            <span className="text-yellow-300 material-symbols-outlined text-lg sm:text-xl">bolt</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 mt-6">
                    {/* Controls (Tabs) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1 sm:px-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Top Rankers</h3>
                        </div>
                        
                        <div className="w-full overflow-x-auto hide-scrollbar border-b border-gray-200 dark:border-gray-700" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <div className="flex w-max px-1 sm:px-2">
                                <button
                                    onClick={() => router.get(route('leaderboard.index'), {}, { preserveState: true })}
                                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                                        !filters.subject_id 
                                        ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    🏆 Semua Kategori
                                </button>
                                {subjects.map((subject) => {
                                    const isActive = filters.subject_id == subject.id.toString();
                                    return (
                                        <button
                                            key={subject.id}
                                            onClick={() => router.get(route('leaderboard.index'), { subject_id: subject.id }, { preserveState: true })}
                                            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                                                isActive
                                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            <span 
                                                className="inline-block w-2 h-2 rounded-full"
                                                style={{ backgroundColor: subject.color_code }}
                                            ></span>
                                            {subject.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Compact List Section */}
                    <div className="space-y-2">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-600 mb-2">sports_score</span>
                                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Belum Ada Peringkat</h3>
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => {
                                const isFirst = index === 0;
                                const isSecond = index === 1;
                                const isThird = index === 2;
                                const isTop3 = isFirst || isSecond || isThird;
                                
                                let bgClass = entry.user_id === auth.user.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' 
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50';

                                if (isFirst && entry.user_id !== auth.user.id) bgClass = 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/30';
                                else if (isSecond && entry.user_id !== auth.user.id) bgClass = 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50';
                                else if (isThird && entry.user_id !== auth.user.id) bgClass = 'bg-orange-50/30 dark:bg-orange-900/10 border-orange-200/50 dark:border-orange-800/30';

                                return (
                                    <div 
                                        key={entry.id}
                                        className={`flex items-center p-3 rounded-lg border ${bgClass}`}
                                    >
                                        <div className="flex items-center justify-center w-10 shrink-0">
                                            {isFirst ? (
                                                <span className="material-symbols-outlined text-2xl text-yellow-500">workspace_premium</span>
                                            ) : isSecond ? (
                                                <span className="material-symbols-outlined text-2xl text-slate-400">military_tech</span>
                                            ) : isThird ? (
                                                <span className="material-symbols-outlined text-2xl text-orange-400">military_tech</span>
                                            ) : (
                                                <span className="text-sm font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 flex-1 min-w-0 px-2 sm:px-4 border-l border-gray-100 dark:border-gray-700 ml-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Link 
                                                        href={route('users.show', entry.user.id)}
                                                        className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate hover:text-primary transition-colors"
                                                    >
                                                        {entry.user.name}
                                                    </Link>
                                                    {entry.user_id === auth.user.id && (
                                                        <span className="shrink-0 text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold">YOU</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                    <span 
                                                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                                                        style={{ 
                                                            backgroundColor: `${entry.global_subject?.color_code || '#3b82f6'}15`,
                                                            color: entry.global_subject?.color_code || '#3b82f6'
                                                        }}
                                                    >
                                                        <span className="truncate max-w-[120px]">{entry.global_subject?.name || 'Mata Pelajaran'}</span>
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${getTierColor(entry.tier)} border-none ring-0`}>
                                                        <span className="material-symbols-outlined text-[10px]">{getTierIcon(entry.tier)}</span>
                                                        {entry.tier}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end shrink-0 ml-2 min-w-[80px]">
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-0.5 font-bold text-base text-gray-900 dark:text-gray-100">
                                                    {entry.xp.toLocaleString()}
                                                    <span className="material-symbols-outlined text-yellow-400 text-lg">bolt</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
