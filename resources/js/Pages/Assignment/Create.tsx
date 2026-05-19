import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
        due_date: '',
        status: 'Pending',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('assignments.store'));
    };

    return (
        <AuthenticatedLayout
            header="Tambah Tugas"
        >
            <Head title="Tambah Tugas" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Buat Tugas Baru</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tambahkan tugas baru untuk memantau progres belajar Anda</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                <select
                                    id="subject_id"
                                    name="subject_id"
                                    value={data.subject_id}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:focus:border-sky-600 dark:focus:ring-sky-600 transition-colors"
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Mata Pelajaran</option>
                                    {subjects.data.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.subject_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="title" value="Judul Tugas" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Laporan Praktikum Fisika"
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="due_date" value="Tenggat Waktu" />
                                <TextInput
                                    id="due_date"
                                    type="date"
                                    name="due_date"
                                    value={data.due_date}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.due_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:focus:border-sky-600 dark:focus:ring-sky-600 transition-colors"
                                    onChange={(e) => setData('status', e.target.value as 'Pending' | 'Completed')}
                                    required
                                >
                                    <option value="Pending">Belum Selesai</option>
                                    <option value="Completed">Selesai</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Link
                                    href={route('assignments.index')}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Simpan Tugas
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
