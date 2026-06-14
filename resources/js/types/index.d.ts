export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    profile_photo_url?: string;
    school_class?: string;
    major?: string;
    institution?: string;
    bio?: string;
    pending_friend_requests_count?: number;
    is_admin?: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
