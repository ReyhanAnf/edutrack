import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';

interface Subject {
    id: number;
    name: string;
}

interface Props extends PageProps {
    subjects: {
        data: Subject[];
    };
}

export default function Create({ subjects }: Props) {
    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        subject_id: string;
        title: string;
        body: string;
        image: File | null;
    }>({
        subject_id: '',
        title: '',
        body: '',
        image: null,
    });

    const insertText = (before: string, after: string = '') => {
        const textarea = bodyRef.current;

        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const replacement = before + selectedText + after;

        const newValue = text.substring(0, start) + replacement + text.substring(end);
        setData('body', newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const toolbarItems = [
        { icon: 'functions', label: 'Rumus', action: () => insertText('$', '$') },
        { icon: 'science', label: 'Fisika/Kimia', action: () => insertText('$$\n', '\n$$') },
        { icon: 'code', label: 'Kode', action: () => insertText('```\n', '\n```') },
        { icon: 'format_bold', label: 'Tebal', action: () => insertText('**', '**') },
        { icon: 'superscript', label: 'Pangkat', action: () => insertText('^', '') },
        { icon: 'subscript', label: 'Subskrip', action: () => insertText('_', '') },
    ];

    const templateItems = [
        {
            icon: 'calculate',
            label: 'Persamaan kuadrat',
            action: () =>
                setData(
                    'body',
                    `${data.body}${data.body ? '\n\n' : ''}$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$`,
                ),
        },
        {
            icon: 'flare',
            label: 'Fisika',
            action: () => setData('body', `${data.body}${data.body ? '\n\n' : ''}$$F = ma$$\n$$E = mc^2$$`),
        },
        {
            icon: 'science',
            label: 'Kimia',
            action: () =>
                setData(
                    'body',
                    `${data.body}${data.body ? '\n\n' : ''}$$H_2O + CO_2 \\rightarrow H_2CO_3$$\n$$\\Delta G = \\Delta H - T\\Delta S$$`,
                ),
        },
        {
            icon: 'code',
            label: 'Contoh kode',
            action: () =>
                setData(
                    'body',
                    `${data.body}${data.body ? '\n\n' : ''}` +
                        '```tsx\nconst answer = 42;\nfunction solve() {\n    return answer;\n}\n```',
                ),
        },
    ];

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
    }, [data.body]);

    useEffect(() => {
        // @ts-ignore
        if (window.renderMathInElement && previewRef.current) {
            // @ts-ignore
            window.renderMathInElement(previewRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true },
                ],
                throwOnError: false,
            });
        }
    }, [data.body]);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('questions.store'));
    };

    return (
        <AuthenticatedLayout header="Ajukan Pertanyaan">
            <Head title="Ajukan Pertanyaan" />

            <div className="mx-auto max-w-3xl">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-8">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tulis Pertanyaan Baru</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Jelaskan konteks soal agar komunitas bisa memberi langkah penyelesaian yang tepat.</p>
                            </div>
                            <div className="rounded-xl bg-sky-50 p-3 dark:bg-sky-900/20">
                                <span className="material-symbols-outlined text-primary">functions</span>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-300">
                                <p className="mb-1 flex items-center gap-1.5 font-bold">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Tip: Rumus, reaksi, dan kode
                                </p>
                                <p className="space-y-1">
                                    <span className="block">• Matematika: <code>$x^2$</code> atau <code>{'$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$'}</code></span>
                                    <span className="block">• Fisika/Kimia: <code>{'$$F = ma$$'}</code>, <code>H_2O</code>, <code>{'$$\\Delta G = \\Delta H - T\\Delta S$$'}</code></span>
                                    <span className="block">• Koding: <code>{'```\nconst answer = 42;\n```'}</code></span>
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran (Opsional)" />
                                <select
                                    id="subject_id"
                                    name="subject_id"
                                    value={data.subject_id}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    onChange={(event) => setData('subject_id', event.target.value)}
                                >
                                    <option value="">Tanpa Mata Pelajaran</option>
                                    {subjects.data.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.subject_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="title" value="Judul Pertanyaan" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="mt-1 block w-full"
                                    isFocused
                                    onChange={(event) => setData('title', event.target.value)}
                                    placeholder="Contoh: Bagaimana cara menyelesaikan persamaan kuadrat ini?"
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm ring-1 ring-sky-50 dark:border-sky-900/30 dark:bg-gray-800 dark:ring-sky-950/20">
                                <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-4 py-4 dark:border-sky-900/30 dark:from-sky-950/30 dark:via-gray-800 dark:to-indigo-950/20 sm:px-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="max-w-xl">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary dark:border-sky-900 dark:bg-gray-900 dark:text-sky-300">
                                                <span className="material-symbols-outlined text-[14px]">tune</span>
                                                Helper Toolbar
                                            </div>
                                            <InputLabel htmlFor="body" value="Editor Pertanyaan" className="mt-3" />
                                            <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
                                                Sisipkan rumus, blok fisika/kimia, kode, atau template siap pakai tanpa mengetik manual.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {toolbarItems.map((item) => (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={item.action}
                                                    title={item.label}
                                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
                                    <div className="border-b border-gray-100 p-4 dark:border-gray-700 sm:p-5 lg:border-b-0 lg:border-r">
                                        <textarea
                                            id="body"
                                            name="body"
                                            ref={bodyRef}
                                            value={data.body}
                                            className="block min-h-[340px] w-full rounded-2xl border-gray-200 bg-gray-50 font-mono text-sm leading-7 shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                            rows={10}
                                            onChange={(event) => setData('body', event.target.value)}
                                            placeholder="Tulis soal matematika, fisika, kimia, atau koding di sini. Contoh: $x^2$, $$F = ma$$, $$H_2O$$, atau ```tsx ...```"
                                            required
                                        />
                                        <InputError message={errors.body} className="mt-2" />
                                    </div>

                                    <div className="space-y-4 bg-gray-50 p-4 dark:bg-gray-900/50 sm:p-5">
                                        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-950">
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Template cepat</p>
                                            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                                                {templateItems.map((item) => (
                                                    <button
                                                        key={item.label}
                                                        type="button"
                                                        onClick={item.action}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-950">
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Pratinjau cepat</p>
                                            <div
                                                ref={previewRef}
                                                className="mt-3 min-h-[140px] rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                            >
                                                {data.body ? data.body : 'Pratinjau rumus, fisika, kimia, dan kode akan muncul di sini.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="image" value="Gambar Soal (Opsional)" />
                                <div className="mt-1 flex items-center gap-4">
                                    <label className="flex h-40 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary hover:bg-sky-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary/50">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5 text-center px-4">
                                            <span className="material-symbols-outlined mb-2 text-gray-400 text-3xl">image</span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {data.image ? data.image.name : 'Pilih atau drop gambar soal'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                        <input
                                            id="image"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(event) => setData('image', event.target.files?.[0] || null)}
                                        />
                                    </label>
                                    {data.image && (
                                        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <img
                                                src={URL.createObjectURL(data.image)}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setData('image', null)}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">close</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.image} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Link
                                    href={route('questions.index')}
                                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing} className="px-8 py-3">
                                    Kirim Pertanyaan
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
