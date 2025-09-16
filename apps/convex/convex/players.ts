import { mutation, query } from "./_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { z } from "zod";
import { PlayerSchema } from "./schemas/player";

// Set up Zod-validated functions
const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Get player by Discord ID
export const getPlayer = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
  }
});

// Create or update player
export const createPlayer = zMutation({
  args: {
    userId: z.string(),
    displayName: z.string()
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

    // Create new player using Zod schema for validation
    const playerData = PlayerSchema.parse({
      userId,
      displayName,
      xp: 0,
      level: 1,
    });

    const playerId = await ctx.db.insert("players", playerData);
    return await ctx.db.get(playerId);
  }
});