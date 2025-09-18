import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { GameLevelSchema } from "./schema";
import { getCurrentGameLevelHelper, updateGameLevelInDatabase } from "../../helpers/gameLevelHelpers";
import { calculatePlayerLevel, getXPRequiredForLevel, getTotalXPForLevel, getXPMultiplier, calculateProgressionStats } from "../../helpers/progressionHelpers";
import { updatePlayerXP, awardPlayerTitle } from "../../models/playerModel";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Note: Helper functions moved to ../../helpers/gameLevelHelpers.ts and ../../helpers/progressionHelpers.ts

// Get current game level based on bi-weekly schedule
export const getCurrentGameLevel = zQuery({
  args: {},
  handler: async (ctx) => {
    return await getCurrentGameLevelHelper(ctx);
  }
});

// Initialize or update game level (for admin use or scheduled tasks)
export const updateGameLevel = zMutation({
  args: {
    level: z.number().optional(),
    forceUpdate: z.boolean().default(false)
  },
  handler: async (ctx, { level, forceUpdate }) => {
    return await updateGameLevelInDatabase(ctx, level || 10, forceUpdate);
  }
});

// Note: XP calculation functions moved to ../../helpers/progressionHelpers.ts
// Re-export for backward compatibility
export { getXPRequiredForLevel, getTotalXPForLevel, calculatePlayerLevel, getXPMultiplier } from "../../helpers/progressionHelpers";

// Legacy Convex mutations removed - use helper functions instead

// Get progression statistics (for debugging and admin purposes)
export const getProgressionStats = zQuery({
  args: {},
  handler: async (ctx) => {
    const gameLevel = await getCurrentGameLevelHelper(ctx);
    const players = await ctx.db.query("players").collect();

    return calculateProgressionStats(players, gameLevel);
  }
});

// Helper functions for other features to use - delegate to model layer
export async function awardXPHelper(ctx: any, userId: string, xpAmount: number, source: string) {
  return await updatePlayerXP(ctx, userId, xpAmount, source);
}

export async function awardTitleHelper(ctx: any, userId: string, title: string) {
  return await awardPlayerTitle(ctx, userId, title);
}