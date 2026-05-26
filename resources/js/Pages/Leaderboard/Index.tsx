import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
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

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-500 p-6 sm:p-10 shadow-lg text-white">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl font-extrabold flex items-center justify-center md:justify-start gap-3">
                                <span className="material-symbols-outlined text-4xl sm:text-5xl text-yellow-300">trophy</span>
                                Hall of Fame
                            </h2>
                            <p className="mt-3 text-indigo-100 max-w-xl text-sm sm:text-base">
                                Bersaing dengan pelajar lainnya, peroleh XP tertinggi, dan raih gelar Grandmaster di mata pelajaran favoritmu!
                            </p>
                        </div>
                        <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 text-center w-full md:w-auto">
                            <p className="text-indigo-100 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">XP Anda</p>
                            <div className="text-3xl sm:text-4xl font-bold flex flex-wrap justify-center items-center gap-1">
                                {leaderboard.filter(l => l.user_id === auth.user.id).reduce((acc, curr) => acc + curr.xp, 0)}
                                <span className="text-lg text-yellow-300 material-symbols-outlined">bolt</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Top Rankers</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Peringkat 50 teratas dari seluruh pelajar</p>
                        </div>
                        
                        <div className="w-full sm:w-64 shrink-0 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">filter_list</span>
                            <select
                                value={filters.subject_id || ''}
                                onChange={handleSubjectChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 transition-colors"
                            >
                                <option value="">🏆 Semua Mata Pelajaran</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Leaderboard List */}
                    <div className="space-y-3">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">sports_score</span>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Belum Ada Peringkat</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Jadilah yang pertama untuk mencapai top rank!</p>
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => (
                                <div 
                                    key={entry.id}
                                    className={`flex items-center p-4 sm:p-5 rounded-2xl border transition-all ${
                                        entry.user_id === auth.user.id 
                                        ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800' 
                                        : 'bg-white border-gray-100 hover:border-indigo-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-center w-10 sm:w-14 shrink-0">
                                        {index === 0 ? (
                                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-yellow-400 drop-shadow-sm">social_leaderboard</span>
                                        ) : index === 1 ? (
                                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-gray-300 drop-shadow-sm">social_leaderboard</span>
                                        ) : index === 2 ? (
                                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-amber-600 drop-shadow-sm">social_leaderboard</span>
                                        ) : (
                                            <span className="text-lg sm:text-xl font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 px-2 sm:px-4">
                                        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 font-bold text-indigo-700 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-300 border border-white dark:border-gray-700 shadow-sm">
                                            {entry.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2 text-sm sm:text-base">
                                                {entry.user.name}
                                                {entry.user_id === auth.user.id && (
                                                    <span className="inline-flex text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold dark:bg-indigo-900/50 dark:text-indigo-300">YOU</span>
                                                )}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span 
                                                    className="inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold ring-1 ring-inset"
                                                    style={{ 
                                                        backgroundColor: `${entry.global_subject?.color_code || '#3b82f6'}15`,
                                                        color: entry.global_subject?.color_code || '#3b82f6',
                                                        borderColor: `${entry.global_subject?.color_code || '#3b82f6'}30`
                                                    }}
                                                >
                                                    {entry.global_subject?.name || 'Mata Pelajaran'}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset uppercase tracking-wider ${getTierColor(entry.tier)}`}>
                                                    <span className="material-symbols-outlined text-[12px]">{getTierIcon(entry.tier)}</span>
                                                    {entry.tier}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-center shrink-0">
                                        <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-lg sm:text-2xl text-gray-900 dark:text-gray-100">
                                            {entry.xp.toLocaleString()}
                                            <span className="material-symbols-outlined text-yellow-400 text-xl sm:text-2xl">bolt</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">XP Point</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
