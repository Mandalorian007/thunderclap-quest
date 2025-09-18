import { QueryCtx, MutationCtx } from "../_generated/server";

// Constants for progression system
const LAUNCH_DATE = new Date('2025-09-17').getTime(); // Set actual launch date
const BI_WEEKLY_INTERVAL = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
const INITIAL_GAME_LEVEL = 10; // Starting game level

// Helper function to get current game level (can be called from other functions)
export async function getCurrentGameLevelHelper(ctx: QueryCtx | MutationCtx): Promise<number> {
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

// Update game level in database
export async function updateGameLevelInDatabase(
  ctx: MutationCtx,
  level: number,
  forceUpdate: boolean = false
) {
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

  const gameLevelData = {
    level: targetLevel,
    lastIncrease: now,
    nextIncrease,
    createdAt: existingGameLevel?.createdAt || now,
    updatedAt: now
  };

  if (existingGameLevel) {
    await ctx.db.patch(existingGameLevel._id, gameLevelData);
  } else {
    await ctx.db.insert("gameLevels", gameLevelData);
  }

  return targetLevel;
}