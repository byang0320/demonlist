CREATE TABLE "AdminNote" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNote_pkey" PRIMARY KEY ("id")
);
