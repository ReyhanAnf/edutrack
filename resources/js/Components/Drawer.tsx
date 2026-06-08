import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { PropsWithChildren } from 'react';

export default function Drawer({
    children,
    show = false,
    maxWidth = 'md',
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: CallableFunction;
}>) {
    const close = () => {
        if (closeable) onClose();
    };

    const maxWidthClass = {
        sm: 'max-w-lg',
        md: 'max-w-xl',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
    }[maxWidth];

    return (
        <Transition show={show} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-50 overflow-hidden" onClose={close}>
                <div className="absolute inset-0 overflow-hidden">
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="absolute inset-0 bg-gray-500/60" />
                    </TransitionChild>

                    <div className="fixed inset-y-0 right-0 flex max-w-full">
                        <TransitionChild
                            enter="transform transition ease-in-out duration-300"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in-out duration-200"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <div className={`h-full w-screen ${maxWidthClass} bg-white shadow-xl dark:bg-gray-800`}>
                                {children}
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
