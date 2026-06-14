import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import OnlineIndicator from '@/Components/OnlineIndicator';

interface User {
    id: number;
    name: string;
    profile_photo_url: string;
    school_class: string | null;
    major: string | null;
    institution: string | null;
    bio: string | null;
    friends_count: number;
    questions_count: number;
    answers_count: number;
}

interface Question {
    id: number;
    title: string;
    created_at: string;
}

interface Props extends PageProps {
    user: User;
    friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
    recentQuestions: Question[];
}

export default function Show({ auth, user, friendshipStatus, recentQuestions }: Props) {
    const { post, delete: destroy, patch, processing } = useForm();

    const handleAddFriend = () => {
        post(route('friends.store', user.id));
    };

    const handleAcceptFriend = () => {
        patch(route('friends.accept', user.id));
    };

    const handleRemoveFriend = () => {
        if (confirm('Apakah Anda yakin ingin menghapus pertemanan ini?')) {
            destroy(route('friends.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout header="Profil Pengguna">
            <Head title={`Profil ${user.name}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header Card */}
                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="relative h-32 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
                    <div className="relative px-6 pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 gap-4">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                                <img
                                    src={user.profile_photo_url}
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md dark:border-gray-800"
                                />
                                <div className="text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{user.name}</h2>
                                        <OnlineIndicator userId={user.id} className="h-3 w-3 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {user.institution || 'Belum ada sekolah/univ'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-center gap-3">
                                {friendshipStatus === 'none' && (
                                    <PrimaryButton onClick={handleAddFriend} disabled={processing}>
                                        <span className="material-symbols-outlined mr-2 text-sm">person_add</span>
                                        Tambah Teman
                                    </PrimaryButton>
                                )}
                                {friendshipStatus === 'pending_sent' && (
                                    <SecondaryButton disabled className="cursor-default opacity-60">
                                        <span className="material-symbols-outlined mr-2 text-sm">hourglass_empty</span>
                                        Permintaan Terkirim
                                    </SecondaryButton>
                                )}
                                {friendshipStatus === 'pending_received' && (
                                    <PrimaryButton onClick={handleAcceptFriend} disabled={processing}>
                                        <span className="material-symbols-outlined mr-2 text-sm">check_circle</span>
                                        Terima Permintaan
                                    </PrimaryButton>
                                )}
                                {friendshipStatus === 'accepted' && (
                                    <SecondaryButton onClick={handleRemoveFriend} disabled={processing} className="text-red-600 hover:text-red-700">
                                        <span className="material-symbols-outlined mr-2 text-sm">person_remove</span>
                                        Hapus Teman
                                    </SecondaryButton>
                                )}
                            </div>
                        </div>

                        {user.bio && (
                            <div className="mt-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tentang Saya</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {user.bio}
                                </p>
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-50 dark:border-gray-700 pt-6">
                            <div className="text-center">
                                <p className="text-xl font-black text-gray-900 dark:text-white">{user.friends_count}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Teman</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-gray-900 dark:text-white">{user.questions_count}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pertanyaan</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-gray-900 dark:text-white">{user.answers_count}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Jawaban</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                            <span className="material-symbols-outlined text-primary">school</span>
                            Informasi Akademik
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kelas</p>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{user.school_class || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jurusan</p>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{user.major || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institusi</p>
                                <p className="text-gray-900 dark:text-gray-200 font-medium">{user.institution || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                            <span className="material-symbols-outlined text-primary">forum</span>
                            Aktivitas Terakhir
                        </h3>
                        <div className="space-y-3">
                            {recentQuestions.map((q) => (
                                <Link
                                    key={q.id}
                                    href={route('questions.show', q.id)}
                                    className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-50 dark:border-gray-700"
                                >
                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{q.title}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{new Date(q.created_at).toLocaleDateString('id-ID')}</p>
                                </Link>
                            ))}
                            {recentQuestions.length === 0 && (
                                <p className="text-sm text-gray-500 italic">Belum ada aktivitas baru.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
