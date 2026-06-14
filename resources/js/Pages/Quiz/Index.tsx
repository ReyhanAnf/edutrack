import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description: string;
    is_public: boolean;
    created_at: string;
    user: { name: string };
    subject: { name: string, color_code: string };
}

interface Note {
    id: number;
    title: string;
    subject_id: number;
    created_at: string;
    subject?: { name: string, color_code: string };
}

interface Props extends PageProps {
    quizzes: Quiz[];
    subjects: { data: { id: number, name: string }[] };
    notes: Note[];
}

export default function Index({ auth, quizzes, subjects, notes = [] }: Props) {
    const [generating, setGenerating] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
    const [isSelectingNotes, setIsSelectingNotes] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isUsingCustomPrompt, setIsUsingCustomPrompt] = useState<boolean>(false);

    const availableNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const generateQuiz = () => {
        if (!selectedSubject) return;
        
        setGenerating(true);
        window.axios.post(route('quizzes.generate'), {
            subject_id: selectedSubject,
            count: 5,
            custom_prompt: customPrompt ? customPrompt : null,
            note_ids: selectedNoteIds.length > 0 ? selectedNoteIds : null,
        })
        .then(response => {
            if (response.data.success) {
                router.visit(route('quizzes.show', response.data.data.id));
            }
        })
        .catch(error => {
            alert(error.response?.data?.message || 'Gagal generate kuis. Pastikan Anda punya cukup catatan atau pertanyaan di mata pelajaran ini.');
        })
        .finally(() => {
            setGenerating(false);
        });
    };

    const togglePublic = (quizId: number) => {
        router.post(route('quizzes.toggle-public', quizId), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header="Kuis AI">
            <Head title="Kuis AI" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4">Generate Kuis Baru</h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select 
                                className="flex-1 rounded-xl border-gray-300 dark:bg-gray-900 dark:border-gray-700"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                disabled={subjects.data.length === 0}
                            >
                                <option value="">{subjects.data.length === 0 ? 'Buat Mata Pelajaran terlebih dahulu...' : 'Pilih Mata Pelajaran...'}</option>
                                {subjects.data.map(subject => (
                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {notes.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="rounded text-primary focus:ring-primary w-5 h-5 dark:bg-gray-800 dark:border-gray-600"
                                        checked={isSelectingNotes}
                                        onChange={(e) => {
                                            setIsSelectingNotes(e.target.checked);
                                            if (!e.target.checked) {
                                                setSelectedNoteIds([]);
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Gunakan Catatan Spesifik (Opsional)</span>
                                        <span className="text-xs text-gray-500">Pilih catatan tertentu secara manual. Jika tidak dicentang, AI akan otomatis mencari catatan yang relevan.</span>
                                    </div>
                                </label>

                                {isSelectingNotes && (
                                    <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                                            </span>
                                            <input
                                                type="text"
                                                placeholder="Cari judul catatan..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 focus:ring-primary focus:border-primary"
                                            />
                                        </div>

                                        {availableNotes.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
                                                {availableNotes.map(note => (
                                                    <label 
                                                        key={note.id} 
                                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                            selectedNoteIds.includes(note.id) 
                                                                ? 'border-primary bg-white dark:bg-gray-800 shadow-sm ring-1 ring-primary' 
                                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            className="mt-0.5 rounded text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                                            checked={selectedNoteIds.includes(note.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedNoteIds([...selectedNoteIds, note.id]);
                                                                } else {
                                                                    setSelectedNoteIds(selectedNoteIds.filter(id => id !== note.id));
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <div className="flex items-start mb-2">
                                                                <span className={`text-sm font-bold line-clamp-2 ${selectedNoteIds.includes(note.id) ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                                                                    {note.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-auto gap-2">
                                                                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                                                    {new Date(note.created_at).toLocaleDateString('id-ID')}
                                                                </span>
                                                                {note.subject && (
                                                                    <span 
                                                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full truncate max-w-[120px] sm:max-w-none text-right"
                                                                        style={{ backgroundColor: `${note.subject.color_code}20`, color: note.subject.color_code }}
                                                                    >
                                                                        {note.subject.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                                <p className="text-sm text-gray-500">Tidak ada catatan yang cocok dengan pencarian Anda.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                             <p className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800">Anda belum memiliki catatan sama sekali. Kuis akan dibuat berdasarkan pengetahuan umum AI.</p>
                        )}
                        
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="rounded text-primary focus:ring-primary w-5 h-5 dark:bg-gray-800 dark:border-gray-600"
                                    checked={isUsingCustomPrompt}
                                    onChange={(e) => {
                                        setIsUsingCustomPrompt(e.target.checked);
                                        if (!e.target.checked) {
                                            setCustomPrompt('');
                                        }
                                    }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tambahkan Instruksi Khusus (Opsional)</span>
                                    <span className="text-xs text-gray-500">Berikan perintah spesifik ke AI (misal: "Buat soal HOTS" atau "Fokus ke rumus saja").</span>
                                </div>
                            </label>

                            {isUsingCustomPrompt && (
                                <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="Ketik instruksi atau topik spesifik di sini..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 focus:ring-primary focus:border-primary resize-y"
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                            <p className="text-sm text-gray-500 text-center sm:text-left flex-1">
                                AI akan membuat kuis berdasarkan catatan Anda, dan memprioritaskan instruksi tambahan jika ada.
                            </p>
                            <button
                                onClick={generateQuiz}
                                disabled={generating || !selectedSubject || subjects.data.length === 0}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">psychology</span>
                                {generating ? 'Sedang Generate...' : 'Buat Kuis AI'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <span 
                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{ backgroundColor: `${quiz.subject.color_code}20`, color: quiz.subject.color_code }}
                                    >
                                        {quiz.subject.name}
                                    </span>
                                    {quiz.is_public && (
                                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                                            Publik
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{quiz.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{quiz.description}</p>
                                <div className="text-xs text-gray-500 mb-4">
                                    Dibuat oleh: <span className="font-medium">{quiz.user.name}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <Link 
                                    href={route('quizzes.show', quiz.id)}
                                    className="text-primary font-semibold text-sm hover:underline"
                                >
                                    Mulai Kuis
                                </Link>
                                {quiz.user.name === auth.user.name && (
                                    <button 
                                        onClick={() => togglePublic(quiz.id)}
                                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                                    >
                                        {quiz.is_public ? 'Jadikan Privat' : 'Bagikan ke Teman'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {quizzes.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 dark:bg-gray-800/50 dark:border-gray-700">
                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">quiz</span>
                        <p className="text-gray-500">Belum ada kuis. Ayo buat kuis pertamamu!</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
