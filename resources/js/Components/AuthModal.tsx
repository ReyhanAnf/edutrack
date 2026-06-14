import React from 'react';
import { Link } from '@inertiajs/react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function AuthModal({ isOpen, onClose, title = 'Akses Dibatasi', message = 'Silakan masuk atau daftar terlebih dahulu untuk berinteraksi di platform.' }: AuthModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center transform transition-all">
                <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-3xl text-primary">lock</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
                
                <div className="flex flex-col gap-3">
                    <Link href={route('login')} className="w-full py-3 px-4 text-base font-semibold text-white bg-primary rounded-xl hover:bg-sky-600 transition-colors shadow-sm">
                        Masuk ke Akun
                    </Link>
                    <Link href={route('register')} className="w-full py-3 px-4 text-base font-semibold text-primary bg-sky-50 dark:bg-sky-900/30 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors">
                        Buat Akun Baru
                    </Link>
                </div>
                
                <button onClick={onClose} className="mt-6 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    Nanti saja, lanjutkan melihat
                </button>
            </div>
        </div>
    );
}
