import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FormEventHandler } from 'react';

interface Subject {
    id: number;
    name: string;
}

interface Grade {
    id: number;
    subject_id: number;
    activity_name: string;
    score: number;
}

interface Props extends PageProps {
    grade: {
        data: Grade;
    };
    subjects: {
        data: Subject[];
    };
}

export default function Edit({ auth, grade, subjects }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        subject_id: grade.data.subject_id.toString(),
        activity_name: grade.data.activity_name,
        score: grade.data.score.toString(),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('grades.update', grade.data.id));
    };

    return (
        <AuthenticatedLayout
            header="Edit Nilai"
        >
            <Head title="Edit Nilai" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Perbarui Data Nilai</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ubah informasi nilai aktivitas akademik Anda</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                <select
                                    id="subject_id"
                                    name="subject_id"
                                    value={data.subject_id}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary transition-colors"
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
                                <InputLabel htmlFor="activity_name" value="Nama Aktivitas" />
                                <TextInput
                                    id="activity_name"
                                    type="text"
                                    name="activity_name"
                                    value={data.activity_name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('activity_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.activity_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="score" value="Nilai" />
                                <TextInput
                                    id="score"
                                    type="number"
                                    step="0.01"
                                    name="score"
                                    value={data.score}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('score', e.target.value)}
                                    required
                                />
                                <InputError message={errors.score} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Link
                                    href={route('grades.index')}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Perbarui Nilai
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
