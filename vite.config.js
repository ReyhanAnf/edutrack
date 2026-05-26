import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
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