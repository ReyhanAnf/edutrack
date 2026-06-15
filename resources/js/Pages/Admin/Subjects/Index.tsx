import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router } from '@inertiajs/react';

interface GlobalSubject {
    id: number;
    name: string;
    color_code: string;
    users_count: number;
    created_at: string;
}

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b',
];

export default function SubjectsIndex({ subjects }: { subjects: GlobalSubject[] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<GlobalSubject | null>(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: processingCreate, errors: errorsCreate, reset: resetCreate } = useForm({
        name: '',
        color_code: '#3b82f6',
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        color_code: '#3b82f6',
    });

    const openCreateModal = () => {
        resetCreate();
        setCreateData('color_code', '#3b82f6');
        setIsCreateModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.subjects.store'), {
            onSuccess: () => setIsCreateModalOpen(false),
        });
    };

    const openEditModal = (subject: GlobalSubject) => {
        setEditingSubject(subject);
        setEditData({ name: subject.name, color_code: subject.color_code });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        putEdit(route('admin.subjects.update', editingSubject!.id), {
            onSuccess: () => setEditingSubject(null),
        });
    };

    const deleteSubject = (subject: GlobalSubject) => {
        if (confirm(`Yakin ingin menghapus "${subject.name}"?`)) {
            router.delete(route('admin.subjects.destroy', subject.id));
        }
    };

    const renderForm = (
        data: typeof createData,
        setData: typeof setCreateData,
        errors: typeof errorsCreate,
    ) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Mata Pelajaran</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Contoh: Matematika"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warna</label>
                <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(color => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setData('color_code', color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${data.color_code === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <input
                    type="text"
                    value={data.color_code}
                    onChange={e => setData('color_code', e.target.value)}
                    className="mt-2 w-28 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm font-mono"
                    placeholder="#3b82f6"
                />
                {errors.color_code && <p className="text-red-500 text-xs mt-1">{errors.color_code}</p>}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout header="Kelola Mata Pelajaran">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Mata Pelajaran</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Mata pelajaran di sini akan muncul untuk semua pengguna.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        Tambah
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {subjects.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">book_2</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Belum Ada Mata Pelajaran</h3>
                            <p className="text-gray-500 dark:text-gray-400">Klik tombol "Tambah" untuk membuat mata pelajaran pertama.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {subjects.map(subject => (
                                <li key={subject.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="h-10 w-10 shrink-0 rounded-xl shadow-sm border border-white dark:border-gray-700"
                                            style={{ backgroundColor: subject.color_code }}
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{subject.name}</p>
                                            <p className="text-xs text-gray-400">{subject.users_count} pengguna</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(subject)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button
                                            onClick={() => deleteSubject(subject)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white">Tambah Mata Pelajaran</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={submitCreate} className="p-6 space-y-4">
                            {renderForm(createData, setCreateData, errorsCreate)}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={processingCreate} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50">
                                    {processingCreate ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white">Edit Mata Pelajaran</h3>
                            <button onClick={() => setEditingSubject(null)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={submitEdit} className="p-6 space-y-4">
                            {renderForm(editData, setEditData, errorsEdit)}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingSubject(null)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={processingEdit} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50">
                                    {processingEdit ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
