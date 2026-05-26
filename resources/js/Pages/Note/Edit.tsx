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

interface Note {
    id: number;
    subject_id: number | null;
    title: string;
    category: string;
    content: string;
    status: string;
    is_favorite: boolean;
    image_url?: string | null;
}

interface Props extends PageProps {
    note: {
        data: Note;
    };
    subjects: {
        data: Subject[];
    };
}

export default function Edit({ auth, note, subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        subject_id: string;
        title: string;
        category: string;
        content: string;
        status: string;
        is_favorite: boolean;
        image: File | null;
    }>({
        _method: 'PATCH',
        subject_id: note.data.subject_id?.toString() || '',
        title: note.data.title,
        category: note.data.category,
        content: note.data.content,
        status: note.data.status,
        is_favorite: note.data.is_favorite,
        image: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('notes.update', note.data.id));
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
            header="Edit Catatan"
        >
            <Head title="Edit Catatan" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Catatan</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perbarui ringkasan atau lampiran catatan Anda</p>
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
                                    required
                                ></textarea>
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Ganti Lampiran Gambar (Opsional)" />
                                <div className="mt-2 flex items-center gap-4">
                                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition-colors hover:border-primary hover:bg-sky-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary/50">
                                        <span className="material-symbols-outlined mb-2 text-gray-400">add_a_photo</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {data.image ? data.image.name : 'Upload foto baru untuk mengganti lampiran'}
                                        </p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                        />
                                    </label>
                                    {(data.image || note.data.image_url) && (
                                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                                            <img
                                                src={data.image ? URL.createObjectURL(data.image) : note.data.image_url!}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            {data.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => setData('image', null)}
                                                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                                                >
                                                    <span className="material-symbols-outlined text-xs">close</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.image} className="mt-2" />
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
                                        {processing ? 'Menyimpan...' : 'Perbarui Catatan'}
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
