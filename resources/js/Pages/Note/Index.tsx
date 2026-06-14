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

interface Note {
    id: number;
    subject_id: number | null;
    subject?: Subject;
    title: string;
    category: string;
    content: string;
    image_url?: string | null;
    status: string;
    is_favorite: boolean;
    created_at: string;
    attachments?: { id: number; file_url: string; file_name: string; file_type: string; file_size: number }[];
}

interface Props extends PageProps {
    notes: {
        data: Note[];
    };
}

export default function Index({ auth, notes }: Props) {
    const { delete: destroy, processing } = useForm();
    const [isConfirming, setIsConfirming] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsConfirming(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('notes.destroy', deleteId), {
                onSuccess: () => {
                    setIsConfirming(false);
                    setDeleteId(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header="Catatan"
        >
            <Head title="Catatan" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Catatan</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Simpan ide dan ringkasan pelajaran Anda</p>
                </div>
                <Link
                    href={route('notes.create')}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Tambah Catatan
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notes.data.map((note) => (
                    <div
                        key={note.id}
                        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-1">
                                    {note.title}
                                </h3>
                                {note.is_favorite && (
                                    <span className="material-symbols-outlined text-yellow-400 fill-current">
                                        star
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {note.subject && (
                                    <span 
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                        style={{ color: note.subject.color_code }}
                                    >
                                        <span 
                                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                                            style={{ backgroundColor: note.subject.color_code }}
                                        ></span>
                                        {note.subject.name}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {note.category}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    note.status === 'Completed' 
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
                                    : 'bg-sky-50 dark:bg-sky-900/20 text-primary border border-sky-100 dark:border-sky-900/30'
                                }`}>
                                    {note.status}
                                </span>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4 leading-relaxed">
                                {note.content}
                            </p>

                            {/* Images Gallery */}
                            {(note.image_url || (note.attachments && note.attachments.some(a => a.file_type === 'image'))) && (
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {note.image_url && (
                                        <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-32 col-span-2">
                                            <img src={note.image_url} alt={note.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    {note.attachments?.filter(a => a.file_type === 'image').slice(0, 4).map((img, i, arr) => (
                                        <div key={img.id} className={`rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-24 ${arr.length === 1 && !note.image_url ? 'col-span-2 h-32' : ''} relative`}>
                                            <img src={img.file_url} alt={img.file_name} className="w-full h-full object-cover" />
                                            {i === 3 && note.attachments!.filter(a => a.file_type === 'image').length > 4 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">+{note.attachments!.filter(a => a.file_type === 'image').length - 4}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PDF Links */}
                            {note.attachments && note.attachments.some(a => a.file_type === 'pdf') && (
                                <div className="mt-4 space-y-2">
                                    {note.attachments.filter(a => a.file_type === 'pdf').map(pdf => (
                                        <a 
                                            key={pdf.id} 
                                            href={pdf.file_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group"
                                        >
                                            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1 group-hover:text-red-600 dark:group-hover:text-red-400">{pdf.file_name}</span>
                                            <span className="text-[10px] text-gray-500 shrink-0">{(pdf.file_size / 1024 / 1024).toFixed(1)} MB</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/50 border-t border-gray-50 dark:border-gray-700 flex justify-end gap-2">
                            <Link
                                href={route('notes.edit', note.id)}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </Link>
                            <button
                                onClick={() => handleDelete(note.id)}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Hapus"
                            >
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {notes.data.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">notes</span>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada catatan yang dibuat.</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Mulai catat materi pelajaran Anda sekarang.</p>
                    </div>
                </div>
            )}

            <ConfirmationModal
                show={isConfirming}
                title="Hapus Catatan"
                message="Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirming(false)}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

