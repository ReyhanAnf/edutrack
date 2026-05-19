import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import ConfirmationModal from '@/Components/ConfirmationModal';

interface Subject {
    id: number;
    name: string;
    color_code: string;
    created_at: string;
}

interface Props extends PageProps {
    subjects: {
        data: Subject[];
    };
}

export default function Index({ auth, subjects }: Props) {
    const { delete: destroy, processing } = useForm();
    const [isConfirming, setIsConfirming] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsConfirming(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('subjects.destroy', deleteId), {
                onSuccess: () => {
                    setIsConfirming(false);
                    setDeleteId(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header="Mata Pelajaran"
        >
            <Head title="Mata Pelajaran" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Mata Pelajaran</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola semua mata pelajaran Anda di satu tempat</p>
                </div>
                <Link
                    href={route('subjects.create')}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Tambah Pelajaran
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Warna
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nama Pelajaran
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {subjects.data.map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div
                                            className="h-8 w-8 rounded-lg shadow-sm border border-white dark:border-gray-700"
                                            style={{ backgroundColor: subject.color_code }}
                                        ></div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={route('subjects.edit', subject.id)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subjects.data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">book_2</span>
                                            <p className="text-gray-500 dark:text-gray-400">Belum ada mata pelajaran.</p>
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
                title="Hapus Mata Pelajaran"
                message="Apakah Anda yakin ingin menghapus mata pelajaran ini? Semua data terkait (tugas, nilai, jadwal) juga akan dihapus secara permanen."
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirming(false)}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

