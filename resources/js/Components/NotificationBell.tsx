import React, { useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';

interface NotificationData {
    id: string;
    type: string;
    data: {
        type: string;
        actor_name?: string;
        actor_id?: number;
        message: string;
        url: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

function getIcon(type: string): string {
    return match(type, {
        new_answer: 'forum',
        brainliest: 'emoji_events',
        content_liked: 'thumb_up',
        quiz_attempted: 'quiz',
        leaderboard_overtaken: 'leaderboard',
        streak_warning: 'local_fire_department',
        friend_request: 'person_add',
        friend_accepted: 'handshake',
        default: 'notifications',
    });
}

function getIconColor(type: string): string {
    return match(type, {
        new_answer: 'text-blue-500',
        brainliest: 'text-amber-500',
        content_liked: 'text-pink-500',
        quiz_attempted: 'text-purple-500',
        leaderboard_overtaken: 'text-orange-500',
        streak_warning: 'text-red-500',
        friend_request: 'text-teal-500',
        friend_accepted: 'text-green-500',
        default: 'text-gray-500',
    });
}

function match<T>(value: string, map: Record<string, T> & { default: T }): T {
    return value in map ? map[value] : map.default;
}

function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    return `${days}h`;
}

export default function NotificationBell() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(user?.unread_notifications_count ?? 0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch notifications when opening
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(route('notifications.index'));
            const data = await res.json();
            setNotifications(data.data || []);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
        setLoading(false);
    };

    // Poll unread count every 60s
    useEffect(() => {
        if (!user) return;

        const poll = async () => {
            try {
                const res = await fetch(route('notifications.unread-count'));
                const data = await res.json();
                setUnreadCount(data.count);
            } catch {}
        };

        const interval = setInterval(poll, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const toggleOpen = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAllRead = async () => {
        await fetch(route('notifications.read-all'), { method: 'POST' });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    };

    const handleNotificationClick = async (notif: NotificationData) => {
        if (!notif.read_at) {
            await fetch(route('notifications.read', notif.id), { method: 'POST' });
            setUnreadCount((prev: number) => Math.max(0, prev - 1));
            setNotifications((prev: NotificationData[]) =>
                prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
            );
        }
        setIsOpen(false);
        if (notif.data.url) {
            router.visit(notif.data.url);
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Notifikasi"
            >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                <span className="material-symbols-outlined text-4xl block mb-2 text-gray-300 dark:text-gray-600">notifications_off</span>
                                Belum ada notifikasi
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start gap-3 ${!notif.read_at ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''}`}
                                >
                                    <span className={`material-symbols-outlined text-xl mt-0.5 shrink-0 ${getIconColor(notif.data.type)}`}>
                                        {getIcon(notif.data.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${!notif.read_at ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {notif.data.message}
                                        </p>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                                            {timeAgo(notif.created_at)}
                                        </span>
                                    </div>
                                    {!notif.read_at && (
                                        <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
