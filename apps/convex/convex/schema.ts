import { defineSchema, defineTable } from "convex/server";
import { zodOutputToConvex } from "convex-helpers/server/zod";
import { PlayerSchema } from "./schemas/player";

export default defineSchema({
  players: defineTable(zodOutputToConvex(PlayerSchema))
    .index("userId", ["userId"])
    .index("level", ["level"])
    .index("lastActive", ["lastActive"]),
});