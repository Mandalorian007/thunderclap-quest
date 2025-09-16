import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { PlayerSchema } from "./schemas/player";

// Get or create player by Discord ID
export const getOrCreatePlayer = mutation({
  args: {
    userId: v.string(),
    displayName: v.string()
  },
  handler: async (ctx, { userId, displayName }) => {
    // Check if player already exists
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (existingPlayer) {
      // Update last active timestamp and display name
      await ctx.db.patch(existingPlayer._id, {
        lastActive: Date.now(),
        displayName
      });
      return existingPlayer;
    }

    // Create new player
    const newPlayer = {
      userId,
      displayName,
      createdAt: Date.now(),
      lastActive: Date.now(),
      xp: 0,
      level: 1,
      titles: [],
      equippedGear: {},
      inventory: []
    };

    const playerId = await ctx.db.insert("players", newPlayer);
    return await ctx.db.get(playerId);
  }
});

// Get player data
export const getPlayer = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
  }
});

// Award XP to player
export const awardXP = mutation({
  args: {
    userId: v.string(),
    xpAmount: v.number()
  },
  handler: async (ctx, { userId, xpAmount }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    const newXP = player.xp + xpAmount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1; // Simple level formula

    await ctx.db.patch(player._id, {
      xp: newXP,
      level: newLevel,
      lastActive: Date.now()
    });

    return { xpAwarded: xpAmount, newXP, newLevel };
  }
});