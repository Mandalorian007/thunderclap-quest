import { defineSchema, defineTable } from "convex/server";
import { zodOutputToConvex } from "convex-helpers/server/zod";
import { PlayerSchema } from "./features/profile/schema";

export default defineSchema({
  // Profile feature tables
  players: defineTable(zodOutputToConvex(PlayerSchema))
    .index("userId", ["userId"]),
});