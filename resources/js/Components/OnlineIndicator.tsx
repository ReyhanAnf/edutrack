import { useOnlineUsersStore } from '@/lib/online-users-store';

export default function OnlineIndicator({ userId, className = "" }: { userId: number, className?: string }) {
    const isOnline = useOnlineUsersStore((state) => state.isOnline(userId));

    if (!isOnline) return null;

    return (
        <span 
            className={`flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] ${className}`} 
            title="Sedang Aktif" 
        />
    );
}
