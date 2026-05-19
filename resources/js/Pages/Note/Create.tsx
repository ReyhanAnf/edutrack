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
    const { data, setData, post, processing, errors } = useForm({
        subject_id: '',
        title: '',
        category: '',
        content: '',
        status: 'In Progress',
        is_favorite: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('notes.store'));
    };

    const statuses = ['In Progress', 'Completed'];

    return (
        <AuthenticatedLayout
            header="Tambah Catatan"
        >
            <Head title="Tambah Catatan" />

            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Buat Catatan Baru</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tuliskan ringkasan atau poin penting dari pelajaran Anda</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="title" value="Judul Catatan" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukan judul catatan..."
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="subject_id" value="Mata Pelajaran (Opsional)" />
                                    <select
                                        id="subject_id"
                                        name="subject_id"
                                        value={data.subject_id}
                                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary transition-colors"
                                        onChange={(e) => setData('subject_id', e.target.value)}
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
                                    <InputLabel htmlFor="category" value="Kategori" />
                                    <TextInput
                                        id="category"
                                        type="text"
                                        name="category"
                                        value={data.category}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="Contoh: Teori, Praktikum, dsb."
                                        required
                                    />
                                    <InputError message={errors.category} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary transition-colors"
                                    onChange={(e) => setData('status', e.target.value)}
                                    required
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="content" value="Isi Catatan" />
                                <textarea
                                    id="content"
                                    name="content"
                                    value={data.content}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary transition-colors"
                                    rows={8}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Tuliskan isi catatan di sini..."
                                    required
                                ></textarea>
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <label className="flex items-center cursor-pointer group">
                                    <Checkbox
                                        name="is_favorite"
                                        checked={data.is_favorite}
                                        onChange={(e) => setData('is_favorite', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors flex items-center gap-1">
                                        <span className={`material-symbols-outlined text-base ${data.is_favorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}>
                                            star
                                        </span>
                                        Tandai sebagai Favorit
                                    </span>
                                </label>
                                
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={route('notes.index')}
                                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Simpan Catatan
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
