import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AuthModal from '@/Components/AuthModal';
import { useState, useEffect, useMemo } from 'react';

interface SearchResultQuestion {
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
}

interface SearchResultUser {
    id: number;
    name: string;
    profile_photo_url: string;
    institution: string | null;
}

interface Subject {
    id: number;
    name: string;
}

interface Props extends PageProps {
    query: string;
    filters: {
        subject_id: string;
        status: string;
        sort: string;
    };
    questions: SearchResultQuestion[];
    users: SearchResultUser[];
    subjects: Subject[];
}

// Utility to strip HTML and highlight matched words
const HighlightedText = ({ text, query, isHtml = false }: { text: string; query: string; isHtml?: boolean }) => {
    const plainText = useMemo(() => {
        if (!isHtml) return text;
        const temp = document.createElement('div');
        temp.innerHTML = text;
        return temp.textContent || temp.innerText || "";
    }, [text, isHtml]);

    const words = useMemo(() => query.trim().split(/\s+/).filter(w => w.length > 0), [query]);

    if (words.length === 0 || !plainText) {
        // truncate slightly if it's body
        return <span>{plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText}</span>;
    }

    // Escape regex characters
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'gi');
    
    // Snippet extraction around the first match if it's a long text (like body)
    let displayText = plainText;
    if (isHtml && plainText.length > 250) {
        const match = regex.exec(plainText);
        if (match) {
            const start = Math.max(0, match.index - 80);
            const end = Math.min(plainText.length, match.index + match[0].length + 120);
            displayText = (start > 0 ? '...' : '') + plainText.substring(start, end) + (end < plainText.length ? '...' : '');
        } else {
            displayText = plainText.substring(0, 200) + '...';
        }
    }

    const parts = displayText.split(regex);

    return (
        <span>
            {parts.map((part, i) => 
                words.some(w => w.toLowerCase() === part.toLowerCase()) 
                    ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/40 text-gray-900 dark:text-white rounded-sm px-0.5">{part}</mark> 
                    : <span key={i}>{part}</span>
            )}
        </span>
    );
};

export default function SearchIndex({ auth, query, filters, questions, users, subjects }: Props) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'users'>('all');

    const [subjectId, setSubjectId] = useState(filters.subject_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [sort, setSort] = useState(filters.sort || 'relevance');
    const [searchQuery, setSearchQuery] = useState(query);

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
    }, [questions, activeTab]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('search.index'), { 
                q: searchQuery,
                subject_id: subjectId,
                status: status,
                sort: sort
            }, { preserveState: true });
        }
    };

    // Trigger search when filters change
    useEffect(() => {
        if ((subjectId !== filters.subject_id || status !== filters.status || sort !== filters.sort) && query.trim() !== '') {
            handleSearch();
        }
    }, [subjectId, status, sort]);

    const MainContent = () => (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-sky-500">search</span>
                    Hasil Pencarian untuk "{query}"
                </h1>

                {/* Advanced Filter Panel */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Mata Pelajaran</label>
                        <select 
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-sky-500"
                        >
                            <option value="all">Semua Pelajaran</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-sky-500"
                        >
                            <option value="all">Semua Status</option>
                            <option value="unanswered">Belum Dijawab</option>
                            <option value="answered">Sudah Dijawab</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Urutkan</label>
                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-sky-500"
                        >
                            <option value="relevance">Paling Relevan</option>
                            <option value="latest">Terbaru</option>
                            <option value="popular">Terpopuler</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'all' 
                        ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    Semua
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'questions' 
                        ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    Pertanyaan ({questions.length})
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'users' 
                        ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    Pengguna ({users.length})
                </button>
            </div>

            <div className="space-y-8">
                {query === '' && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Masukkan kata kunci untuk mencari pertanyaan atau pengguna.</p>
                    </div>
                )}

                {/* Users Section */}
                {query !== '' && (activeTab === 'all' || activeTab === 'users') && (
                    <div className="space-y-4">
                        {activeTab === 'all' && users.length > 0 && <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pengguna</h2>}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {users.map(user => (
                                <Link 
                                    key={user.id} 
                                    href={route('users.show', user.id)}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                                >
                                    <img src={user.profile_photo_url} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                            <HighlightedText text={user.name} query={query} />
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.institution || 'Pelajar'}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {users.length === 0 && activeTab === 'users' && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Tidak ada pengguna yang cocok dengan "{query}".
                            </div>
                        )}
                    </div>
                )}

                {/* Questions Section */}
                {query !== '' && (activeTab === 'all' || activeTab === 'questions') && (
                    <div className="space-y-4">
                        {activeTab === 'all' && questions.length > 0 && <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pertanyaan</h2>}
                        
                        <div className="space-y-4">
                            {questions.map((question) => {
                                const pastelColors = ['bg-red-100 text-red-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-yellow-100 text-yellow-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
                                const avatarColor = pastelColors[question.user.id % pastelColors.length];

                                return (
                                    <article
                                        key={question.id}
                                        onClick={() => router.visit(route('questions.show', question.id))}
                                        className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-800 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-start gap-3 md:gap-4">
                                            <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full ${avatarColor} flex items-center justify-center font-black text-base md:text-lg`}>
                                                {question.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            
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
                                                    <HighlightedText text={question.title} query={query} />
                                                </h3>
                                                
                                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <HighlightedText text={question.body} query={query} isHtml={true} />
                                                </div>

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
                                                    onClick={(e) => { e.stopPropagation(); if(!auth.user) setIsAuthModalOpen(true); }}
                                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                                    {question.likes_count ?? 0}
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); if(!auth.user) setIsAuthModalOpen(true); }}
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
                        </div>

                        {questions.length === 0 && (activeTab === 'questions' || (activeTab === 'all' && users.length === 0)) && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">search_off</span>
                                <p>Tidak ada pertanyaan yang cocok dengan "{query}".</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );

    // If User is authenticated, wrap in AuthenticatedLayout
    if (auth.user) {
        return (
            <AuthenticatedLayout header="Pencarian">
                <Head title={`Pencarian: ${query}`} />
                <MainContent />
            </AuthenticatedLayout>
        );
    }

    // If Guest, use Guest Layout wrapper
    return (
        <div className="min-h-screen bg-[#fcfdfd] dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
            <Head title={`Pencarian: ${query}`} />
            
            <header className="h-16 md:h-20 fixed w-full top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
                <div className="max-w-4xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 group-hover:bg-sky-200 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">school</span>
                        </div>
                        <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            EduTrack
                        </span>
                    </Link>

                    <div className="flex-1 max-w-sm mx-4 hidden md:block">
                        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input 
                                type="text" 
                                name="q"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari pertanyaan..." 
                                className="w-full bg-gray-100 dark:bg-gray-800 border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 rounded-full py-2 pl-10 pr-4 text-sm transition-all"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href={route('login')} className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            Masuk
                        </Link>
                        <Link href={route('register')} className="px-5 py-2.5 text-sm font-bold bg-sky-500 text-white rounded-full hover:bg-sky-600 shadow-sm transition-transform active:scale-95">
                            Mulai Belajar
                        </Link>
                    </div>
                </div>
            </header>

            <div className="pt-24 pb-12">
                <MainContent />
            </div>
        </div>
    );
}
