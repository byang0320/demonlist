import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",

    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },

    // If using Prisma Postgres, env should be "DATABASE_URL"
    datasource: {
        url: env("DIRECT_URL"),
    },
});