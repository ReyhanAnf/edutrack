import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:bg-sky-950/40">
                        <span className="material-symbols-outlined text-[14px]">login</span>
                        Selamat datang kembali
                    </p>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Masuk ke Edutrack</h1>
                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                            Lanjutkan belajar, lihat timeline real-time, dan dukung jawaban yang paling membantu.
                        </p>
                    </div>
                </div>

                {status && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-none transition-colors focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="space-y-1.5">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-none transition-colors focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span>Ingat saya di perangkat ini</span>
                    </label>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        {canResetPassword ? (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-gray-600 underline-offset-4 transition hover:text-primary hover:underline dark:text-gray-400"
                            >
                                Lupa password?
                            </Link>
                        ) : (
                            <span />
                        )}

                        <PrimaryButton className="inline-flex justify-center rounded-xl px-5 py-3 text-sm font-semibold" disabled={processing}>
                            Masuk
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
