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

interface Props extends PageProps {
    subjects: {
        data: Subject[];
    };
}

export default function Create({ auth, subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        subject_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('attendances.store'));
    };

    return (
        <AuthenticatedLayout
            header="Catat Kehadiran"
        >
            <Head title="Catat Kehadiran" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Catat Kehadiran Baru</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rekam kehadiran Anda untuk mata pelajaran tertentu</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                <select
                                    id="subject_id"
                                    name="subject_id"
                                    value={data.subject_id}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-sky-500 focus:ring-sky-500 transition-colors"
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
                                <InputLabel htmlFor="date" value="Tanggal" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    name="date"
                                    value={data.date}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-sky-500 focus:ring-sky-500 transition-colors"
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    required
                                >
                                    <option value="Present">Hadir</option>
                                    <option value="Excused">Izin</option>
                                    <option value="Absent">Alpa</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value="Catatan (Opsional)" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={data.notes}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-sky-500 focus:ring-sky-500 transition-colors"
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Alasan izin atau catatan tambahan lainnya..."
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Link
                                    href={route('attendances.index')}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Simpan Kehadiran
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
