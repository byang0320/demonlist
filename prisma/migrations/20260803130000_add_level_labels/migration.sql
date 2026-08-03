-- Add level classification and status labels.
ALTER TABLE "Level"
ADD COLUMN "type" TEXT,
ADD COLUMN "demoted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "unrated" BOOLEAN NOT NULL DEFAULT false;

-- Existing levels are classic unless explicitly changed afterward.
UPDATE "Level"
SET "type" = 'Classic'
WHERE "type" IS NULL;

ALTER TABLE "Level" ALTER COLUMN "type" SET NOT NULL;

ALTER TABLE "Level"
ADD CONSTRAINT "Level_type_check" CHECK ("type" IN ('Classic', 'Platformer'));
