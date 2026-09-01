// components/profile/Top5Showcase.jsx
// ─────────────────────────────────────────────
// Top 5 Pinned Games Showcase — Server Component
// Displays 5 numbered game card slots.
// Empty slots show a solid placeholder with click handler.
// ─────────────────────────────────────────────
import Image from 'next/image';
import Link from 'next/link';

const SLOT_COUNT = 5;

/** Rank badge — solid gold for #1, muted for the rest */
function RankBadge({ position }) {
  const isTop = position === 1;
  return (
    <span
      className={`absolute top-2 left-2 z-10 text-xs font-bold font-sans
                  px-2 py-0.5 rounded-md border
                  ${isTop
                    ? 'bg-[#1E1E1E] text-[#EAB308] border-[#EAB308]'
                    : 'bg-[#1E1E1E] text-[#A1A1AA] border-[#2A2A2A]'
                  }`}
    >
      #{position}
    </span>
  );
}

/** Single game slot with cover, title, and genre badge */
function FilledSlot({ game, position }) {
  return (
    <Link
      href={`/games/${game.id}`}
      id={`top-game-slot-${position}`}
      className="group relative flex flex-col bg-[#1E1E1E] border border-[#2A2A2A]
                 rounded-xl overflow-hidden
                 hover:border-[#3A3A3A] hover:-translate-y-0.5
                 transition-all duration-200"
    >
      {/* Cover image */}
      <div className="relative w-full aspect-[3/4] bg-[#262626] overflow-hidden">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl select-none text-[#3A3A3A]">🎮</span>
          </div>
        )}
        <RankBadge position={position} />
      </div>

      {/* Title */}
      <div className="p-3">
        <p className="text-white text-xs font-semibold font-sans leading-snug line-clamp-2">
          {game.title}
        </p>
      </div>
    </Link>
  );
}

/** Empty placeholder slot */
function EmptySlot({ position, onOpenEditModal }) {
  return (
    <button
      id={`top-game-slot-empty-${position}`}
      onClick={onOpenEditModal}
      className="relative flex flex-col items-center justify-center
                 bg-[#1E1E1E] border border-dashed border-[#2A2A2A]
                 rounded-xl aspect-[3/4] w-full
                 text-[#A1A1AA] hover:border-[#3A3A3A] hover:text-white
                 hover:bg-[#222222] transition-all duration-150"
    >
      <span className="absolute top-2 left-2 text-xs font-bold font-sans text-[#3A3A3A]">
        #{position}
      </span>
      <span className="text-2xl mb-2 select-none">+</span>
      <span className="text-[11px] font-sans font-medium text-center px-2 leading-tight">
        Slot Kosong
      </span>
    </button>
  );
}

/**
 * @param {Object}   props
 * @param {Array}    props.topGames        - Array of { position, game } from DB
 * @param {Function} props.onOpenEditModal - Opens the edit modal to select games
 */
export default function Top5Showcase({ topGames, onOpenEditModal }) {
  const slotMap = Object.fromEntries(topGames.map(entry => [entry.position, entry.game]));

  return (
    <section className="px-4 sm:px-6 py-6 border-t border-[#2A2A2A]">
      <h2 className="text-base font-semibold font-sans text-white mb-4">
        Top 5 Games
      </h2>

      <div className="flex sm:grid sm:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const position = i + 1;
          const game = slotMap[position];

          return (
            <div key={position} className="flex-none w-[140px] sm:w-auto snap-start">
              {game
                ? <FilledSlot game={game} position={position} />
                : <EmptySlot position={position} onOpenEditModal={onOpenEditModal} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
