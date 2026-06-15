import { usePage, Link } from '@inertiajs/react';

const tierColors: Record<string, string> = {
    Grandmaster: 'text-purple-500',
    Master: 'text-blue-500',
    Expert: 'text-orange-500',
    Apprentice: 'text-green-500',
    Novice: 'text-gray-400',
};

const tierIcons: Record<string, string> = {
    Grandmaster: 'workspace_premium',
    Master: 'military_tech',
    Expert: 'verified',
    Apprentice: 'school',
    Novice: 'hotel_class',
};

export default function GamificationWidget() {
    const { gamification } = usePage().props as any;
    if (!gamification) return null;

    const { total_xp, highest_tier, current_streak, today_streak_status } = gamification;
    const isOnStreak = current_streak > 0;
    const todayDone = today_streak_status === 'full';

    return (
        <Link
            href={route('leaderboard.index')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/60 transition-colors"
        >
            {/* Streak */}
            <div className="flex items-center gap-0.5">
                <span
                    className={`material-symbols-outlined text-base ${
                        todayDone
                            ? 'text-orange-500'
                            : isOnStreak
                            ? 'text-orange-400'
                            : 'text-gray-400 dark:text-gray-500'
                    }`}
                    style={{ fontVariationSettings: todayDone ? "'FILL' 1" : undefined }}
                >
                    local_fire_department
                </span>
                <span className={`text-xs font-bold tabular-nums ${isOnStreak ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {current_streak}
                </span>
            </div>

            {/* Divider */}
            <div className="w-px h-3.5 bg-gray-300 dark:bg-gray-600" />

            {/* XP + Tier */}
            <div className="flex items-center gap-1">
                <span className={`material-symbols-outlined text-sm ${tierColors[highest_tier] || 'text-gray-400'}`}>
                    {tierIcons[highest_tier] || 'hotel_class'}
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 tabular-nums">
                    {total_xp.toLocaleString()}
                </span>
                <span className="material-symbols-outlined text-xs text-yellow-500">bolt</span>
            </div>
        </Link>
    );
}
