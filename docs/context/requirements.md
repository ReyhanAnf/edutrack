# FITUR UTAMA (CORE FEATURES): GAMIFIED SOCIAL-LEARNING NETWORK

Platform ini meninggalkan pendekatan LMS tradisional dengan membangun ekosistem berbasis tiga pilar utama: **Personalisasi AI, Gamifikasi Bertingkat (Tier-System), dan Interaksi Real-time.**

Berikut adalah penjabaran fungsionalitas utama platform:

### 1\. Dynamic AI Learning Path (Perencanaan Belajar Adaptif)

*   **Onboarding & Continuous Planning:** Saat pertama kali mendaftar, siswa akan dibantu AI untuk menyusun _Learning Plan_ berdasarkan minat dan target mereka. Rencana ini tidak statis; siswa dapat mengubah atau menambah _planning_ belajar kapan saja seiring berjalannya waktu.
*   **Multi-Modal Input:** Siswa dapat mengunggah materi, catatan, atau referensi tidak hanya dalam bentuk teks, tetapi juga **suara (audio) dan gambar**. Untuk menghindari ketergantungan pada layanan API AI pihak ketiga (seperti OpenAI/Gemini) dalam mengekstrak gambar (OCR) dan mentranskripsi suara (Speech-to-Text) yang memakan biaya besar dan _bandwidth_ tinggi, sistem akan memproses _raw data_ (data mentah) secara mandiri menggunakan teknologi gratis/lokal.

### 2\. Intelligent Social Timeline & AI Persona

*   **Linimasa Interaktif:** Jantung utama platform adalah _Timeline_ tempat siswa saling berbagi _update_ pembelajaran.
*   **AI Content Generator (URL Parser):** Fitur revolusioner di mana siswa dapat memasukkan URL berita terbaru (misal: link portal berita atau postingan Facebook). AI di _backend_ akan membaca isi berita tersebut, mengekstrak nilai edukasinya, dan merangkumnya menjadi postingan diskusi interaktif di Linimasa.
*   **Autonomous AI Posts:** AI tidak hanya diam, tetapi bertindak sebagai "pengguna aktif" yang secara otomatis akan memposting _update_ harian, trivia, atau tantangan ke Linimasa untuk memancing diskusi siswa.

### 3\. Real-time Academic Reactions & Interdisciplinary Matching

*   **Reaksi Edukatif (Bukan Sekadar "Like"):** Menggunakan teknologi **Laravel Reverb (WebSockets)**, sistem reaksi dibuat _real-time_ dan bermakna. Siswa tidak memberikan "Like", melainkan reaksi berbasis pembelajaran seperti: 💡 _(Insightful/Mencerahkan)_, 🧠 _(Mind-Blowing/Brilian)_, atau 🔍 _(Needs Review/Perlu Penjelasan)_.
*   **Cross-Interest Synergy (Paduan Lintas Minat):** Algoritma sistem secara cerdas akan mempertemukan perbedaan minat. Contoh: Dalam suatu diskusi atau kelompok, sistem akan memadukan siswa dengan minat _Seni_ dan _Pemrograman_ untuk memecahkan kasus "Desain UI/UX", sehingga diskusi menjadi lintas disiplin ilmu dan tidak membosankan.

### 4\. Tier-System & Gamified Interactive Rooms

*   **Activity Ledger (Log Poin):** Setiap aktivitas sekecil apa pun (berdiskusi, mengunggah materi, mendapat reaksi 💡) akan tercatat dalam _Log Activity_ dan diakumulasikan menjadi _Experience Points_ (XP).
*   **Privilege System (Hak Istimewa Berbasis Tier):** Siswa yang mencapai jumlah XP atau _Tier_ tertentu (misal: Tier "Mentor" atau "Elite") akan mendapatkan hak eksklusif yang tidak dimiliki siswa biasa.
*   **Player-Created Study Groups:** Hanya siswa dengan _Tier_ tinggi (atau Operator) yang memiliki hak untuk membentuk Kelompok Belajar Resmi.
*   **Interactive Mini-Game Rooms:** Siswa dengan _Tier_ tinggi dapat membuat "Room Game Pembelajaran" secara _real-time_ (didukung oleh React & WebSockets). Game ini berupa interaksi seru seperti **Tebak Kata (Vocabulary Charades), Kuis Cepat Terpadu**, atau studi kasus interaktif, yang menjadikan pembelajaran layaknya bermain _multiplayer game_.

### KESELARASAN DENGAN ARSITEKTUR SISTEM (SRS)

*   **Frontend (React + Inertia.js):** Memberikan pengalaman antarmuka yang sangat mulus layaknya _Single Page Application_ (SPA), sangat krusial untuk fitur Linimasa dan Room Game tanpa perlu _reload_ halaman.
*   **WebSockets (Laravel Reverb):** Infrastruktur utama yang memungkinkan "Academic Reactions" dan "Interactive Mini-Games" berjalan secara instan (_real-time communication_).
*   **Queue Worker:** Menangani proses AI yang berat di belakang layar, seperti memproses URL berita, menganalisis gambar/suara, serta mengatur algoritma _Cross-Interest Synergy_ tanpa membuat website menjadi lambat (_non-blocking_).