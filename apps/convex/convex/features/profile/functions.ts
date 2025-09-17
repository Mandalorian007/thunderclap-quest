import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { PlayerSchema } from "./schema";
import { calculatePlayerLevel, getXPRequiredForLevel, getTotalXPForLevel, getCurrentGameLevelHelper, getXPMultiplier } from "../progression/functions";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Create player with display name (for testing and explicit creation)
export const createPlayer = zMutation({
  args: {
    userId: z.string(),
    displayName: z.string()
  },
  handler: async (ctx, { userId, displayName }) => {
    // Create new player using Zod schema for validation
    const playerData = PlayerSchema.parse({
      userId,
      displayName,
      createdAt: Date.now(),
      lastActive: Date.now(),
      xp: 0,
      level: 1,
      titles: [],
      currentTitle: undefined,
    });

    const playerId = await ctx.db.insert("players", playerData);
    return await ctx.db.get(playerId);
  }
});

// Create player if not exists (mutation)
export const ensurePlayerExists = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("players")
      .withIndex("userId", (q: any) => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing;
    }

    // Create new player using Zod schema for validation
    const playerData = PlayerSchema.parse({
      userId,
      displayName: "Unknown Player",
      createdAt: Date.now(),
      lastActive: Date.now(),
      xp: 0,
      level: 1,
      titles: [],
      currentTitle: undefined,
    });

    const playerId = await ctx.db.insert("players", playerData);
    return await ctx.db.get(playerId);
  }
});

// Profile content for template display (query only)
export const getPlayerProfileContent = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q: any) => q.eq("userId", userId))
      .first();

    if (!player) {
      // In engine context, we need to create player via mutation
      // This is a limitation - queries can't call mutations
      // For testing, we'll handle this in the test setup
      throw new Error(`Player ${userId} not found - must be created first`);
    }

    return await formatProfileContentWithGameLevel(ctx, player);
  }
});

// Engine helper function to get profile content
export async function getPlayerProfileContentHelper(ctx: any, { userId }: { userId: string }) {
  const player = await ctx.db
    .query("players")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!player) {
    throw new Error(`Player ${userId} not found - must be created first`);
  }

  return await formatProfileContentWithGameLevel(ctx, player);
}

// Helper function to calculate and return raw profile data - exported for engine use
export function formatProfileContent(player: any) {
  // Calculate level from XP using exponential formula
  const calculatedLevel = calculatePlayerLevel(player.xp);

  // Calculate XP to next level using exponential progression
  const currentLevelTotalXP = getTotalXPForLevel(calculatedLevel);
  const nextLevelTotalXP = getTotalXPForLevel(calculatedLevel + 1);
  const xpProgress = player.xp - currentLevelTotalXP;
  const xpRequired = nextLevelTotalXP - currentLevelTotalXP;

  // Return raw data - UI handles formatting
  return {
    // Player identity
    displayName: player.displayName,

    // Progression data
    level: calculatedLevel,
    xp: player.xp,
    xpProgress,
    xpRequired,

    // Achievement data
    titles: player.titles,
    currentTitle: player.currentTitle,

    // Account data
    createdAt: player.createdAt,
    lastActive: player.lastActive,
  };
}

// Enhanced helper function that includes game level and XP multiplier information
export async function formatProfileContentWithGameLevel(ctx: any, player: any) {
  // Get base profile content
  const baseContent = formatProfileContent(player);

  // Get current game level
  const gameLevel = await getCurrentGameLevelHelper(ctx);

  // Calculate XP multiplier based on player vs game level
  const xpMultiplier = getXPMultiplier(baseContent.level, gameLevel);

  // Return enhanced profile data
  return {
    ...baseContent,

    // Game progression data
    gameLevel,
    xpMultiplier,

    // Helper flags for display
    isBehindGameLevel: baseContent.level < gameLevel,
    isAheadOfGameLevel: baseContent.level > gameLevel,
    isAtGameLevel: baseContent.level === gameLevel,
  };
}