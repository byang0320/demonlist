/*
  Warnings:

  - You are about to drop the column `externalUrl` on the `Level` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Level` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Level" DROP COLUMN "externalUrl",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "videoUrl" TEXT;
