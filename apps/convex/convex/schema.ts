import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    userId: v.string(),        // Discord ID
    displayName: v.string(),   // Discord username
    xp: v.number(),           // Experience points
    level: v.number(),        // Current level
  }).index("userId", ["userId"]),
});