/*
  Warnings:

  - A unique constraint covering the columns `[ingameId]` on the table `Level` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ingameId` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "ingameId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Level_ingameId_key" ON "Level"("ingameId");
