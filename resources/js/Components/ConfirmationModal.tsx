import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Props {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    processing?: boolean;
}

export default function ConfirmationModal({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    processing = false,
}: Props) {
    return (
        <Modal show={show} onClose={onCancel} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onCancel} disabled={processing}>
                        Batal
                    </SecondaryButton>
                    <DangerButton onClick={onConfirm} disabled={processing}>
                        Ya, Hapus
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
