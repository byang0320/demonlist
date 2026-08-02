-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "LevelStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "externalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "creatorName" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "externalUrl" TEXT,
    "status" "LevelStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Completion" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Completion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Level_slug_key" ON "Level"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Level_rank_key" ON "Level"("rank");

-- CreateIndex
CREATE INDEX "Level_status_rank_idx" ON "Level"("status", "rank");

-- CreateIndex
CREATE INDEX "Completion_playerId_idx" ON "Completion"("playerId");

-- CreateIndex
CREATE INDEX "Completion_levelId_idx" ON "Completion"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "Completion_playerId_levelId_key" ON "Completion"("playerId", "levelId");

-- AddForeignKey
ALTER TABLE "Completion" ADD CONSTRAINT "Completion_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Completion" ADD CONSTRAINT "Completion_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
