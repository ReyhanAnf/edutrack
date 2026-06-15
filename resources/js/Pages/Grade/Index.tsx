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

interface Grade {
    id: number;
    subject_id: number;
    subject?: Subject;
    activity_name: string;
    score: number;
    created_at: string;
}

interface Props extends PageProps {
    grades: {
        data: Grade[];
    };
}

export default function Index({ auth, grades }: Props) {
    const { delete: destroy, processing } = useForm();
    const [isConfirming, setIsConfirming] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsConfirming(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('grades.destroy', deleteId), {
                onSuccess: () => {
                    setIsConfirming(false);
                    setDeleteId(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header="Nilai"
        >
            <Head title="Nilai" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Nilai</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau pencapaian akademik Anda di setiap aktivitas</p>
                </div>
                <Link
                    href={route('grades.create')}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span className='hidden lg:d-block'>Tambah Nilai</span>
                </Link>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nama Aktivitas
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Mata Pelajaran
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nilai
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {grades.data.map((grade) => (
                                <tr key={grade.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{grade.activity_name}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: grade.subject?.color_code }}
                                            ></div>
                                            <span className="text-gray-600 dark:text-gray-400">{grade.subject?.name}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-sky-50 dark:bg-sky-900/30 text-primary font-bold">
                                            {grade.score}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={route('grades.edit', grade.id)}
                                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(grade.id)}
                                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {grades.data.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">grade</span>
                                <p className="text-gray-500 dark:text-gray-400">Belum ada data nilai.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {grades.data.map((grade) => (
                    <div
                        key={grade.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div
                                        className="h-2 w-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: grade.subject?.color_code }}
                                    ></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                                        {grade.subject?.name}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate">
                                    {grade.activity_name}
                                </h3>
                            </div>
                            <span className="flex-shrink-0 ml-3 inline-flex items-center justify-center h-11 w-11 rounded-full bg-sky-50 dark:bg-sky-900/30 text-primary font-bold text-base">
                                {grade.score}
                            </span>
                        </div>

                        <div className="flex items-center justify-end pt-3 border-t border-gray-50 dark:border-gray-700/50 gap-1">
                            <Link
                                href={route('grades.edit', grade.id)}
                                className="p-2 text-gray-400 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>
                            <button
                                onClick={() => handleDelete(grade.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                ))}

                {grades.data.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">grade</span>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Belum ada data nilai.</p>
                    </div>
                )}
            </div>

            <ConfirmationModal
                show={isConfirming}
                title="Hapus Nilai"
                message="Apakah Anda yakin ingin menghapus catatan nilai ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirming(false)}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

