import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

window.Pusher = Pusher;

const isProduction = import.meta.env.PROD;
const usePusherAtLocal = import.meta.env.VITE_USE_PUSHER_AT_LOCAL === 'true';

if (isProduction || usePusherAtLocal) {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
        wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1'}.pusher.com`,
        wsPort: import.meta.env.VITE_PUSHER_PORT ? Number(import.meta.env.VITE_PUSHER_PORT) : 80,
        wssPort: import.meta.env.VITE_PUSHER_PORT ? Number(import.meta.env.VITE_PUSHER_PORT) : 443,
        forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    }) as any;
} else {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
    }) as any;
}

// Web Push subscription
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;
}

export async function getPushSubscriptionStatus(): Promise<'subscribed' | 'not_subscribed' | 'permission_denied' | 'unsupported'> {
    if (!isPushSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'permission_denied';

    try {
        const registration = await navigator.serviceWorker.ready;
        if (!registration.pushManager) return 'unsupported';
        const existing = await registration.pushManager.getSubscription();
        return existing ? 'subscribed' : 'not_subscribed';
    } catch {
        return 'unsupported';
    }
}

export async function subscribeToPushNotifications(): Promise<boolean> {
    if (!isPushSupported()) return false;

    try {
        // Request permission if not yet decided
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return false;
        }

        if (Notification.permission === 'denied') return false;

        const registration = await navigator.serviceWorker.ready;
        if (!registration.pushManager) return false;

        // Check for existing subscription
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
            // Re-send to backend in case it was lost
            const json = existing.toJSON();
            await axios.post('/notifications/subscribe', {
                endpoint: json.endpoint,
                keys: {
                    public_key: json.keys?.p256dh || '',
                    auth_token: json.keys?.auth || '',
                },
                content_encoding: 'aes128gcm',
            });
            return true;
        }

        // Create new subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });

        const json = subscription.toJSON();
        await axios.post('/notifications/subscribe', {
            endpoint: json.endpoint,
            keys: {
                public_key: json.keys?.p256dh || '',
                auth_token: json.keys?.auth || '',
            },
            content_encoding: 'aes128gcm',
        });
        return true;
    } catch (err) {
        console.warn('Push subscription failed:', err);
        return false;
    }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!isPushSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return true;

        // Notify backend to remove subscription
        const json = subscription.toJSON();
        await axios.post('/notifications/unsubscribe', {
            endpoint: json.endpoint,
        });

        // Unsubscribe from push manager
        await subscription.unsubscribe();
        return true;
    } catch (err) {
        console.warn('Push unsubscription failed:', err);
        return false;
    }
}

// Auto-subscribe silently if permission already granted (e.g. returning user)
if ('serviceWorker' in navigator && VAPID_PUBLIC_KEY) {
    navigator.serviceWorker.ready.then(() => {
        if (Notification.permission === 'granted') {
            subscribeToPushNotifications();
        }
    });
}
