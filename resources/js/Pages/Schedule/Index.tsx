import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import ConfirmationModal from '@/Components/ConfirmationModal';

interface Subject {
    id: number;
    name: string;
    color_code: string;
}

interface Schedule {
    id: number;
    subject_id: number;
    subject?: Subject;
    day: string;
    start_time: string;
    end_time: string;
}

interface Props extends PageProps {
    schedules: {
        data: Schedule[];
    };
}

export default function Index({ auth, schedules }: Props) {
    const { delete: destroy, processing } = useForm();
    const [isConfirming, setIsConfirming] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsConfirming(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('schedules.destroy', deleteId), {
                onSuccess: () => {
                    setIsConfirming(false);
                    setDeleteId(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header="Jadwal Pelajaran"
        >
            <Head title="Jadwal Pelajaran" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Jadwal</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola waktu belajar mingguan Anda</p>
                </div>
                <Link
                    href={route('schedules.create')}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Tambah Jadwal
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Hari
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Mata Pelajaran
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Waktu
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {schedules.data.map((schedule) => (
                                <tr key={schedule.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{schedule.day}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: schedule.subject?.color_code }}
                                            ></div>
                                            <span className="text-gray-600 dark:text-gray-300">{schedule.subject?.name}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <span className="material-symbols-outlined text-base">schedule</span>
                                            {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={route('schedules.edit', schedule.id)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {schedules.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">calendar_month</span>
                                            <p className="text-gray-500 dark:text-gray-400">Belum ada jadwal pelajaran.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                show={isConfirming}
                title="Hapus Jadwal"
                message="Apakah Anda yakin ingin menghapus jadwal pelajaran ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirming(false)}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

