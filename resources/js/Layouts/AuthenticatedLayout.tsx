import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
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

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const navItems = [
        { label: 'Timeline Belajar', href: route('dashboard'), icon: 'dynamic_feed', active: route().current('dashboard') },
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
                { label: 'Forum Tanya Jawab', href: route('questions.index'), icon: 'forum', active: route().current('questions.*') },
                { label: 'Leaderboard', href: route('leaderboard.index'), icon: 'social_leaderboard', active: route().current('leaderboard.*') },
                { label: 'Catatan Saya', href: route('notes.index'), icon: 'edit_note', active: route().current('notes.*') },
                { label: 'Tugas', href: route('assignments.index'), icon: 'assignment', active: route().current('assignments.*') },
            ]
        },
        { 
            group: 'Performa',
            items: [
                { label: 'Nilai', href: route('grades.index'), icon: 'grade', active: route().current('grades.*') },
                { label: 'Kehadiran', href: route('attendances.index'), icon: 'verified_user', active: route().current('attendances.*') },
            ]
        }
    ];

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
                                    {item.items.map((subItem, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            href={subItem.href}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                                subItem.active 
                                                ? 'bg-sky-50 dark:bg-sky-900/30 text-primary font-medium' 
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined">{subItem.icon}</span>
                                            {subItem.label}
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
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 px-4 py-2 w-full text-left text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Keluar
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full overflow-y-auto">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (drawer) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col shadow-2xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:ml-64 min-h-screen">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
                    {/* Mobile menu button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            aria-label="Open menu"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {header || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={route('profile.edit')} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Selamat datang, <strong>{user.name}</strong></span>
                            <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0)}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-3 sm:p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
