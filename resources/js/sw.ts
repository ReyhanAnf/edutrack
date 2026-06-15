/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

// Precache static assets (CSS, JS, images injected by Vite PWA)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Navigation requests go to network (Laravel renders app.blade.php server-side)
// No SPA fallback needed — this is a server-rendered Inertia.js app.

self.addEventListener('push', (event: PushEvent) => {
    if (!event.data) return;

    let data: any;
    try {
        data = event.data.json();
    } catch {
        data = { title: 'EduTrack', body: event.data.text() };
    }

    const title = data.title || 'EduTrack';
    const options = {
        body: data.body || '',
        icon: data.icon || '/logo.png',
        badge: '/logo.png',
        tag: data.tag || 'edutrack',
        data: { url: data.url || '/', extra: data.data || {} },
        vibrate: [100, 50, 100],
        renotify: true,
        requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';

    // Normalize URL: extract pathname + hash for comparison (PWA clients have origin in url)
    let targetPath: string;
    try {
        const parsed = new URL(targetUrl);
        targetPath = parsed.pathname + parsed.search + parsed.hash;
    } catch {
        targetPath = targetUrl;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // Try to focus an existing window showing the same page
            for (const client of clients) {
                let clientPath: string;
                try {
                    const parsed = new URL(client.url);
                    clientPath = parsed.pathname + parsed.search + parsed.hash;
                } catch {
                    clientPath = client.url;
                }
                if (clientPath === targetPath && 'focus' in client) {
                    return (client as WindowClient).focus();
                }
            }
            // Open new window if no match
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
