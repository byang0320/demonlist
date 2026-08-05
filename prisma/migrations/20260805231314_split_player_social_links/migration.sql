/*
  Warnings:

  - You are about to drop the column `externalUrl` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "externalUrl",
ADD COLUMN     "discordHandle" TEXT,
ADD COLUMN     "twitchUrl" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
