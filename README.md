# GameVault 🎮

Aplikasi web katalog game *fullstack* berbasis **Next.js 14 (App Router)**. Terintegrasi dengan **RAWG API** dan **Steam API** untuk menyajikan data game terlengkap, ulasan pemain dari seluruh dunia, serta fitur interaktif seperti favorit dan terjemahan otomatis.

## 🚀 Fitur Utama

- **Katalog Tanpa Batas (*Endless Scroll*)**: Jelajahi ribuan game tanpa henti berkat integrasi API paginasi *real-time* yang dioptimalkan dengan React Strict Mode yang aman.
- **Steam Crossover**: Menggunakan ID game dari RAWG untuk melacak *App ID* di Steam, menarik **Cover Art Resmi Resolusi Tinggi (HD)** dan **Ulasan Pemain Steam (Steam Player Reviews)** secara otomatis!
- **Kombinasi Ulasan**: Membaca ulasan dari pengguna lokal (situs ini), RAWG, dan Steam dalam satu beranda komentar yang terpadu.
- **Terjemahan Pintar**: Fitur terjemahan otomatis langsung menggunakan integrasi *Google Translate API* untuk mengalihbahasakan ulasan dari gamer luar negeri (Steam/RAWG) ke bahasa Indonesia dengan sekali klik.
- **Visual Resolusi Tinggi**: Menghindari kompresi gambar bawaan Next.js untuk menjaga kualitas *box art* RAWG dan Steam tetap super HD (`unoptimized`).
- **Autentikasi & Favorit**: Daftar akun, login, dan simpan game-game incaranmu ke daftar Favorit.

## 🛠 Tech Stack

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

## 📐 Struktur Direktori

```text
GameVault/
├── app/
│   ├── api/
│   │   ├── auth/          # Register, login, logout, getMe
│   │   ├── games/         # Proxy untuk katalog RAWG
│   │   ├── favorites/     # Toggle & List favorit
│   │   └── reviews/       # Kombinasi ulasan (Lokal + RAWG + Steam)
│   ├── games/[id]/        # Halaman detail game (Crossover Steam)
│   └── page.jsx           # Beranda katalog dengan Masonry & Endless Scroll
├── components/
│   ├── game/              # Komponen khusus UI game (GameCard, ReviewSection)
│   ├── layout/            # Layout utama (Navbar, dll)
│   └── ui/                # Komponen universal (StarRating, Spinner)
├── lib/
│   └── rawg.js            # Sentralisasi komunikasi RAWG API & Crossover
└── prisma/
    └── schema.prisma      # Skema DB (Users, Games, Reviews, Favorites)
```

## 🎨 Design System (Aturan UI)

Proyek ini menggunakan tema estetika premium khusus:
- ❌ **NO GRADIENTS** — semua warna latar wajib *solid*.
- ✅ Latar Belakang Utama: `#121212`
- ✅ Kartu & Header: `#1E1E1E`
- ✅ Aksen & Bintang: `#EAB308` (Muted Gold)
- ✅ Tipografi: **Space Grotesk** (Judul) + **Poppins** (Teks Paragraf)
- ✅ Batas *(Border)* tipis `#2E2E2E` untuk mempertegas pemisahan antar elemen.

---
Dibuat dengan ❤️ untuk para antusias game.
