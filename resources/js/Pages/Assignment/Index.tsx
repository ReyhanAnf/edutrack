import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import ConfirmationModal from '@/Components/ConfirmationModal';
import Drawer from '@/Components/Drawer';
import SecondaryButton from '@/Components/SecondaryButton';

interface Subject {
    id: number;
    name: string;
    color_code: string;
}

interface Assignment {
    id: number;
    subject_id: number;
    subject?: Subject;
    title: string;
    description: string | null;
    due_date: string;
    status: 'Pending' | 'Completed';
}

interface Props extends PageProps {
    assignments: {
        data: Assignment[];
    };
}

export default function Index({ auth, assignments }: Props) {
    const { delete: destroy, processing } = useForm();
    const [isConfirming, setIsConfirming] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
    const [isToggling, setIsToggling] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsConfirming(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('assignments.destroy', deleteId), {
                onSuccess: () => {
                    setIsConfirming(false);
                    setDeleteId(null);
                },
            });
        }
    };

    const toggleStatus = (id: number) => {
        setIsToggling(id);
        router.patch(route('assignments.toggle-status', id), {}, {
            preserveScroll: true,
            onFinish: () => setIsToggling(null),
        });
    };

    const openPreview = (assignment: Assignment) => {
        setViewingAssignment(assignment);
    };

    if (!assignments || !Array.isArray(assignments.data)) {
        return (
            <AuthenticatedLayout header="Tugas">
                <Head title="Tugas" />
                <div className="p-6">
                    <p className="text-sm text-red-600">Data tugas tidak tersedia.</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header="Tugas"
        >
            <Head title="Tugas" />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Tugas</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau dan kelola semua tugas akademik Anda</p>
                </div>
                <Link
                    href={route('assignments.create')}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-sm active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Tambah Tugas
                </Link>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Judul Tugas
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Mata Pelajaran
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tenggat Waktu
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {assignments.data.map((assignment) => (
                                <tr 
                                    key={assignment.id} 
                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                                    onClick={() => openPreview(assignment)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                                {assignment.title}
                                            </span>
                                            {assignment.description && (
                                                <span className="text-xs text-gray-400 truncate max-w-xs">{assignment.description}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: assignment.subject?.color_code }}
                                            ></div>
                                            <span className="text-gray-600 dark:text-gray-400">{assignment.subject?.name}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
                                            <span className="material-symbols-outlined text-base">calendar_today</span>
                                            {assignment.due_date}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => toggleStatus(assignment.id)}
                                            disabled={isToggling === assignment.id}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-tight transition-all hover:scale-105 active:scale-95 ${
                                                assignment.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                                            } ${isToggling === assignment.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {isToggling === assignment.id ? (
                                                <span className="material-symbols-outlined text-sm animate-spin mr-1">sync</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-sm mr-1">
                                                    {assignment.status === 'Completed' ? 'check_circle' : 'pending'}
                                                </span>
                                            )}
                                            {assignment.status === 'Completed' ? 'Selesai' : 'Belum Selesai'}
                                        </button>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => openPreview(assignment)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                                                title="Pratinjau"
                                            >
                                                <span className="material-symbols-outlined text-xl">visibility</span>
                                            </button>
                                            <Link
                                                href={route('assignments.edit', assignment.id)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(assignment.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                    {assignments.data.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">assignment</span>
                                <p className="text-gray-500 dark:text-gray-400">Belum ada tugas.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {assignments.data.map((assignment) => (
                    <div 
                        key={assignment.id} 
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
                        onClick={() => openPreview(assignment)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: assignment.subject?.color_code }}
                                    ></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        {assignment.subject?.name}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                                    {assignment.title}
                                </h3>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStatus(assignment.id);
                                }}
                                disabled={isToggling === assignment.id}
                                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                                    assignment.status === 'Completed'
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                        : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
                                }`}
                            >
                                {isToggling === assignment.id ? (
                                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-xl">
                                        {assignment.status === 'Completed' ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                )}
                            </button>
                        </div>

                        {assignment.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                {assignment.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                {assignment.due_date}
                            </div>
                            
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Link
                                    href={route('assignments.edit', assignment.id)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </Link>
                                <button
                                    onClick={() => handleDelete(assignment.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {assignments.data.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">assignment</span>
                        <p className="text-gray-500 text-sm font-medium">Belum ada tugas.</p>
                    </div>
                )}
            </div>

            {/* Quick View Drawer */}
            <Drawer show={!!viewingAssignment} onClose={() => setViewingAssignment(null)} maxWidth="xl">
                {viewingAssignment && (
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: viewingAssignment.subject?.color_code }}
                                    ></div>
                                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        {viewingAssignment.subject?.name}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                    {viewingAssignment.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setViewingAssignment(null)}
                                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tenggat Waktu</p>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                                    {viewingAssignment.due_date}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Sekarang</p>
                                <button 
                                    onClick={() => toggleStatus(viewingAssignment.id)}
                                    className={`flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95 ${
                                        viewingAssignment.status === 'Completed' ? 'text-green-600' : 'text-orange-600'
                                    }`}
                                >
                                    <span className="material-symbols-outlined">
                                        {viewingAssignment.status === 'Completed' ? 'check_circle' : 'pending'}
                                    </span>
                                    {viewingAssignment.status === 'Completed' ? 'Selesai' : 'Belum Selesai'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">notes</span>
                                Deskripsi Tugas
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[120px]">
                                {viewingAssignment.description ? (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {viewingAssignment.description}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic text-xs">Tidak ada deskripsi tambahan untuk tugas ini.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    setViewingAssignment(null);
                                    handleDelete(viewingAssignment.id);
                                }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors order-2 sm:order-1"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                                Hapus Tugas
                            </button>
                            
                            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                                <SecondaryButton onClick={() => setViewingAssignment(null)} className="w-full sm:w-auto justify-center">
                                    Tutup
                                </SecondaryButton>
                                <Link
                                    href={route('assignments.edit', viewingAssignment.id)}
                                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-sky-700 transition-colors shadow-sm w-full sm:w-auto"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Edit Detail
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            <ConfirmationModal
                show={isConfirming}
                title="Hapus Tugas"
                message="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirming(false)}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}
