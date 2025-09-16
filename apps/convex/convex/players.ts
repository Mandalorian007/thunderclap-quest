import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get player by Discord ID
export const getPlayer = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
  }
});

// Create or update player
export const createPlayer = mutation({
  args: {
    userId: v.string(),
    displayName: v.string()
  },
  handler: async (ctx, { userId, displayName }) => {
    // Check if player exists
    const existing = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update display name and return
      await ctx.db.patch(existing._id, { displayName });
      return await ctx.db.get(existing._id);
    }

    // Create new player
    const playerId = await ctx.db.insert("players", {
      userId,
      displayName,
      xp: 0,
      level: 1,
    });

    return await ctx.db.get(playerId);
  }
});