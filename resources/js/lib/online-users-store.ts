import { create } from 'zustand';

interface OnlineUsersState {
    onlineUserIds: number[];
    setOnlineUsers: (ids: number[]) => void;
    addOnlineUser: (id: number) => void;
    removeOnlineUser: (id: number) => void;
    isOnline: (id: number) => boolean;
}

export const useOnlineUsersStore = create<OnlineUsersState>((set, get) => ({
    onlineUserIds: [],
    setOnlineUsers: (ids) => set({ onlineUserIds: ids }),
    addOnlineUser: (id) => set((state) => ({ 
        onlineUserIds: state.onlineUserIds.includes(id) ? state.onlineUserIds : [...state.onlineUserIds, id] 
    })),
    removeOnlineUser: (id) => set((state) => ({ 
        onlineUserIds: state.onlineUserIds.filter(userId => userId !== id) 
    })),
    isOnline: (id) => get().onlineUserIds.includes(id),
}));
