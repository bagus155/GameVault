const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil RAWG API KEY dari env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const RAWG_API_KEY = process.env.RAWG_API_KEY || "755fb934d71b47f4aa3279b251c8196e";

async function main() {
  console.log('Fetching games from database...');
  const games = await prisma.game.findMany();
  
  for (const game of games) {
    console.log(`\nChecking [${game.title}]...`);
    try {
      const res = await fetch(`https://api.rawg.io/api/games/${game.id}/stores?key=${RAWG_API_KEY}`);
      if (!res.ok) {
        console.log(` -> Failed to fetch RAWG stores (${res.status})`);
        continue;
      }
      
      const storesData = await res.json();
      const steamStore = storesData?.results?.find(s => s.url?.includes('steampowered.com/app/'));
      
      if (steamStore) {
        const match = steamStore.url.match(/app\/(\d+)/);
        if (match && match[1]) {
          const steamAppId = match[1];
          const officialCover = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/library_600x900.jpg`;
          
          if (game.coverUrl !== officialCover) {
            await prisma.game.update({
              where: { id: game.id },
              data: { coverUrl: officialCover }
            });
            console.log(` -> SUCCESS: Updated to Steam cover!`);
          } else {
            console.log(` -> SKIP: Already has Steam cover.`);
          }
        }
      } else {
        console.log(` -> SKIP: No Steam store found on RAWG.`);
      }
    } catch (e) {
      console.log(` -> ERROR: ${e.message}`);
    }
  }
  console.log('\nAll done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
