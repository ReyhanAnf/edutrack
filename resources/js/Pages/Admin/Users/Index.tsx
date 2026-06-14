import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function UsersIndex({ users, availableRoles }: { users: any[], availableRoles: string[] }) {
    const [editingUser, setEditingUser] = useState<any>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<any>(null);

    const { data: editData, setData: setEditData, patch: patchEdit, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        email: '',
        roles: [] as string[],
    });

    const { data: resetData, setData: setResetData, patch: patchReset, processing: processingReset, errors: errorsReset, reset: resetPwdForm } = useForm({
        password: '',
    });

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            roles: user.roles || [],
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        patchEdit(route('admin.users.update', editingUser.id), {
            onSuccess: () => setEditingUser(null),
        });
    };

    const openResetModal = (user: any) => {
        setResetPasswordUser(user);
        setResetData({ password: '' });
    };

    const submitReset = (e: React.FormEvent) => {
        e.preventDefault();
        patchReset(route('admin.users.reset-password', resetPasswordUser.id), {
            onSuccess: () => setResetPasswordUser(null),
        });
    };

    const toggleActive = (user: any) => {
        if (confirm(`Yakin ingin ${user.is_active ? 'menonaktifkan' : 'mengaktifkan'} pengguna ini?`)) {
            router.patch(route('admin.users.toggle-active', user.id));
        }
    };

    return (
        <AuthenticatedLayout header="Kelola Pengguna">
            <Head title="Kelola Pengguna" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nama</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Peran</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {user.roles.map((role: string) => (
                                                    <span key={role} className="bg-sky-100 dark:bg-sky-900 text-primary px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(user)} className="text-sky-600 dark:text-sky-400 hover:underline text-sm font-medium">Edit</button>
                                            <button onClick={() => openResetModal(user)} className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium">Reset Password</button>
                                            <button onClick={() => toggleActive(user)} className={`${user.is_active ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} hover:underline text-sm font-medium`}>
                                                {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Edit Pengguna</h2>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                                <input type="text" value={editData.name} onChange={e => setEditData('name', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required />
                                {errorsEdit.name && <p className="text-red-500 text-xs mt-1">{errorsEdit.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" value={editData.email} onChange={e => setEditData('email', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required />
                                {errorsEdit.email && <p className="text-red-500 text-xs mt-1">{errorsEdit.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peran (Roles)</label>
                                <div className="space-y-2">
                                    {availableRoles.map(role => (
                                        <label key={role} className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={editData.roles.includes(role)} 
                                                onChange={(e) => {
                                                    const newRoles = e.target.checked 
                                                        ? [...editData.roles, role] 
                                                        : editData.roles.filter(r => r !== role);
                                                    setEditData('roles', newRoles);
                                                }}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="capitalize dark:text-gray-300">{role}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingEdit} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPasswordUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Reset Password</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Masukkan password baru untuk {resetPasswordUser.name}.</p>
                        <form onSubmit={submitReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
                                <input type="text" value={resetData.password} onChange={e => setResetData('password', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required minLength={8} />
                                {errorsReset.password && <p className="text-red-500 text-xs mt-1">{errorsReset.password}</p>}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setResetPasswordUser(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingReset} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Reset Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
