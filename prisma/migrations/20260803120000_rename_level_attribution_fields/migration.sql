-- Rename the existing nullable creator field to the required publisher field.
ALTER TABLE "Level" RENAME COLUMN "creatorName" TO "publishedBy";

-- Preserve existing rows while making the publisher attribution required.
UPDATE "Level"
SET "publishedBy" = 'Unknown'
WHERE "publishedBy" IS NULL;

ALTER TABLE "Level" ALTER COLUMN "publishedBy" SET NOT NULL;

ALTER TABLE "Level"
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "verifiedBy" TEXT;
