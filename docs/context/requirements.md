FITUR UTAMA (CORE FEATURES): GAMIFIED SOCIAL-LEARNING NETWORK (BRAINLY + AI)

Platform ini mengusung konsep "Crowdsourced Knowledge meets Generative AI"—menggabungkan kekuatan komunitas ala Brainly dengan AI sebagai fasilitator, tutor, dan kurator. Ekosistem ini dibangun di atas tiga pilar utama: Personalisasi AI, Gamifikasi Bertingkat (Tier-System), dan Interaksi Real-time.

Berikut adalah penjabaran fungsionalitas utama platform beserta pemetaan arsitektur sistemnya:

1. AI-Powered Q&A & Adaptive Learning Path (Tanya-Jawab & Perencanaan)

Tidak hanya sekadar bertanya, AI bertindak sebagai pendamping yang membimbing, bukan sekadar memberi jawaban instan.

Smart Question Analyzer & Step-by-Step AI Tutor: Saat siswa bertanya atau mengunggah soal ujian, AI tidak langsung memberikan jawaban akhir. AI akan memecah soal tersebut menjadi langkah-langkah penyelesaian (hints) untuk memancing siswa berpikir, atau merekomendasikan materi dasar yang harus dipelajari terlebih dahulu.

Multi-Modal Input (Local Processing): Siswa dapat mengunggah soal matematika atau catatan dalam bentuk gambar (foto soal) atau suara (audio). Sistem menggunakan Open-Source Engine (seperti Tesseract OCR lokal atau Whisper Whisper.cpp) di background untuk menghemat biaya API pihak ketiga.

Onboarding & Dynamic Planning: AI menyusun Learning Plan berdasarkan riwayat pencarian, mata pelajaran yang sering ditanyakan, dan target siswa (misal: Persiapan UTBK/SNBT).

2. Intelligent Social Timeline & AI Persona (Linimasa Pengetahuan)

Linimasa (Feed) berisi diskusi tren, pertanyaan yang belum terjawab, dan kurasi pengetahuan.

AI Content Generator (URL/Document Parser): Siswa dapat membagikan link berita, jurnal, atau video. AI di backend akan membaca isi tautan tersebut dan merangkumnya menjadi poin-poin edukatif untuk didiskusikan di Linimasa.

Autonomous AI Posts & "Bounty" System: AI bertindak sebagai pengguna aktif. Jika ada pertanyaan sulit di platform yang belum terjawab selama 15 menit, AI akan secara otomatis menaikkan "Bounty" (hadiah XP tambahan) untuk memancing siswa Tier atas menjawabnya, atau AI akan memberikan satu hint (petunjuk) tambahan di kolom komentar.

Crowdsourced Verification: Jawaban terbaik dipilih oleh penanya, namun sistem memiliki validasi komunitas (Upvote) dan validasi AI (AI memberikan lencana "Terverifikasi Sesuai Teori" pada jawaban pengguna yang sangat akurat).

3. Real-time Collaborative Problem Solving & Matching

Interaksi akademik yang terjadi secara instan tanpa perlu memuat ulang halaman.

Real-time Academic Reactions: Menggunakan Laravel Reverb, interaksi tidak menggunakan "Like" biasa, melainkan: 💡 (Mencerahkan), 🧠 (Brilian), 🔍 (Perlu Penjelasan Lebih/Ragu), atau 🤝 (Setuju dengan Solusi).

Cross-Interest Synergy & Expert Summoning: Jika sebuah pertanyaan menggabungkan dua ilmu (Misal: "Sejarah Ekonomi"), algoritma akan mengirimkan Push Notification secara otomatis, "memanggil" (summon) siswa dengan Tier tinggi di Sejarah dan Tier tinggi di Ekonomi untuk berkolaborasi menjawab di satu thread yang sama.

4. Tier-System & Gamified Interactive Rooms

Gamifikasi yang mendalam untuk retensi pengguna jangka panjang.

Subject-Specific Tiers (Spesialisasi): XP tidak bersifat umum. Pengguna memiliki Tier per mata pelajaran (misal: "Grandmaster Matematika", "Novice Fisika"). Aktivitas menjawab, mengunggah catatan, atau mendapat reaksi 🧠 akan menambah XP di spesialisasi tersebut.

Privilege System (Hak Istimewa): Siswa dengan Tier Expert/Mentor dapat mengakses fitur moderasi, seperti memverifikasi jawaban siswa level bawah atau membuat Kelompok Belajar Resmi.

Interactive Mini-Game Rooms (Study Arenas): Tier atas dapat membuat "Room" belajar interaktif. Tersedia mode seperti Live Quiz Battle (AI men-generate soal dari materi yang sedang dibahas dan grup berlomba menjawab cepat) atau Study Case Room (kolaborasi memecahkan masalah dengan real-time whiteboard/text editor).

IMPLEMENTASI ARSITEKTUR: DOMAIN - SERVICE - ACTION (DSA) PATTERN

Untuk memastikan sistem siap digunakan sebagai API (Headless Ready) dan mudah di- scale ke Mobile App (Flutter/Kotlin) di masa depan, arsitektur di-refactor menggunakan pattern DSA.

A. Domain QuestionAnswer

Menangani inti dari "Brainly": Pertanyaan, Jawaban, dan Multimodal Input.

Actions:

ExtractTextFromMediaAction (Memproses gambar/audio lewat lokal OCR/STT).

CreateQuestionAction (Menyimpan pertanyaan ke DB).

SubmitAnswerAction (Menyimpan jawaban dari pengguna).

MarkAsBrainliestAction (Menandai jawaban terbaik).

Services:

QuestionWorkflowService -> Mengorkestrasi aksi. (Misal: Jika user kirim foto -> Panggil ExtractTextFromMediaAction -> lalu panggil CreateQuestionAction).

B. Domain Gamification

Menangani XP, Tier, dan Bounty.

Actions:

CalculateExperiencePointAction (Menghitung XP berdasarkan bobot aktivitas).

AwardUserExpAction (Menambahkan XP ke Subject spesifik pengguna).

CheckAndUpgradeTierAction (Mengevaluasi apakah XP cukup untuk naik level).

CreateBountyAction (Mengunci XP tambahan untuk pertanyaan sulit).

Services:

UserAchievementService -> Dipanggil oleh Event Listener setiap kali user melakukan sesuatu (misal: menjawab), service ini menjalankan aksi-aksi di atas.

C. Domain ArtificialIntelligence

Semua interaksi dengan AI (Lokal maupun API Pihak Ketiga).

Actions:

GenerateStepByStepHintAction (Prompting AI untuk membuat panduan, bukan jawaban).

ParseUrlContentAction (Scraping & merangkum link berita).

ValidateUserAnswerAction (AI memvalidasi kebenaran jawaban siswa secara asinkron).

Services:

AIAssistantService -> Menghubungkan Trigger aplikasi dengan model AI yang tepat.

D. Domain SocialInteraction

Menangani Linimasa, WebSockets, dan Reaksi.

Actions:

CreateTimelinePostAction.

LogAcademicReactionAction (Mencatat reaksi 💡, 🧠 ke DB).

FindCrossInterestUsersAction (Algoritma pencarian user Tier tinggi untuk di-summon).

Services:

RealtimeInteractionService -> Memastikan setelah LogAcademicReactionAction selesai, sistem akan memicu Broadcasting ke Laravel Reverb.

KESELARASAN DENGAN ARSITEKTUR TEKNOLOGI (SRS)

Frontend (React/Vue + Inertia.js): * Sangat ideal untuk membangun komponen SPA Brainly-like. Saat pengguna membuka sebuah pertanyaan, mereka bisa langsung melihat jawaban masuk (typing indicator) tanpa perlu memuat ulang halaman.

WebSockets (Laravel Reverb):

Diimplementasikan pada RealtimeInteractionService untuk Live Academic Reactions, Notifikasi pemanggilan (Summoning), dan sinkronisasi di dalam Interactive Mini-Game Rooms.

Queue & Job Worker (Redis/Database):

WAJIB digunakan untuk membungkus Domain ArtificialIntelligence. Proses seperti OCR gambar ExtractTextFromMediaAction atau Scraping URL ParseUrlContentAction akan memakan waktu 2-10 detik. Ini harus dilempar ke Background Job agar tidak memblokir antarmuka pengguna.