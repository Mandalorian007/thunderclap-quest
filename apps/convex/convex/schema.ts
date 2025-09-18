import { defineSchema, defineTable } from "convex/server";
import { zodOutputToConvex } from "convex-helpers/server/zod";
import { PlayerSchema } from "./features/profile/schema";
import { GameLevelSchema } from "./features/progression/schema";
import { InventorySchema } from "./features/inventory/schema";

export default defineSchema({
  // Profile feature - includes equipped gear for performance
  players: defineTable(zodOutputToConvex(PlayerSchema))
    .index("userId", ["userId"]),

  // Inventory feature - separate table for unequipped items
  inventory: defineTable(zodOutputToConvex(InventorySchema))
    .index("userId", ["userId"]),

  // Progression feature tables
  gameLevels: defineTable(zodOutputToConvex(GameLevelSchema)),
});