import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import OnlineIndicator from '@/Components/OnlineIndicator';

interface Friend {
    id: number;
    name: string;
    profile_photo_url: string;
    institution: string | null;
}

interface Props extends PageProps {
    friends: Friend[];
    pendingRequests: Friend[];
    sentRequests: Friend[];
}

export default function Friends({ auth, friends, pendingRequests, sentRequests }: Props) {
    const { patch, delete: destroy, processing } = useForm();

    const handleAccept = (id: number) => {
        patch(route('friends.accept', id));
    };

    const handleRemove = (id: number) => {
        if (confirm('Apakah Anda yakin?')) {
            destroy(route('friends.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="Teman Belajar">
            <Head title="Teman Belajar" />

            <div className="mx-auto max-w-5xl space-y-8">
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <section>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-orange-500 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            Permintaan Pertemanan ({pendingRequests.length})
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative">
                                            <img src={req.profile_photo_url} alt={req.name} className="h-10 w-10 rounded-full object-cover" />
                                            <OnlineIndicator userId={req.id} className="absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-gray-800" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{req.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{req.institution || 'No Institution'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleAccept(req.id)}
                                            className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">check</span>
                                        </button>
                                        <button 
                                            onClick={() => handleRemove(req.id)}
                                            className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Friends List */}
                <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">group</span>
                        Teman Belajar ({friends.length})
                    </h2>
                    
                    {friends.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {friends.map((friend) => (
                                <div key={friend.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                        <div className="relative">
                                            <img src={friend.profile_photo_url} alt={friend.name} className="h-14 w-12 sm:h-12 sm:w-12 rounded-full object-cover" />
                                            <OnlineIndicator userId={friend.id} className="absolute bottom-0 right-0 border-2 border-white dark:border-gray-800 h-3 w-3 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-center sm:justify-start gap-1.5">
                                                <Link href={route('users.show', friend.id)} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors truncate block">
                                                    {friend.name}
                                                </Link>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{friend.institution || 'No Institution'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                                        <Link 
                                            href={route('users.show', friend.id)}
                                            className="flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-primary transition-colors bg-gray-50 dark:bg-gray-900 rounded-lg"
                                        >
                                            Lihat Profil
                                        </Link>
                                        <button 
                                            onClick={() => handleRemove(friend.id)}
                                            className="px-3 py-2 text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">person_remove</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">person_search</span>
                            <p className="text-gray-500 font-medium italic">Belum ada teman belajar. Cari teman dari timeline!</p>
                        </div>
                    )}
                </section>

                {/* Sent Requests */}
                {sentRequests.length > 0 && (
                    <section className="opacity-75">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">forward_to_inbox</span>
                            Permintaan Terkirim ({sentRequests.length})
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {sentRequests.map((req) => (
                                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img src={req.profile_photo_url} alt={req.name} className="h-10 w-10 rounded-full object-cover grayscale" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{req.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">Menunggu konfirmasi...</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemove(req.id)}
                                        className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest"
                                    >
                                        Batal
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
