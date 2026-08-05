-- Give Classic and Platformer levels independent rank spaces.
DROP INDEX "Level_rank_key";
DROP INDEX "Level_status_rank_idx";

-- Preserve the existing order within each type, while putting active levels
-- first so both public lists begin at rank 1. Archived levels follow the
-- active levels and retain a unique rank within their type.
WITH ranked_levels AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "type"
      ORDER BY
        CASE WHEN "status" = 'ACTIVE' THEN 0 ELSE 1 END,
        "rank",
        "id"
    )::INTEGER AS "new_rank"
  FROM "Level"
)
UPDATE "Level"
SET "rank" = "ranked_levels"."new_rank"
FROM ranked_levels
WHERE "Level"."id" = "ranked_levels"."id";

CREATE UNIQUE INDEX "Level_type_rank_key" ON "Level"("type", "rank");
CREATE INDEX "Level_status_type_rank_idx" ON "Level"("status", "type", "rank");
