-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "bio" VARCHAR(160);

-- CreateTable
CREATE TABLE "user_top_games" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "user_top_games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_top_games_userId_position_key" ON "user_top_games"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "user_top_games_userId_gameId_key" ON "user_top_games"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "user_top_games" ADD CONSTRAINT "user_top_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_top_games" ADD CONSTRAINT "user_top_games_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
