import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function RolesIndex({ roles, permissions }: { roles: any[], permissions: any[] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);

    const [isCreatePermModalOpen, setIsCreatePermModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<any>(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: processingCreate, errors: errorsCreate, reset: resetCreate } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, errors: errorsEdit, reset: resetEdit } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const { data: createPermData, setData: setCreatePermData, post: postCreatePerm, processing: processingCreatePerm, errors: errorsCreatePerm, reset: resetCreatePerm } = useForm({
        name: '',
    });

    const { data: editPermData, setData: setEditPermData, put: putEditPerm, processing: processingEditPerm, errors: errorsEditPerm, reset: resetEditPerm } = useForm({
        name: '',
    });

    const openCreateModal = () => {
        resetCreate();
        setIsCreateModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.roles.store'), {
            onSuccess: () => setIsCreateModalOpen(false),
        });
    };

    const openEditModal = (role: any) => {
        setEditingRole(role);
        setEditData({
            name: role.name,
            permissions: role.permissions.map((p: any) => p.name) || [],
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        putEdit(route('admin.roles.update', editingRole.id), {
            onSuccess: () => setEditingRole(null),
        });
    };

    const deleteRole = (role: any) => {
        if (confirm(`Yakin ingin menghapus peran ${role.name}?`)) {
            router.delete(route('admin.roles.destroy', role.id));
        }
    };

    const isSystemRole = (name: string) => ['super admin', 'admin', 'user'].includes(name);

    // Permission actions
    const openCreatePermModal = () => {
        resetCreatePerm();
        setIsCreatePermModalOpen(true);
    };

    const submitCreatePerm = (e: React.FormEvent) => {
        e.preventDefault();
        postCreatePerm(route('admin.permissions.store'), {
            onSuccess: () => setIsCreatePermModalOpen(false),
        });
    };

    const openEditPermModal = (perm: any) => {
        setEditingPermission(perm);
        setEditPermData({ name: perm.name });
    };

    const submitEditPerm = (e: React.FormEvent) => {
        e.preventDefault();
        putEditPerm(route('admin.permissions.update', editingPermission.id), {
            onSuccess: () => setEditingPermission(null),
        });
    };

    const deletePermission = (perm: any) => {
        if (confirm(`Yakin ingin menghapus hak akses ${perm.name}? Ini akan menghapusnya dari semua peran.`)) {
            router.delete(route('admin.permissions.destroy', perm.id));
        }
    };

    return (
        <AuthenticatedLayout header="Kelola Peran & Hak Akses">
            <Head title="Kelola Peran & Hak Akses" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <h2 className="text-lg font-bold dark:text-white">Daftar Peran (Roles)</h2>
                        <button onClick={openCreateModal} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-colors">
                            + Tambah Peran
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                            <thead className="bg-white dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nama Peran</th>
                                    <th className="px-6 py-4 font-semibold">Hak Akses (Permissions)</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {roles.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 capitalize">{role.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {role.permissions.length > 0 ? role.permissions.map((p: any) => (
                                                    <span key={p.id} className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                        {p.name}
                                                    </span>
                                                )) : <span className="text-gray-400 text-xs italic">Belum ada izin spesifik</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => openEditModal(role)} className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Edit</button>
                                            {!isSystemRole(role.name) && (
                                                <button onClick={() => deleteRole(role)} className="text-red-600 dark:text-red-400 hover:underline font-medium">Hapus</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Permissions Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <h2 className="text-lg font-bold dark:text-white">Daftar Hak Akses (Permissions)</h2>
                        <button onClick={openCreatePermModal} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-colors">
                            + Tambah Akses
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                            <thead className="bg-white dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nama Hak Akses</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {permissions.length > 0 ? permissions.map((perm) => (
                                    <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{perm.name}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => openEditPermModal(perm)} className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Edit</button>
                                            <button onClick={() => deletePermission(perm)} className="text-red-600 dark:text-red-400 hover:underline font-medium">Hapus</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-8 text-center text-gray-500 italic">Belum ada hak akses. Silakan tambahkan.</td>
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
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Tambah Peran Baru</h2>
                        <form onSubmit={submitCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Peran</label>
                                <input type="text" value={createData.name} onChange={e => setCreateData('name', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required placeholder="Contoh: moderator" />
                                {errorsCreate.name && <p className="text-red-500 text-xs mt-1">{errorsCreate.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hak Akses</label>
                                {permissions.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        {permissions.map(p => (
                                            <label key={p.id} className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={createData.permissions.includes(p.name)} 
                                                    onChange={(e) => {
                                                        const newPerms = e.target.checked 
                                                            ? [...createData.permissions, p.name] 
                                                            : createData.permissions.filter(name => name !== p.name);
                                                        setCreateData('permissions', newPerms);
                                                    }}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm dark:text-gray-300">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">Belum ada data izin (permissions) di database.</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingCreate} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Edit Peran</h2>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Peran</label>
                                <input type="text" value={editData.name} onChange={e => setEditData('name', e.target.value)} disabled={isSystemRole(editingRole.name)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900" required />
                                {isSystemRole(editingRole.name) && <p className="text-amber-500 text-xs mt-1">Nama peran sistem tidak dapat diubah.</p>}
                                {errorsEdit.name && <p className="text-red-500 text-xs mt-1">{errorsEdit.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hak Akses</label>
                                {permissions.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        {permissions.map(p => (
                                            <label key={p.id} className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={editData.permissions.includes(p.name)} 
                                                    onChange={(e) => {
                                                        const newPerms = e.target.checked 
                                                            ? [...editData.permissions, p.name] 
                                                            : editData.permissions.filter(name => name !== p.name);
                                                        setEditData('permissions', newPerms);
                                                    }}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm dark:text-gray-300">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">Belum ada data izin (permissions) di database.</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingRole(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingEdit} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Permission Modal */}
            {isCreatePermModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Tambah Hak Akses</h2>
                        <form onSubmit={submitCreatePerm} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Hak Akses</label>
                                <input type="text" value={createPermData.name} onChange={e => setCreatePermData('name', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required placeholder="Contoh: edit-post" />
                                {errorsCreatePerm.name && <p className="text-red-500 text-xs mt-1">{errorsCreatePerm.name}</p>}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsCreatePermModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingCreatePerm} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Permission Modal */}
            {editingPermission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Edit Hak Akses</h2>
                        <form onSubmit={submitEditPerm} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Hak Akses</label>
                                <input type="text" value={editPermData.name} onChange={e => setEditPermData('name', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" required />
                                {errorsEditPerm.name && <p className="text-red-500 text-xs mt-1">{errorsEditPerm.name}</p>}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingPermission(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Batal</button>
                                <button type="submit" disabled={processingEditPerm} className="px-4 py-2 rounded-lg bg-primary text-white font-medium">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
