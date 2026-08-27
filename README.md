# GameVault 🎮

Aplikasi web katalog game fullstack berbasis **Next.js 14 (App Router)**, mengintegrasikan **RAWG API** untuk data game real-time, dengan fitur autentikasi, favorit, dan review/rating pengguna.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (HttpOnly Cookie) |
| API Data | RAWG API (rawg.io) |

## Struktur Direktori

```
GameVault/
├── app/
│   ├── api/
│   │   ├── auth/          # register, login, logout, me
│   │   ├── games/         # RAWG proxy + [id] proxy
│   │   ├── favorites/     # Toggle & list favorites
│   │   └── reviews/       # Submit & fetch reviews
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── favorites/
│   ├── games/[id]/        # Game detail page
│   ├── globals.css
│   ├── layout.jsx
│   ├── not-found.jsx
│   └── page.jsx           # Catalog-first homepage
├── components/
│   ├── game/
│   │   ├── FavoriteButton.jsx
│   │   ├── FilterBar.jsx
│   │   ├── GameCard.jsx
│   │   ├── HeroSection.jsx
│   │   ├── MasonryGrid.jsx
│   │   ├── ReviewSection.jsx
│   │   └── ScreenshotGallery.jsx
│   ├── layout/
│   │   └── Navbar.jsx
│   └── ui/
│       ├── LoadingSpinner.jsx
│       └── StarRating.jsx
├── contexts/
│   └── AuthContext.jsx
├── lib/
│   ├── auth.js            # JWT utilities
│   ├── prisma.js          # Prisma singleton
│   └── rawg.js            # RAWG API service
├── prisma/
│   └── schema.prisma
├── services/db/
│   ├── favorites.js
│   ├── reviews.js
│   └── users.js
├── .env.example
├── next.config.js
└── tailwind.config.js
```

## Setup & Instalasi

### 1. Clone & Install

```bash
git clone <repo-url> gamevault
cd gamevault
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gamevault?schema=public"
RAWG_API_KEY="your_rawg_api_key"
JWT_SECRET="random_64_char_string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **RAWG API Key:** Daftar gratis di [rawg.io/apidocs](https://rawg.io/apidocs)
>
> **JWT Secret:** Generate dengan: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 3. Database Setup

```bash
# Buat & migrasi database
npm run db:migrate

# Atau push schema langsung (untuk development)
npm run db:push

# Generate Prisma Client
npm run db:generate
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 🎮 Katalog Game | Real-time dari RAWG API, Masonry Grid layout |
| 🔍 Pencarian | Search bar terintegrasi di navbar |
| 🎯 Filter | Genre pills + Sort ordering |
| ♾️ Infinite Scroll | Load otomatis saat scroll ke bawah |
| 🎬 Hero Banner | 5 trending game dengan auto-rotate carousel |
| 🔐 Autentikasi | Register/Login dengan JWT HttpOnly cookie |
| ❤️ Favorit | Simpan & hapus game favorit |
| ⭐ Review | Rating bintang + komentar per user per game |
| 📸 Screenshot | Gallery slider + lightbox |

## Design Rules (Enforced)

- ❌ **NO GRADIENTS** — semua background solid
- ✅ `#121212` — Main background
- ✅ `#1E1E1E` — Surface / Card / Header
- ✅ `#EAB308` — Star rating / accent (Muted Gold, NOT neon)
- ✅ Fonts: **Space Grotesk** (headings) + **Poppins** (body)

## API Routes

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/games` | GET | RAWG catalog proxy |
| `/api/games/[id]` | GET | RAWG single game proxy |
| `/api/auth/register` | POST | Register user baru |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout (clear cookie) |
| `/api/auth/me` | GET | Get current user |
| `/api/favorites` | GET | Daftar favorit user |
| `/api/favorites` | POST | Toggle favorite |
| `/api/reviews` | GET | Reviews untuk game |
| `/api/reviews` | POST | Submit/update review |

## Database Commands

```bash
npm run db:studio    # Prisma Studio (visual DB browser)
npm run db:migrate   # Buat & jalankan migration
npm run db:push      # Push schema tanpa migration
npm run db:generate  # Regenerate Prisma Client
```
