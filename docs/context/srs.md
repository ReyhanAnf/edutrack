Arsitektur Sistem

3.1 Teknologi Utama

Sistem dibangun menggunakan arsitektur modern berbasis monolith modular dengan pendekatan realtime, high-performance, dan scalable application design. Teknologi yang digunakan dipilih untuk memberikan performa tinggi, pengalaman pengguna modern, serta maintainability jangka panjang.



Backend Architecture

Backend dikembangkan menggunakan framework Laravel versi 13 dengan dukungan PHP 8.3+.

Teknologi Backend

Teknologi

Fungsi

PHP 8.3+

Bahasa pemrograman utama backend

Laravel 13

Framework utama aplikasi

Laravel Reverb

Web socket

Queue Worker

Pemrosesan asynchronous task





Laravel 13

Laravel digunakan sebagai fondasi utama sistem karena menyediakan:

clean architecture support,

expressive syntax,

ecosystem yang lengkap,

serta maintainability tinggi.

Framework ini menangani:

routing,

middleware,

authentication,

authorization,

queue,

event broadcasting,

caching,

dan ORM database.

Frontend Architecture

Frontend dibangun menggunakan pendekatan modern reactive web application dengan SPA-like experience menggunakan kombinasi React, Inertia.js, dan TypeScript.

Teknologi Frontend

Teknologi

Fungsi

React

Library frontend utama

Inertia.js

Bridge antara Laravel dan React

TypeScript

Type-safe frontend development

Tailwind CSS

Utility-first CSS framework

ShadCN UI

Reusable modern UI component system

Vite

Frontend bundler dan development server



React

React digunakan untuk membangun antarmuka pengguna interaktif dan reactive.

React dipilih karena:

component-based architecture,

reusable UI pattern,

ecosystem besar,

serta kompatibilitas tinggi dengan modern frontend tooling.

Inertia.js

Inertia.js digunakan untuk menghubungkan Laravel dengan React tanpa membangun REST API tradisional secara penuh.

Keuntungan:

SPA experience,

routing tetap menggunakan Laravel,

development lebih cepat,

struktur aplikasi lebih sederhana.

TypeScript

TypeScript digunakan untuk meningkatkan type safety dan maintainability frontend application.

Manfaat:

mengurangi bug runtime,

autocomplete lebih baik,

scalable codebase,

dan developer experience yang lebih modern.

Tailwind CSS

Tailwind CSS digunakan sebagai utility-first CSS framework untuk membangun UI yang konsisten, responsive, dan modern.

Keuntungan:

development UI lebih cepat,

konsistensi design system,

fleksibilitas styling tinggi,

ukuran CSS production lebih kecil.

ShadCN UI

shadcn/ui digunakan sebagai reusable component system berbasis React dan Tailwind CSS.

ShadCN UI dipilih karena:

modern design system,

accessible component architecture,

highly customizable,

clean code structure,

dan enterprise-grade UI quality.

Komponen yang digunakan meliputi:

Data Table

Dialog / Modal

Form Components

Tabs

Dropdown Menu

Command Palette

Toast Notification

Sheet / Drawer

Calendar

Sidebar Navigation

Vite

Vite digunakan sebagai modern frontend build tool.

Keuntungan:

hot module replacement sangat cepat,

build production optimal,

startup development server ringan.

Database Architecture

Sistem menggunakan relational database management system.

Teknologi Database

Teknologi

Fungsi

MySQL 

Database production



MySQL 

Digunakan untuk production environment karena:

stabilitas tinggi,

transactional support,

indexing dan optimization,

scalability,

serta reliability.





Infrastructure Architecture

Infrastructure dirancang untuk mendukung realtime system dan asynchronous processing.

Queue Worker

Queue worker digunakan untuk asynchronous processing seperti:

email sending,

notification dispatch,

file processing,

AI processing,

dan scheduled jobs.

Tujuan:

mengurangi blocking request,

meningkatkan responsiveness aplikasi.

WebSocket Server - Laravel Reverb

WebSocket server digunakan untuk:

realtime communication,

instant notification delivery,

live data synchronization,

dan collaborative features.

Implementasi menggunakan Laravel Reverb dengan Redis broadcasting layer.