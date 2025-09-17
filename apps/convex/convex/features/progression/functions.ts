import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { GameLevelSchema } from "./schema";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Constants for progression system
const LAUNCH_DATE = new Date('2025-09-17').getTime(); // Set actual launch date
const BI_WEEKLY_INTERVAL = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
const INITIAL_GAME_LEVEL = 10; // Starting game level

// Helper function to get current game level (can be called from other functions)
export async function getCurrentGameLevelHelper(ctx: any): Promise<number> {
  // Try to get game level from database first
  const gameLevel = await ctx.db.query("gameLevels").first();

  if (gameLevel) {
    return gameLevel.level || INITIAL_GAME_LEVEL;
  }

  // If no game level exists, calculate from launch date
  const now = Date.now();
  const weeksSinceLaunch = Math.floor((now - LAUNCH_DATE) / (7 * 24 * 60 * 60 * 1000));
  const calculatedLevel = INITIAL_GAME_LEVEL + Math.floor(weeksSinceLaunch / 2) * 10;

  return calculatedLevel;
}

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
    const now = Date.now();
    const existingGameLevel = await ctx.db.query("gameLevels").first();

    if (existingGameLevel && !forceUpdate) {
      // Check if it's time for automatic increase
      if (now >= existingGameLevel.nextIncrease) {
        const newLevel = (existingGameLevel.level || INITIAL_GAME_LEVEL) + 10;
        const nextIncrease = existingGameLevel.nextIncrease + BI_WEEKLY_INTERVAL;

        await ctx.db.patch(existingGameLevel._id, {
          level: newLevel,
          lastIncrease: now,
          nextIncrease,
          updatedAt: now
        });

        return newLevel;
      }

      return existingGameLevel.level;
    }

    // Manual level setting or initial creation
    const targetLevel = level || INITIAL_GAME_LEVEL;
    const nextIncrease = now + BI_WEEKLY_INTERVAL;

    const gameLevelData = GameLevelSchema.parse({
      level: targetLevel,
      lastIncrease: now,
      nextIncrease,
      createdAt: existingGameLevel?.createdAt || now,
      updatedAt: now
    });

    if (existingGameLevel) {
      await ctx.db.patch(existingGameLevel._id, gameLevelData);
    } else {
      await ctx.db.insert("gameLevels", gameLevelData);
    }

    return targetLevel;
  }
});

// Exponential XP calculation functions
export function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  // Exponential scaling: 100 * (1.15^(level-2))
  return Math.floor(100 * Math.pow(1.15, level - 2));
}

export function getTotalXPForLevel(level: number): number {
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += getXPRequiredForLevel(i);
  }
  return totalXP;
}

export function calculatePlayerLevel(totalXP: number): number {
  let level = 1;
  let cumulativeXP = 0;

  while (cumulativeXP <= totalXP) {
    level++;
    const xpForThisLevel = getXPRequiredForLevel(level);
    if (cumulativeXP + xpForThisLevel > totalXP) {
      break;
    }
    cumulativeXP += xpForThisLevel;
  }

  return level - 1;
}

// XP multiplier calculation based on game level relationship
export function getXPMultiplier(playerLevel: number, gameLevel: number): number {
  if (playerLevel < gameLevel) {
    // Catch-up bonus: 10% bonus per level behind, capped at 200% (3x total)
    const levelsBehind = gameLevel - playerLevel;
    const bonusPerLevel = 0.10; // 10% per level behind
    const maxMultiplier = 3.0; // Cap at 3x (300%)
    return Math.min(maxMultiplier, 1.0 + (levelsBehind * bonusPerLevel));
  } else if (playerLevel > gameLevel) {
    // Prestige penalty: 5% penalty per level ahead, floor at 50%
    const levelsAhead = playerLevel - gameLevel;
    const penaltyPerLevel = 0.05; // 5% penalty per level ahead
    const minMultiplier = 0.5; // Floor at 50%
    return Math.max(minMultiplier, 1.0 - (levelsAhead * penaltyPerLevel));
  } else {
    return 1.0; // Normal XP rate at game level
  }
}

// Centralized XP awarding function
export const awardXP = zMutation({
  args: {
    userId: z.string(),
    xpAmount: z.number(),
    source: z.string().default("unknown")
  },
  handler: async (ctx, { userId, xpAmount, source }) => {
    // Get player
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q: any) => q.eq("userId", userId))
      .first();

    if (!player) {
      throw new Error(`Player ${userId} not found`);
    }

    // Get current game level
    const gameLevel = await getCurrentGameLevelHelper(ctx);

    // Calculate current player level from XP
    const currentLevel = calculatePlayerLevel(player.xp);

    // Apply XP multiplier based on game level relationship
    const multiplier = getXPMultiplier(currentLevel, gameLevel);
    const actualXP = Math.floor(xpAmount * multiplier);

    // Calculate new total XP and level
    const newTotalXP = player.xp + actualXP;
    const newLevel = calculatePlayerLevel(newTotalXP);

    // Update player
    await ctx.db.patch(player._id, {
      xp: newTotalXP,
      level: newLevel,
      lastActive: Date.now()
    });

    return {
      xpAwarded: actualXP,
      xpMultiplier: multiplier,
      newTotalXP,
      newLevel,
      levelUp: newLevel > currentLevel
    };
  }
});

// Helper function to award titles
export const awardTitle = zMutation({
  args: {
    userId: z.string(),
    title: z.string()
  },
  handler: async (ctx, { userId, title }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q: any) => q.eq("userId", userId))
      .first();

    if (player && !player.titles.includes(title)) {
      await ctx.db.patch(player._id, {
        titles: [...player.titles, title],
        lastActive: Date.now()
      });
      return true;
    }

    return false;
  }
});

// Get progression statistics (for debugging and admin purposes)
export const getProgressionStats = zQuery({
  args: {},
  handler: async (ctx) => {
    const gameLevel = await getCurrentGameLevelHelper(ctx);

    // Get player level distribution
    const players = await ctx.db.query("players").collect();
    const levelDistribution: Record<number, number> = {};
    let totalPlayers = 0;

    for (const player of players) {
      const level = calculatePlayerLevel(player.xp);
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      totalPlayers++;
    }

    // Calculate average player level
    const averageLevel = players.length > 0
      ? players.reduce((sum, p) => sum + calculatePlayerLevel(p.xp), 0) / players.length
      : 0;

    return {
      gameLevel,
      totalPlayers,
      averageLevel,
      levelDistribution
    };
  }
});

// Helper function for other features to use
export async function awardXPHelper(ctx: any, userId: string, xpAmount: number, source: string) {
  // Get player
  const player = await ctx.db
    .query("players")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!player) {
    throw new Error(`Player ${userId} not found`);
  }

  // Get current game level
  const gameLevel = await getCurrentGameLevelHelper(ctx);

  // Calculate current player level from XP
  const currentLevel = calculatePlayerLevel(player.xp);

  // Apply XP multiplier based on game level relationship
  const multiplier = getXPMultiplier(currentLevel, gameLevel);
  const actualXP = Math.floor(xpAmount * multiplier);

  // Calculate new total XP and level
  const newTotalXP = player.xp + actualXP;
  const newLevel = calculatePlayerLevel(newTotalXP);

  // Update player
  await ctx.db.patch(player._id, {
    xp: newTotalXP,
    level: newLevel,
    lastActive: Date.now()
  });

  return {
    xpAwarded: actualXP,
    xpMultiplier: multiplier,
    newTotalXP,
    newLevel,
    levelUp: newLevel > currentLevel
  };
}

// Helper function for other features to award titles
export async function awardTitleHelper(ctx: any, userId: string, title: string) {
  const player = await ctx.db
    .query("players")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (player && !player.titles.includes(title)) {
    await ctx.db.patch(player._id, {
      titles: [...player.titles, title],
      lastActive: Date.now()
    });
    return true;
  }

  return false;
}