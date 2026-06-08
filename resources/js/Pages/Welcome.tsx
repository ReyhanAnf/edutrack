import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const featureCards = [
    {
        icon: 'forum',
        title: 'Tanya Jawab Real-time',
        description: 'Pertanyaan masuk, jawaban berdatangan, dan status thread berubah tanpa refresh halaman.',
        meta: 'Live discussion + Reverb',
    },
    {
        icon: 'ads_click',
        title: 'Reaction Akademik',
        description: 'Dukung jawaban dengan reaction pendidikan dan basic emoji yang lebih ekspresif.',
        meta: 'Material icons + emoji basic',
    },
    {
        icon: 'military_tech',
        title: 'Tier dan XP',
        description: 'Setiap aksi memberi XP per mata pelajaran dan mendorong progres tier yang terasa nyata.',
        meta: 'Leaderboard + spesialisasi',
    },
    {
        icon: 'sports_esports',
        title: 'Study Arena',
        description: 'Ruang belajar kompetitif untuk kuis cepat, bounty, dan kolaborasi memecahkan soal.',
        meta: 'Mini game rooms',
    },
];

const previewStats = [
    { label: 'Diskusi aktif', value: 'Real-time' },
    { label: 'XP per mapel', value: 'Subject-based' },
    { label: 'Reaction', value: 'Education icons' },
    { label: 'Leaderboard', value: 'Tiered ranking' },
];

interface FeaturedQuestion {
    id: number;
    title: string;
    body: string;
    answers_count: number;
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
    laravelVersion,
    phpVersion,
    featuredQuestions,
}: Props) {
    const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

    const openAuthPrompt = () => {
        if (auth.user) {
            window.location.href = route('dashboard');
            return;
        }

        setIsAuthPromptOpen(true);
    };

    return (
        <>
            <Head title="Edutrack" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.20),_transparent_35%),linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_35%,_#ffffff_100%)] text-gray-900 dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-gray-100">
                <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-primary">Edutrack</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Crowdsourced knowledge network</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={openAuthPrompt}
                                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-sky-200 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200"
                            >
                                Masuk
                            </button>
                            <button
                                type="button"
                                onClick={openAuthPrompt}
                                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
                            >
                                Daftar
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 py-8 lg:py-10">
                        <section className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary dark:border-sky-900/40 dark:bg-sky-950/40">
                                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                                    Landing page preview
                                </div>

                                <div className="space-y-4">
                                    <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl dark:text-white">
                                        Tanya, dukung, dan naik tier dalam satu ruang belajar yang hidup.
                                    </h1>
                                    <p className="max-w-xl text-base leading-7 text-gray-600 dark:text-gray-300">
                                        Edutrack menggabungkan forum tanya jawab, reaction akademik, leaderboard XP, dan ruang kolaborasi belajar. Semua orang bisa membaca jawaban, lalu login untuk ikut berkontribusi.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={openAuthPrompt}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
                                    >
                                        <span className="material-symbols-outlined text-base">login</span>
                                        Mulai Sekarang
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openAuthPrompt}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-sky-200 hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
                                    >
                                        <span className="material-symbols-outlined text-base">person_add</span>
                                        Coba Daftar
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {previewStats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
                                        >
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                                {stat.label}
                                            </p>
                                            <p className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-4 rounded-[2rem] bg-sky-200/40 blur-3xl dark:bg-sky-950/50" />
                                <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Fitur inti</p>
                                            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Sepenggal ekosistem Edutrack</p>
                                        </div>
                                        <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-sky-950/40 dark:text-sky-200">
                                            Real-time
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {featureCards.map((card) => (
                                            <button
                                                key={card.title}
                                                type="button"
                                                onClick={openAuthPrompt}
                                                className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-sky-800 dark:hover:bg-slate-900"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-sky-950/40">
                                                        <span className="material-symbols-outlined">{card.icon}</span>
                                                    </div>
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                                                        Preview
                                                    </span>
                                                </div>

                                                <h2 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                                                    {card.title}
                                                </h2>
                                                <p className="mt-2 text-xs leading-6 text-gray-600 dark:text-gray-400">
                                                    {card.description}
                                                </p>
                                                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                                                    {card.meta}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mt-8 space-y-4">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Featured questions</p>
                                    <h2 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Tampilan bento ala Aceternity untuk pertanyaan teratas.</h2>
                                </div>
                            </div>

                            <div className="grid gap-5">
                                {featuredQuestions.map((question, index) => (
                                    <article
                                        key={question.id}
                                        className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/70 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-sky-800/70"
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.10),_transparent_28%)] opacity-100" />
                                        <div className="relative grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
                                            <div className={index % 2 === 1 ? 'order-2 p-5 lg:order-2' : 'p-5'}>
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-primary dark:bg-sky-950/40">
                                                        Featured
                                                    </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{question.user.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(question.created_at).toLocaleDateString('id-ID')}</span>
                                                    <span>•</span>
                                                    <span>{question.answers_count} jawaban</span>
                                                </div>

                                                <h3 className="mt-4 text-xl font-black leading-tight text-gray-900 dark:text-white lg:text-2xl">
                                                    {question.title}
                                                </h3>

                                                <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-300">
                                                    {question.body}
                                                </p>

                                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                                    {question.subject && (
                                                        <span
                                                            className="inline-flex items-center rounded-full border border-gray-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                                            style={{ color: question.subject.color_code }}
                                                        >
                                                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: question.subject.color_code }} />
                                                            {question.subject.name}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-primary dark:bg-sky-950/40">
                                                        Reaction, XP, dan leaderboard aktif
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={index % 2 === 1 ? 'order-1 border-t border-gray-100 bg-white/60 p-5 lg:order-1 lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-950/40' : 'border-t border-gray-100 bg-white/60 p-5 lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-950/40'}>
                                                <div className="relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-sky-100 bg-gradient-to-b from-white via-sky-50/70 to-white p-4 dark:border-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                                                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                                        Jawaban
                                                    </div>

                                                    <div className="relative mt-4 space-y-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                                                        <p className="whitespace-pre-line">
                                                            {question.answer_preview
                                                                ? question.answer_preview
                                                                : 'Belum ada jawaban yang tersimpan untuk pertanyaan ini.'}
                                                        </p>

                                                        <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/80">
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                {question.answer_author
                                                                    ? `Disusun oleh ${question.answer_author}`
                                                                    : 'Jawaban komunitas akan tampil di sini.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="mt-8 grid gap-4 lg:grid-cols-3">
                            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-primary dark:bg-sky-950/40">
                                        <span className="material-symbols-outlined">forum</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Q&A dinamis</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pertanyaan dan jawaban mengalir realtime.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-primary dark:bg-sky-950/40">
                                        <span className="material-symbols-outlined">emoji_events</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Gamifikasi XP</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Bangun tier per mata pelajaran.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-primary dark:bg-sky-950/40">
                                        <span className="material-symbols-outlined">psychology</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">AI assist</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Hint, ringkasan, dan learning path.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer className="pb-4 pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                        Edutrack v{laravelVersion} · PHP v{phpVersion}
                    </footer>
                </div>

                {isAuthPromptOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
                        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.6)] dark:border-slate-700 dark:bg-slate-950">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary dark:bg-sky-950/40">
                                        <span className="material-symbols-outlined text-[14px]">lock</span>
                                        Akses penuh
                                    </p>
                                    <h2 className="mt-3 text-2xl font-black text-gray-900 dark:text-white">
                                        Masuk dulu untuk melanjutkan
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                        Login atau daftar untuk membuka timeline, reaction, leaderboard, dan ruang belajar interaktif.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsAuthPromptOpen(false)}
                                    className="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-700 dark:text-gray-400 dark:hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            <div className="mt-6 grid gap-3">
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
                                >
                                    <span className="material-symbols-outlined text-[18px]">login</span>
                                    Masuk ke akun
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-sky-200 hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    Buat akun baru
                                </Link>
                            </div>

                            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-400">
                                Dengan login, kamu bisa menyimpan progress, mendapatkan XP per mata pelajaran, dan ikut diskusi realtime.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
