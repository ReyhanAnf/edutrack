import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

interface Mission {
    id: number;
    name: string;
    description: string;
    type: string;
    requirement: number;
    points_reward: number;
    created_at: string;
}

const MISSION_TYPES = [
    { value: 'total_activity', label: 'Total Aktivitas Belajar' },
    { value: 'total_questions', label: 'Total Pertanyaan' },
    { value: 'total_quizzes', label: 'Total Kuis' },
    { value: 'total_answers', label: 'Total Jawaban' },
    { value: 'streak_days', label: 'Hari Berturut-turut (Streak)' },
];

function getTypeLabel(type: string) {
    return MISSION_TYPES.find(t => t.value === type)?.label ?? type;
}

export default function MissionsIndex({ missions }: { missions: Mission[] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: processingCreate, errors: errorsCreate, reset: resetCreate } = useForm({
        name: '',
        description: '',
        type: 'total_activity',
        requirement: 5,
        points_reward: 50,
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        description: '',
        type: 'total_activity',
        requirement: 5,
        points_reward: 50,
    });

    const openCreateModal = () => {
        resetCreate();
        setCreateData('type', 'total_activity');
        setCreateData('requirement', 5);
        setCreateData('points_reward', 50);
        setIsCreateModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.missions.store'), {
            onSuccess: () => setIsCreateModalOpen(false),
        });
    };

    const openEditModal = (mission: Mission) => {
        setEditingMission(mission);
        setEditData({
            name: mission.name,
            description: mission.description,
            type: mission.type,
            requirement: mission.requirement,
            points_reward: mission.points_reward,
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        putEdit(route('admin.missions.update', editingMission!.id), {
            onSuccess: () => setEditingMission(null),
        });
    };

    const deleteMission = (mission: Mission) => {
        if (confirm(`Yakin ingin menghapus misi "${mission.name}"?`)) {
            router.delete(route('admin.missions.destroy', mission.id));
        }
    };

    const renderForm = (
        data: typeof createData,
        setData: typeof setCreateData,
        errors: typeof errorsCreate,
    ) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Misi</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Contoh: Pemanasan Belajar"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                    rows={2}
                    placeholder="Capai total X aktivitas belajar..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                    <select
                        value={data.type}
                        onChange={e => setData('type', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        {MISSION_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                    <input
                        type="number"
                        value={data.requirement}
                        onChange={e => setData('requirement', parseInt(e.target.value) || 1)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        required
                        min={1}
                    />
                    {errors.requirement && <p className="text-red-500 text-xs mt-1">{errors.requirement}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poin Reward</label>
                    <input
                        type="number"
                        value={data.points_reward}
                        onChange={e => setData('points_reward', parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        required
                        min={0}
                    />
                    {errors.points_reward && <p className="text-red-500 text-xs mt-1">{errors.points_reward}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout header="Kelola Misi">
            <Head title="Kelola Misi" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <div>
                            <h2 className="text-lg font-bold dark:text-white">Daftar Misi</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Kelola misi yang tersedia untuk pengguna</p>
                        </div>
                        <button onClick={openCreateModal} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-colors">
                            + Tambah Misi
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                            <thead className="bg-white dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nama Misi</th>
                                    <th className="px-6 py-4 font-semibold">Deskripsi</th>
                                    <th className="px-6 py-4 font-semibold">Tipe</th>
                                    <th className="px-6 py-4 font-semibold text-center">Target</th>
                                    <th className="px-6 py-4 font-semibold text-center">Poin</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {missions.length > 0 ? missions.map((mission) => (
                                    <tr key={mission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{mission.name}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">{mission.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
                                                {getTypeLabel(mission.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-100">{mission.requirement}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">+{mission.points_reward}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                                            <button onClick={() => openEditModal(mission)} className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Edit</button>
                                            <button onClick={() => deleteMission(mission)} className="text-red-600 dark:text-red-400 hover:underline font-medium">Hapus</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">Belum ada misi. Klik "Tambah Misi" untuk membuat.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Tambah Misi Baru</h2>
                        <form onSubmit={submitCreate}>
                            {renderForm(createData, setCreateData, errorsCreate)}
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingCreate} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingMission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Edit Misi</h2>
                        <form onSubmit={submitEdit}>
                            {renderForm(editData, setEditData, errorsEdit)}
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingMission(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingEdit} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
