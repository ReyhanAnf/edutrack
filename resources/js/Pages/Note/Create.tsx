import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { FormEventHandler } from 'react';

interface Subject {
    id: number;
    name: string;
}

interface Props extends PageProps {
    subjects: {
        data: Subject[];
    };
}

export default function Create({ auth, subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        subject_id: string;
        title: string;
        category: string;
        content: string;
        status: string;
        is_favorite: boolean;
        attachments: File[];
    }>({
        subject_id: '',
        title: '',
        category: '',
        content: '',
        status: 'In Progress',
        is_favorite: false,
        attachments: [],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('attachments', [...data.attachments, ...newFiles]);
        }
    };

    const removeAttachment = (index: number) => {
        const newAttachments = [...data.attachments];
        newAttachments.splice(index, 1);
        setData('attachments', newAttachments);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('notes.store'));
    };

    const insertText = (before: string, after: string = '') => {
        const textarea = document.getElementById('content') as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const replacement = before + selectedText + after;
        
        const newValue = text.substring(0, start) + replacement + text.substring(end);
        setData('content', newValue);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const toolbarItems = [
        { icon: 'format_bold', label: 'Bold', action: () => insertText('**', '**') },
        { icon: 'format_italic', label: 'Italic', action: () => insertText('_', '_') },
        { icon: 'format_list_bulleted', label: 'List', action: () => insertText('\n- ') },
        { icon: 'functions', label: 'Math', action: () => insertText('$', '$') },
        { icon: 'code', label: 'Code', action: () => insertText('```\n', '\n```') },
    ];

    const statuses = ['In Progress', 'Completed'];

    return (
        <AuthenticatedLayout
            header="Tambah Catatan"
        >
            <Head title="Tambah Catatan" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Buat Catatan Baru</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tuliskan ringkasan, rumus, atau lampirkan foto catatan tangan Anda</p>
                            </div>
                            <Link
                                href={route('notes.index')}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </Link>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="title" value="Judul Catatan" />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full text-lg font-bold"
                                        isFocused={true}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Judul Materi Pelajaran..."
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                    <select
                                        id="subject_id"
                                        name="subject_id"
                                        value={data.subject_id}
                                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary transition-colors"
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                    >
                                        <option value="">Pilih Mata Pelajaran...</option>
                                        {subjects.data.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.subject_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category" value="Kategori" />
                                    <TextInput
                                        id="category"
                                        type="text"
                                        name="category"
                                        value={data.category}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="Contoh: Teori, Rumus, Review"
                                        required
                                    />
                                    <InputError message={errors.category} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <InputLabel htmlFor="content" value="Isi Catatan" />
                                    <div className="flex gap-1">
                                        {toolbarItems.map((item) => (
                                            <button
                                                key={item.label}
                                                type="button"
                                                onClick={item.action}
                                                title={item.label}
                                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={data.content}
                                    className="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary transition-colors min-h-[300px] font-mono text-sm leading-relaxed p-4"
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Tuliskan materi di sini. Mendukung Markdown dan LaTeX ($...$ untuk rumus)..."
                                    required
                                ></textarea>
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Lampiran (Gambar & PDF)" />
                                <div className="mt-2 space-y-4">
                                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition-colors hover:border-primary hover:bg-sky-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary/50">
                                        <span className="material-symbols-outlined mb-2 text-gray-400 text-3xl">upload_file</span>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Klik untuk upload atau drag & drop file
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Mendukung banyak file Gambar (JPG, PNG) & PDF (Maks 10MB/file)
                                        </p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    
                                    {data.attachments.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {data.attachments.map((file, index) => {
                                                const isImage = file.type.startsWith('image/');
                                                return (
                                                    <div key={index} className="relative group rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                                                        {isImage ? (
                                                            <div className="aspect-square">
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={file.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-square flex flex-col items-center justify-center p-3 bg-red-50 dark:bg-red-900/10">
                                                                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">picture_as_pdf</span>
                                                                <span className="text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-2 w-full px-1 font-medium">{file.name}</span>
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttachment(index)}
                                                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.attachments} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center cursor-pointer group">
                                        <Checkbox
                                            name="is_favorite"
                                            checked={data.is_favorite}
                                            onChange={(e) => setData('is_favorite', e.target.checked)}
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors flex items-center gap-1">
                                            Tandai Favorit
                                        </span>
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <InputLabel htmlFor="status" value="Status:" className="mb-0" />
                                        <select
                                            id="status"
                                            value={data.status}
                                            className="text-xs rounded-lg border-gray-300 py-1 dark:bg-gray-900 dark:text-gray-100"
                                            onChange={(e) => setData('status', e.target.value)}
                                        >
                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <PrimaryButton disabled={processing} className="px-8">
                                        {processing ? 'Menyimpan...' : 'Simpan Catatan'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
