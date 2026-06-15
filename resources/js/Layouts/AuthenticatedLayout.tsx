import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { useOnlineUsersStore } from '@/lib/online-users-store';
import NotificationBell from '@/Components/NotificationBell';
import GamificationWidget from '@/Components/GamificationWidget';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const { setOnlineUsers, addOnlineUser, removeOnlineUser } = useOnlineUsersStore();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || 
               (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const channel = window.Echo.join('online')
            .here((users: Array<{ id: number }>) => {
                setOnlineUsers(users.map(u => u.id));
            })
            .joining((user: { id: number }) => {
                addOnlineUser(user.id);
            })
            .leaving((user: { id: number }) => {
                removeOnlineUser(user.id);
            });

        return () => {
            window.Echo.leave('online');
        };
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const baseNavItems = [
        { label: 'Forum Belajar', href: route('questions.index'), icon: 'dynamic_feed', active: route().current('dashboard') || route().current('questions.*') },
    ];

    const authenticatedNavItems = [
        { 
            group: 'Akademik',
            items: [
                { label: 'Mata Pelajaran', href: route('subjects.index'), icon: 'book_2', active: route().current('subjects.*') },
                { label: 'Jadwal', href: route('schedules.index'), icon: 'calendar_month', active: route().current('schedules.*') },
            ]
        },
        { 
            group: 'Pusat Belajar',
            items: [
                { label: 'Kuis AI', href: route('quizzes.index'), icon: 'psychology', active: route().current('quizzes.*') && !route().current('quizzes.my-scores') },
                { label: 'Nilai Kuis', href: route('quizzes.my-scores'), icon: 'military_tech', active: route().current('quizzes.my-scores') },
                { label: 'Leaderboard', href: route('leaderboard.index'), icon: 'social_leaderboard', active: route().current('leaderboard.*') },
                { label: 'Teman Belajar', href: route('friends.index'), icon: 'group', active: route().current('friends.*') },
                { label: 'Catatan Saya', href: route('notes.index'), icon: 'edit_note', active: route().current('notes.*') },
                { label: 'Tugas', href: route('assignments.index'), icon: 'assignment', active: route().current('assignments.*') },
            ]
        },
        { 
            group: 'Performa',
            items: [
                { label: 'Nilai', href: route('grades.index'), icon: 'grade', active: route().current('grades.*') },
                { label: 'Statistik Aktivitas', href: route('attendances.index'), icon: 'calendar_month', active: route().current('attendances.*') },
            ]
        }
    ];

    let navItems: any[] = [...baseNavItems];

    if (user) {
        navItems = [...navItems, ...authenticatedNavItems];
        
        if (user.is_admin) {
            navItems.push({
                group: 'Admin Panel',
                items: [
                    { label: 'Dasbor Admin', href: route('admin.dashboard'), icon: 'monitoring', active: route().current('admin.dashboard') },
                    { label: 'Kelola Pengguna', href: route('admin.users.index'), icon: 'manage_accounts', active: route().current('admin.users.*') },
                    { label: 'Kelola Peran', href: route('admin.roles.index'), icon: 'admin_panel_settings', active: route().current('admin.roles.*') },
                    { label: 'Kelola Misi', href: route('admin.missions.index'), icon: 'rocket_launch', active: route().current('admin.missions.*') },
                    { label: 'Kelola Mata Pelajaran', href: route('admin.subjects.index'), icon: 'school', active: route().current('admin.subjects.*') },
                ]
            });
        }
    }

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xl font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">school</span>
                    EduTrack
                </span>
            </div>

            <nav className="p-4 space-y-6">
                {navItems.map((item, index) => (
                    <div key={index}>
                        {item.group ? (
                            <>
                                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">{item.group}</h3>
                                <div className="space-y-1">
                                    {item.items.map((subItem: any, subIndex: number) => (
                                        <Link
                                            key={subIndex}
                                            href={subItem.href}
                                            className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                                                subItem.active 
                                                ? 'bg-sky-50 dark:bg-sky-900/30 text-primary font-medium' 
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined">{subItem.icon}</span>
                                                {subItem.label}
                                            </div>
                                            {subItem.label === 'Teman Belajar' && user?.pending_friend_requests_count! > 0 && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm animate-pulse">
                                                    {user.pending_friend_requests_count}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Link
                                href={item.href!}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                    item.active 
                                    ? 'bg-sky-50 dark:bg-sky-900/30 text-primary font-medium' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-3 px-4 py-2 w-full text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mb-2"
                >
                    <span className="material-symbols-outlined">
                        {isDarkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                    {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                </button>
                {user ? (
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Keluar
                    </Link>
                ) : (
                    <Link
                        href={route('login')}
                        className="flex items-center gap-3 px-4 py-2 w-full text-left text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">login</span>
                        Masuk
                    </Link>
                )}
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300 overflow-x-hidden">
            {/* Desktop Sidebar */}
            {user && (
                <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full overflow-y-auto">
                    <SidebarContent />
                </aside>
            )}

            {/* Mobile Sidebar (drawer) */}
            {sidebarOpen && user && (
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
                    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
                    <aside
                        className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-h-screen min-w-0 pb-14 md:pb-0 ${user ? 'md:ml-64' : ''}`}>
                {/* Header */}
                <header className="h-14 md:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 md:px-8 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        {!user && (
                            <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2 mr-4">
                                <span className="material-symbols-outlined">school</span>
                                <span className="hidden sm:inline">EduTrack</span>
                            </Link>
                        )}
                        <h1 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 shrink-0 hidden sm:block truncate max-w-[140px] md:max-w-none">
                            {header || 'Dashboard'}
                        </h1>

                        <div className="flex-1 max-w-md mx-1.5 sm:mx-6">
                            <form action={route('search.index')} method="GET" className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                                <input 
                                    type="text" 
                                    name="q"
                                    placeholder="Cari..." 
                                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 rounded-full py-1.5 pl-10 pr-4 text-sm transition-all"
                                />
                            </form>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {user && <GamificationWidget />}
                        {user && <NotificationBell />}
                        {user ? (
                            <Link href={route('profile.edit')} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Selamat datang, <strong>{user.name}</strong></span>
                                <img 
                                    src={user.profile_photo_url} 
                                    alt={user.name} 
                                    className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm"
                                />
                            </Link>
                        ) : (
                            <div className="flex gap-2">
                                <Link href={route('login')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Masuk</Link>
                                <Link href={route('register')} className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-sky-600 transition-colors">Daftar</Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-3 sm:p-4 md:p-8 overflow-hidden pt-3 md:pt-6">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            {user ? (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 flex justify-around items-center h-14 md:h-16 px-2 pb-[env(safe-area-inset-bottom)]">
                <Link 
                    href={route('dashboard')} 
                    className={`relative flex flex-col items-center justify-center w-16 h-full space-y-0.5 transition-colors ${route().current('dashboard') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <span className={`material-symbols-outlined text-[22px] ${route().current('dashboard') ? 'font-bold' : ''}`}>{route().current('dashboard') ? 'dynamic_feed' : 'dynamic_feed'}</span>
                    <span className={`text-[10px] ${route().current('dashboard') ? 'font-bold' : 'font-medium'}`}>Timeline</span>
                    {route().current('dashboard') && <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-primary" />}
                </Link>
                <Link 
                    href={route('quizzes.index')} 
                    className={`relative flex flex-col items-center justify-center w-16 h-full space-y-0.5 transition-colors ${route().current('quizzes.*') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <span className={`material-symbols-outlined text-[22px] ${route().current('quizzes.*') ? 'font-bold' : ''}`}>psychology_alt</span>
                    <span className={`text-[10px] ${route().current('quizzes.*') ? 'font-bold' : 'font-medium'}`}>Kuis AI</span>
                    {route().current('quizzes.*') && <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-primary" />}
                </Link>
                <Link 
                    href={route('leaderboard.index')} 
                    className={`relative flex flex-col items-center justify-center w-16 h-full space-y-0.5 transition-colors ${route().current('leaderboard.*') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <span className={`material-symbols-outlined text-[22px] ${route().current('leaderboard.*') ? 'font-bold' : ''}`}>social_leaderboard</span>
                    <span className={`text-[10px] ${route().current('leaderboard.*') ? 'font-bold' : 'font-medium'}`}>Ranking</span>
                    {route().current('leaderboard.*') && <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-primary" />}
                </Link>
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center justify-center w-16 h-full space-y-0.5 text-gray-400 dark:text-gray-500 active:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-[22px]">menu</span>
                    <span className="text-[10px] font-medium">Menu</span>
                </button>
            </nav>
            ) : null}
        </div>
    );
}
