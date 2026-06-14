import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const photoInput = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'patch',
            name: user.name,
            email: user.email,
            photo: null as File | null,
            school_class: user.school_class || '',
            major: user.major || '',
            institution: user.institution || '',
            bio: user.bio || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
                if (photoInput.current) {
                    photoInput.current.value = '';
                }
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectNewPhoto = () => {
        photoInput.current?.click();
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Informasi Profil
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Perbarui informasi profil akun dan alamat email Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Profile Photo */}
                <div>
                    <InputLabel value="Foto Profil" />
                    
                    <div className="mt-2 flex items-center gap-5">
                        <div className="relative">
                            {photoPreview ? (
                                <img 
                                    src={photoPreview} 
                                    className="h-20 w-20 rounded-full object-cover border-2 border-primary" 
                                    alt="Preview" 
                                />
                            ) : (
                                <img 
                                    src={user.profile_photo_url} 
                                    className="h-20 w-20 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                                    alt={user.name} 
                                />
                            )}
                            
                            <button
                                type="button"
                                onClick={selectNewPhoto}
                                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-transform hover:scale-110 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <button
                                type="button"
                                onClick={selectNewPhoto}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                Unggah Foto Baru
                            </button>
                            <p className="text-xs text-gray-500">JPG atau PNG. Maksimal 2MB.</p>
                        </div>
                    </div>

                    <input
                        type="file"
                        className="hidden"
                        ref={photoInput}
                        onChange={handlePhotoChange}
                        accept="image/*"
                    />

                    <InputError className="mt-2" message={errors.photo} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" />

                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Alamat Email" />

                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <InputLabel htmlFor="school_class" value="Kelas" />

                        <TextInput
                            id="school_class"
                            className="mt-1 block w-full"
                            value={data.school_class}
                            onChange={(e) => setData('school_class', e.target.value)}
                            placeholder="Contoh: 12 IPA 1"
                        />

                        <InputError className="mt-2" message={errors.school_class} />
                    </div>

                    <div>
                        <InputLabel htmlFor="major" value="Jurusan" />

                        <TextInput
                            id="major"
                            className="mt-1 block w-full"
                            value={data.major}
                            onChange={(e) => setData('major', e.target.value)}
                            placeholder="Contoh: Teknik Informatika"
                        />

                        <InputError className="mt-2" message={errors.major} />
                    </div>

                    <div>
                        <InputLabel htmlFor="institution" value="Asal Sekolah / Universitas" />

                        <TextInput
                            id="institution"
                            className="mt-1 block w-full"
                            value={data.institution}
                            onChange={(e) => setData('institution', e.target.value)}
                            placeholder="Contoh: SMA Negeri 1 Jakarta"
                        />

                        <InputError className="mt-2" message={errors.institution} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="bio" value="Bio / Tentang Saya" />

                    <textarea
                        id="bio"
                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary"
                        rows={4}
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Ceritakan sedikit tentang dirimu..."
                    />

                    <InputError className="mt-2" message={errors.bio} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <PrimaryButton disabled={processing} className="px-8">Simpan Perubahan</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            Berhasil disimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
