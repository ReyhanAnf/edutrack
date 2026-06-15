import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            outDir: 'public',
            buildBase: '/',
            strategies: 'injectManifest',
            srcDir: 'resources/js',
            filename: 'sw.ts',
            manifest: {
                name: 'EduTrack - AI Learning Network',
                short_name: 'EduTrack',
                description: 'AI-Powered Gamified Social Learning Network',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: '/logo.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
});


// If Use Network Local
// import { defineConfig } from 'vite'
// import laravel from 'laravel-vite-plugin'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: ['resources/css/app.css', 'resources/js/app.tsx'],
//             refresh: true,
//         }),
//         react(),
//     ],

//     server: {
//         host: '0.0.0.0',
//         port: 5173,

//         cors: {
//             origin: [
//                 'http://192.168.100.179:8000',
//             ],
//             credentials: true,
//         },

//         hmr: {
//             host: '192.168.100.179',
//             protocol: 'ws',
//             port: 5173,
//         },
//     },
// })