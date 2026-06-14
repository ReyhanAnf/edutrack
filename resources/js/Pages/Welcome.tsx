import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthModal from '@/Components/AuthModal';

interface FeaturedQuestion {
    id: number;
    title: string;
    body: string;
    answers_count: number;
    likes_count: number;
    created_at: string;
    subject?: {
        id: number;
        name: string;
        color_code: string;
    } | null;
    user: {
        id: number;
        name: string;
    };
    answer_preview?: string | null;
    answer_author?: string | null;
}

interface Props extends PageProps<{ laravelVersion: string; phpVersion: string }> {
    featuredQuestions: FeaturedQuestion[];
}

export default function Welcome({
    auth,
    featuredQuestions,
}: Props) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    useEffect(() => {
        // @ts-ignore
        if (window.renderMathInElement) {
            // @ts-ignore
            window.renderMathInElement(document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true },
                ],
                throwOnError: false,
            });
        }
    }, [featuredQuestions]);

    return (
        <div className="min-h-screen bg-[#fcfdfd] dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased font-sans">
            <Head title="EduTrack - Timeline Belajar" />

            {/* Navbar - Clean & Friendly */}
            <header className="h-16 md:h-20 fixed w-full top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
                <div className="max-w-4xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 group-hover:bg-sky-200 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">school</span>
                        </div>
                        <span className="hidden sm:block text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            EduTrack
                        </span>
                    </Link>

                    <div className="flex-1 max-w-md mx-4">
                        <form action={route('search.index')} method="GET" className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input 
                                type="text" 
                                name="q"
                                placeholder="Cari pertanyaan..." 
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-sky-500 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-gray-900 rounded-full py-2 pl-10 pr-4 text-sm transition-all"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <Link href={route('login')} className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            Masuk
                        </Link>
                        <Link href={route('register')} className="px-5 py-2.5 text-sm font-bold bg-sky-500 text-white rounded-full hover:bg-sky-600 shadow-sm transition-transform active:scale-95">
                            Mulai Belajar
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section - Soft & Welcoming */}
            <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 overflow-hidden">
                {/* Gentle Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[11px] font-bold uppercase tracking-widest mx-auto">
                        <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                        Forum Pelajar Teraktif
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.2] tracking-tight">
                        Belajar bareng teman, <br className="hidden md:block" />
                        <span className="relative inline-block text-sky-500">
                            tanya sesukamu!
                            {/* Decorative squiggly underline */}
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                    
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                        Tempat seru buat bahas PR, bagiin catatan, dan kumpulin XP. Yuk, gabung sekarang dan bantu yang lain belajar!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
                        <Link
                            href={route('register')}
                            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-sky-500 px-8 py-3.5 text-base font-bold text-white shadow-sm hover:bg-sky-600 active:scale-95 transition-all"
                        >
                            Daftar Sekarang
                        </Link>
                        <button
                            onClick={() => {
                                document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-8 py-3.5 text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
                        >
                            Lihat Diskusi
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline Feed Section - Clean & Social */}
            <main id="timeline" className="relative z-10 max-w-2xl mx-auto pb-24 px-4 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sky-500 text-[28px]">forum</span>
                        Feed Terbaru
                    </h2>
                </div>

                <div className="space-y-4">
                    {featuredQuestions.map((question) => {
                        // Generate a pseudo-random soft color based on user ID
                        const pastelColors = ['bg-red-100 text-red-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-yellow-100 text-yellow-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];

                        return (
                            <article
                                key={question.id}
                                onClick={() => router.visit(route('questions.show', question.id))}
                                className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-800 cursor-pointer transition-colors"
                            >
                                <div className="flex items-start gap-3 md:gap-4">
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1 text-sm">
                                            <span className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                                {question.user.name}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                                                • Bertanya
                                            </span>
                                        </div>

                                        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                            {question.title}
                                        </h3>
                                        
                                        <div 
                                            className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose prose-sm max-w-none prose-p:my-1 line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: question.body }}
                                        />

                                        {question.subject && (
                                            <div className="mt-3">
                                                <span
                                                    className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 text-[11px] font-bold border border-gray-100 dark:border-gray-700"
                                                    style={{ color: question.subject.color_code }}
                                                >
                                                    <span
                                                        className="mr-1.5 h-1.5 w-1.5 rounded-full"
                                                        style={{ backgroundColor: question.subject.color_code }}
                                                    />
                                                    {question.subject.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setIsAuthModalOpen(true); }}
                                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                            {question.likes_count ?? 0}
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setIsAuthModalOpen(true); }}
                                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">add_reaction</span>
                                            <span className="hidden sm:inline">Reaksi</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                                            {question.answers_count ?? 0} Jawaban
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}

                    {featuredQuestions.length === 0 && (
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-900/30 mb-4">
                                <span className="material-symbols-outlined text-3xl text-sky-500">edit_document</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Belum Ada Topik</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Yuk, buat pertanyaan pertama dan mulai diskusi!
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* Playful PWA Install Button */}
            <div className={`fixed bottom-6 right-5 z-40 transition-all duration-500 transform ${deferredPrompt ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <button
                    onClick={handleInstallClick}
                    className="flex items-center justify-center gap-2 rounded-full bg-gray-900 dark:bg-white px-5 py-3.5 text-sm font-bold text-white dark:text-gray-900 shadow-lg hover:scale-105 active:scale-95 transition-all"
                    aria-label="Install App"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span className="hidden sm:inline">Install Aplikasi</span>
                </button>
            </div>
            
            {/* Fallback info for missing button */}
            {!deferredPrompt && (
                <div className="fixed bottom-6 right-5 z-40">
                     <button
                        onClick={() => alert("Browser Anda tidak mendukung install instan (mungkin karena sedang akses via HTTP/IP). Anda masih bisa install manual melalui menu titik tiga browser > 'Add to Home screen' atau 'Install App'.")}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-400 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 hover:text-sky-500 transition-colors"
                        title="Info Instalasi"
                    >
                        <span className="material-symbols-outlined text-[18px]">help</span>
                    </button>
                </div>
            )}
        </div>
    );
}
