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

interface Schedule {
    id: number;
    subject_id: number;
    day: string;
    start_time: string;
    end_time: string;
}

interface Props extends PageProps {
    schedule: {
        data: Schedule;
    };
    subjects: {
        data: Subject[];
    };
}

export default function Edit({ auth, schedule, subjects }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        subject_id: schedule.data.subject_id.toString(),
        day: schedule.data.day,
        start_time: schedule.data.start_time.substring(0, 5),
        end_time: schedule.data.end_time.substring(0, 5),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('schedules.update', schedule.data.id));
    };

    const days = [
        { value: 'Monday', label: 'Senin' },
        { value: 'Tuesday', label: 'Selasa' },
        { value: 'Wednesday', label: 'Rabu' },
        { value: 'Thursday', label: 'Kamis' },
        { value: 'Friday', label: 'Jumat' },
        { value: 'Saturday', label: 'Sabtu' },
        { value: 'Sunday', label: 'Minggu' }
    ];

    return (
        <AuthenticatedLayout
            header="Edit Jadwal"
        >
            <Head title="Edit Jadwal" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Perbarui Jadwal Pelajaran</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ubah waktu pelaksanaan mata pelajaran Anda</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                <select
                                    id="subject_id"
                                    name="subject_id"
                                    value={data.subject_id}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary dark:focus:border-sky-600 dark:focus:ring-sky-600 transition-colors"
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
                                <InputLabel htmlFor="day" value="Hari" />
                                <select
                                    id="day"
                                    name="day"
                                    value={data.day}
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary dark:focus:border-sky-600 dark:focus:ring-sky-600 transition-colors"
                                    onChange={(e) => setData('day', e.target.value)}
                                    required
                                >
                                    {days.map((day) => (
                                        <option key={day.value} value={day.value}>
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.day} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="start_time" value="Waktu Mulai" />
                                    <TextInput
                                        id="start_time"
                                        type="time"
                                        name="start_time"
                                        value={data.start_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_time} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="end_time" value="Waktu Selesai" />
                                    <TextInput
                                        id="end_time"
                                        type="time"
                                        name="end_time"
                                        value={data.end_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.end_time} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Link
                                    href={route('schedules.index')}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Perbarui Jadwal
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
