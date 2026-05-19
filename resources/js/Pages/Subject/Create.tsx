import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FormEventHandler } from 'react';

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        color_code: '#0284c7',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('subjects.store'));
    };

    return (
        <AuthenticatedLayout
            header="Tambah Pelajaran"
        >
            <Head title="Tambah Pelajaran" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Buat Mata Pelajaran Baru</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tambahkan subjek baru untuk membantu Anda mengelola studi</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Pelajaran" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Matematika, Fisika, dsb."
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="color_code" value="Warna Label" />
                                <div className="mt-1 flex items-center gap-3">
                                    <input
                                        id="color_code"
                                        type="color"
                                        name="color_code"
                                        value={data.color_code}
                                        className="h-10 w-10 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-sky-500 focus:ring-sky-500 cursor-pointer"
                                        onChange={(e) => setData('color_code', e.target.value)}
                                        required
                                    />
                                    <TextInput
                                        type="text"
                                        value={data.color_code}
                                        className="block w-full"
                                        onChange={(e) => setData('color_code', e.target.value)}
                                        maxLength={7}
                                    />
                                </div>
                                <InputError message={errors.color_code} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Link
                                    href={route('subjects.index')}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Simpan Pelajaran
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
