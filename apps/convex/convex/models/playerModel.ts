import { QueryCtx, MutationCtx } from "../_generated/server";
import { calculatePlayerLevel, getXPRequiredForLevel, getTotalXPForLevel, getXPMultiplier } from "../helpers/progressionHelpers";
import { getCurrentGameLevelHelper } from "../helpers/gameLevelHelpers";

// Player data access and business logic
export async function getPlayerByUserId(ctx: QueryCtx | MutationCtx, userId: string) {
  const player = await ctx.db
    .query("players")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!player) {
    throw new Error(`Player ${userId} not found`);
  }

  return player;
}

// Get player data with computed fields
export async function getPlayerWithStats(ctx: QueryCtx | MutationCtx, userId: string) {
  const player = await getPlayerByUserId(ctx, userId);
  const gameLevel = await getCurrentGameLevelHelper(ctx);

  // Calculate derived stats
  const calculatedLevel = calculatePlayerLevel(player.xp);
  const xpMultiplier = getXPMultiplier(calculatedLevel, gameLevel);

  // Calculate XP progress to next level
  const currentLevelTotalXP = getTotalXPForLevel(calculatedLevel);
  const nextLevelTotalXP = getTotalXPForLevel(calculatedLevel + 1);
  const xpProgress = player.xp - currentLevelTotalXP;
  const xpRequired = nextLevelTotalXP - currentLevelTotalXP;

  return {
    ...player,

    // Computed progression fields
    calculatedLevel,
    xpProgress,
    xpRequired,
    xpMultiplier,

    // Game level relationship
    gameLevel,
    isBehindGameLevel: calculatedLevel < gameLevel,
    isAheadOfGameLevel: calculatedLevel > gameLevel,
    isAtGameLevel: calculatedLevel === gameLevel,
  };
}

// Create a new player
export async function createPlayer(ctx: MutationCtx, userId: string, displayName: string = "Unknown Player") {
  const playerData = {
    userId,
    displayName,
    createdAt: Date.now(),
    lastActive: Date.now(),
    xp: 0,
    level: 1,
    titles: [],
    currentTitle: undefined,
  };

  const playerId = await ctx.db.insert("players", playerData);
  return await ctx.db.get(playerId);
}

// Ensure player exists, create if not, and update display name if it has changed
export async function ensurePlayerExists(ctx: MutationCtx, userId: string, displayName?: string) {
  try {
    const existingPlayer = await getPlayerByUserId(ctx, userId);

    // Update display name if it has changed and we have new info
    if (displayName && existingPlayer.displayName !== displayName) {
      await ctx.db.patch(existingPlayer._id, {
        displayName,
        lastActive: Date.now()
      });

      // Return updated player
      return await ctx.db.get(existingPlayer._id);
    }

    // Update lastActive timestamp even if display name hasn't changed
    await ctx.db.patch(existingPlayer._id, {
      lastActive: Date.now()
    });

    return existingPlayer;
  } catch (error) {
    // Player doesn't exist, create them
    return await createPlayer(ctx, userId, displayName);
  }
}

// Update player XP and level
export async function updatePlayerXP(ctx: MutationCtx, userId: string, xpAmount: number, source: string = "unknown") {
  const player = await getPlayerByUserId(ctx, userId);
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
    levelUp: newLevel > currentLevel,
    source
  };
}

// Award a title to a player
export async function awardPlayerTitle(ctx: MutationCtx, userId: string, title: string) {
  const player = await getPlayerByUserId(ctx, userId);

  if (!player.titles.includes(title)) {
    await ctx.db.patch(player._id, {
      titles: [...player.titles, title],
      lastActive: Date.now()
    });
    return true; // Title was newly awarded
  }

  return false; // Player already had the title
}

// Format player profile content for templates
export function formatProfileContent(playerWithStats: any) {
  return {
    // Player identity
    displayName: playerWithStats.displayName,

    // Progression data
    level: playerWithStats.calculatedLevel,
    xp: playerWithStats.xp,
    xpProgress: playerWithStats.xpProgress,
    xpRequired: playerWithStats.xpRequired,

    // Achievement data
    titles: playerWithStats.titles,
    currentTitle: playerWithStats.currentTitle,

    // Account data
    createdAt: playerWithStats.createdAt,
    lastActive: playerWithStats.lastActive,

    // Game progression data
    gameLevel: playerWithStats.gameLevel,
    xpMultiplier: playerWithStats.xpMultiplier,

    // Helper flags for display
    isBehindGameLevel: playerWithStats.isBehindGameLevel,
    isAheadOfGameLevel: playerWithStats.isAheadOfGameLevel,
    isAtGameLevel: playerWithStats.isAtGameLevel,
  };
}