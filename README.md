# GameVault

Aplikasi web katalog game *fullstack* berbasis **Next.js 14 (App Router)**. Terintegrasi dengan **RAWG API** dan **Steam API** untuk menyajikan data game terlengkap, ulasan pemain dari seluruh dunia, serta fitur interaktif seperti favorit dan terjemahan otomatis.

## Fitur Utama

- **Katalog Tanpa Batas (*Endless Scroll*)**: Jelajahi ribuan game tanpa henti berkat integrasi API paginasi *real-time* yang dioptimalkan dengan React Strict Mode yang aman.
- **Steam Crossover**: Menggunakan ID game dari RAWG untuk melacak *App ID* di Steam, menarik **Cover Art Resmi Resolusi Tinggi (HD)** dan **Ulasan Pemain Steam (Steam Player Reviews)** secara otomatis!
- **Kombinasi Ulasan**: Membaca ulasan dari pengguna lokal (situs ini), RAWG, dan Steam dalam satu beranda komentar yang terpadu.
- **Terjemahan Pintar**: Fitur terjemahan otomatis langsung menggunakan integrasi *Google Translate API* untuk mengalihbahasakan ulasan dari gamer luar negeri (Steam/RAWG) ke bahasa Indonesia dengan sekali klik.
- **Visual Resolusi Tinggi**: Menghindari kompresi gambar bawaan Next.js untuk menjaga kualitas *box art* RAWG dan Steam tetap super HD (`unoptimized`).
- **Autentikasi & Favorit**: Daftar akun, login, dan simpan game-game incaranmu ke daftar Favorit.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | **Next.js 14** (App Router, Server Components) |
| Styling | **Tailwind CSS** |
| Database | **PostgreSQL** |
| ORM | **Prisma** |
| Auth | **JWT** (HttpOnly Cookie) |
| API Data | **RAWG API** (`rawg.io`) |
| API Tambahan| **Steam Store API** (App Reviews, App Stores) |
| Terjemahan | **Google Translate API** (Client-side) |