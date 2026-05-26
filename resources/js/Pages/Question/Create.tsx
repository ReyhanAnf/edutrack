import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

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
                                <p className="font-bold flex items-center gap-1.5 mb-1">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Tip: Notasi Matematika
                                </p>
                                <p>Gunakan <code>$x^2$</code> untuk inline math dan <code>$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$</code> untuk block math.</p>
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

                            <div>
                                <InputLabel htmlFor="body" value="Detail Pertanyaan" />
                                <textarea
                                    id="body"
                                    name="body"
                                    value={data.body}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 font-mono"
                                    rows={8}
                                    onChange={(event) => setData('body', event.target.value)}
                                    placeholder="Tuliskan soal... Anda bisa menggunakan LaTeX untuk rumus matematika."
                                    required
                                />
                                <InputError message={errors.body} className="mt-2" />
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
