// app/games/[id]/page.jsx
// ─────────────────────────────────────────────
// Game Detail Page
// - Server Component fetches game data + screenshots
// - Client components: FavoriteButton, ReviewSection, ScreenshotGallery
// ─────────────────────────────────────────────
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getGameById, getGameScreenshots, getGameStores } from '@/lib/rawg';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';
import FavoriteButton from '@/components/game/FavoriteButton';
import ReviewSection from '@/components/game/ReviewSection';
import ScreenshotGallery from '@/components/game/ScreenshotGallery';
import StarRating from '@/components/ui/StarRating';
import BackButton from '@/components/ui/BackButton';
import { getCombinedReviewsAndRating } from '@/services/db/reviews';

export async function generateMetadata(props) {
  const params = await props.params;
  try {
    const game = await getGameById(params.id);
    return {
      title: game.name,
      description: game.description_raw?.slice(0, 160) || `Detail game ${game.name} di GameVault.`,
    };
  } catch {
    return { title: 'Game Not Found' };
  }
}

// ── Metadata row ──────────────────────────────
function MetaItem({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#A1A1AA] text-xs font-sans uppercase tracking-wide">{label}</span>
      <span className="text-white text-sm font-sans font-medium">{value}</span>
    </div>
  );
}

// ── Genre / Tag pill ──────────────────────────
function Tag({ children }) {
  return (
    <span className="text-xs font-sans text-[#A1A1AA] bg-[#262626] border border-[#2E2E2E] px-2.5 py-1 rounded-[6px]">
      {children}
    </span>
  );
}

export default async function GameDetailPage(props) {
  const params = await props.params;
  let game, screenshots, storesData, combinedData;
  try {
    [game, screenshots, storesData, combinedData] = await Promise.all([
      getGameById(params.id),
      getGameScreenshots(params.id),
      getGameStores(params.id).catch(() => ({ results: [] })),
      getCombinedReviewsAndRating(params.id).catch(() => ({ rating: { average: 0, count: 0 } })),
    ]);
  } catch {
    notFound();
  }

  const publishers = game.publishers?.map(p => p.name).join(', ') || '—';
  const developers = game.developers?.map(d => d.name).join(', ') || '—';
  const platforms  = game.platforms?.map(p => p.platform.name).join(', ') || '—';
  const releaseDate = game.released
    ? new Date(game.released).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  // ── Find Official Steam Box Art (if available) ──
  let officialCover = game.background_image;
  let steamAppId = null;
  const steamStore = storesData?.results?.find(s => s.url?.includes('steampowered.com/app/'));
  if (steamStore) {
    const match = steamStore.url.match(/app\/(\d+)/);
    if (match && match[1]) {
      steamAppId = match[1];
      officialCover = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/library_600x900.jpg`;
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* ── Back Link ── */}
      <BackButton fallbackUrl="/" />

      {/* ── Hero Banner ── */}
      <div className="relative w-full bg-[#1E1E1E] rounded-card overflow-hidden mb-6 sm:mb-8" style={{ minHeight: 'clamp(240px, 35vw, 320px)' }}>
        {game.background_image && (
          <Image
            src={getOptimizedImageUrl(game.background_image)}
            alt={game.name}
            fill
            priority
            unoptimized
            quality={100}
            sizes="100vw"
            className="object-cover object-center opacity-35"
          />
        )}
        {/* Solid bottom overlay — no gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[#1E1E1E] opacity-75" />

        {/* Content on top of banner */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 items-start sm:items-end" style={{ minHeight: 'clamp(240px, 35vw, 320px)' }}>
          {/* Cover thumbnail */}
          {game.background_image && (
            <div className="flex-shrink-0 w-24 sm:w-32 md:w-40 aspect-[3/4] relative rounded-[8px] overflow-hidden border border-[#2E2E2E] bg-[#262626] shadow-lg">
              <Image
                src={getOptimizedImageUrl(officialCover || game.background_image)}
                alt={game.name}
                fill
                unoptimized
                quality={100}
                sizes="160px"
                className="object-cover object-[center_top]"
              />
            </div>
          )}

          {/* Game info */}
          <div className="flex-1 space-y-3 pb-1">
            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5">
              {game.genres?.slice(0, 4).map(g => <Tag key={g.id}>{g.name}</Tag>)}
            </div>

            {/* Title */}
            <h1 className="font-heading font-semibold text-white text-2xl sm:text-3xl md:text-4xl leading-tight">
              {game.name}
            </h1>

            {/* Real Average Rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <StarRating rating={Math.round(combinedData?.rating?.average || game.rating || 0)} size={16} />
                <span className="text-[#A1A1AA] text-xs sm:text-sm font-sans">
                  {combinedData?.rating?.average ? combinedData.rating.average.toFixed(1) : game.rating?.toFixed(1)} ({combinedData?.rating?.count || game.ratings_count?.toLocaleString()} ulasan)
                </span>
              </div>
              {game.metacritic && (
                <span className={`text-sm font-bold font-sans px-2 py-0.5 rounded-[4px] border ${
                  game.metacritic >= 75
                    ? 'text-[#EAB308] border-[#EAB308] bg-[#1E1E1E]'
                    : 'text-[#A1A1AA] border-[#3A3A3A] bg-[#1E1E1E]'
                }`}>
                  Metacritic: {game.metacritic}
                </span>
              )}
            </div>

            {/* Favorite button */}
            <FavoriteButton
              gameId={String(game.id)}
              title={game.name}
              slug={game.slug}
              coverUrl={`${officialCover || ''}|${game.background_image || ''}`}
            />
          </div>

          {/* Right Action (Steam Button) */}
          {steamAppId && (
            <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pb-1">
              <a
                href={`https://store.steampowered.com/app/${steamAppId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#171A21] hover:bg-[#2A475E] text-[#66C0F4] hover:text-white border border-[#2A475E] hover:border-[#66C0F4] transition-all duration-300 rounded-[8px] font-sans font-semibold text-sm shadow-xl group w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/steam-logo.svg" alt="Steam Logo" className="w-5 h-5 object-contain transition-transform group-hover:scale-110" />
                Mainkan di Steam
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Description + Screenshots ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {game.description_raw && (
            <section>
              <h2 className="font-heading font-semibold text-white text-xl mb-3">Tentang Game</h2>
              <p className="text-[#A1A1AA] text-sm font-sans leading-relaxed line-clamp-[10]">
                {game.description_raw}
              </p>
            </section>
          )}

          {/* Screenshot Gallery */}
          {screenshots?.results?.length > 0 && (
            <section>
              <h2 className="font-heading font-semibold text-white text-xl mb-3">Screenshot</h2>
              <ScreenshotGallery screenshots={screenshots.results} />
            </section>
          )}

          {/* Review Section */}
          <ReviewSection
            gameId={String(game.id)}
            gameTitle={game.name}
            gameSlug={game.slug}
            gameCover={`${officialCover || ''}|${game.background_image || ''}`}
          />
        </div>

        {/* ── Right: Metadata Sidebar ── */}
        <aside className="space-y-4">
          <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-5 space-y-4">
            <h3 className="font-heading font-semibold text-white text-base">Informasi Game</h3>
            <div className="space-y-3 divide-y divide-[#2E2E2E]">
              <div className="space-y-3">
                <MetaItem label="Tanggal Rilis"  value={releaseDate} />
                <MetaItem label="Developer"      value={developers} />
                <MetaItem label="Publisher"      value={publishers} />
                <MetaItem label="Platform"       value={platforms} />
              </div>
              {game.website && (
                <div className="pt-3">
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-sans text-white hover:underline flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website Resmi
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {game.tags?.length > 0 && (
            <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-5">
              <h3 className="font-heading font-semibold text-white text-base mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {game.tags.slice(0, 12).map(t => <Tag key={t.id}>{t.name}</Tag>)}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
