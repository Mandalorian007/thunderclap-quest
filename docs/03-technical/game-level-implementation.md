# Game Level System - Technical Implementation

## Overview

This document provides the complete technical implementation for the game level progression system using Convex cron jobs, centralized storage, and automated bi-weekly increases of +10 levels.

## Database Schema

### Game Level Storage

```typescript
// features/gameLevel/schema.ts
import { z } from "zod";

// Global game settings - single record
export const GameSettingsSchema = z.object({
  currentGameLevel: z.number(),           // Current global game level
  launchDate: z.number(),                 // Game launch timestamp (UTC)
  lastLevelIncrease: z.number(),          // When level was last increased (any source)
  lastCronIncrease: z.number(),           // When cron last increased level
  isActive: z.boolean().default(true),    // Can disable level increases
});

// Game level history tracking
export const GameLevelHistorySchema = z.object({
  level: z.number(),                      // The game level
  effectiveDate: z.number(),              // When this level became active
  previousLevel: z.number().optional(),   // Previous level (for validation)
  triggerType: z.enum(["cron", "manual", "init"]), // How it was triggered
  playerCount: z.number().optional(),     // Active players at time of increase
  changeAmount: z.number().optional(),    // How much the level changed (+10, -5, etc.)
  notes: z.string().optional(),           // Optional admin notes
});

export type GameSettings = z.infer<typeof GameSettingsSchema>;
export type GameLevelHistory = z.infer<typeof GameLevelHistorySchema>;
```

### Feature Index Export

```typescript
// features/gameLevel/index.ts
export * from "./types";
export * from "./schema";
export * from "./functions";
```

### Database Tables

```typescript
// convex/schema.ts - Updated to include game level tables
import { defineSchema, defineTable } from "convex/server";
import { zodOutputToConvex } from "convex-helpers/server/zod";
import { PlayerSchema } from "./features/profile/schema";
import { GameSettingsSchema, GameLevelHistorySchema } from "./features/gameLevel/schema";

export default defineSchema({
  // Existing tables
  players: defineTable(zodOutputToConvex(PlayerSchema))
    .index("userId", ["userId"]),

  // Game level management
  gameSettings: defineTable(zodOutputToConvex(GameSettingsSchema)), // Single record
  gameLevelHistory: defineTable(zodOutputToConvex(GameLevelHistorySchema))
    .index("effectiveDate", ["effectiveDate"])
    .index("level", ["level"])
    .index("triggerType", ["triggerType"]),
});
```

## Core Functions

### Game Level Management Functions

```typescript
// features/gameLevel/functions.ts
import { query, mutation, internalMutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { z } from "zod";
import { GameSettingsSchema, GameLevelHistorySchema } from "./schema";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Note: internalMutation must use standard Convex validators, not zod

// Initialize game settings (run once during setup)
export const initializeGameSettings = zMutation({
  args: {
    launchDate: z.number().optional(), // Defaults to now
  },
  handler: async (ctx, { launchDate = Date.now() }) => {
    // Check if already initialized
    const existing = await ctx.db.query("gameSettings").first();
    if (existing) {
      throw new Error("Game settings already initialized");
    }

    // Create initial settings
    const settings = await ctx.db.insert("gameSettings", {
      currentGameLevel: 10,
      launchDate,
      lastLevelIncrease: launchDate,
      lastCronIncrease: launchDate, // Initialize cron tracking
      isActive: true,
    });

    // Create initial history record
    await ctx.db.insert("gameLevelHistory", {
      level: 10,
      effectiveDate: launchDate,
      triggerType: "init",
      changeAmount: 10,
      notes: "Initial game level",
    });

    return settings;
  }
});

// Get current game level (public query)
export const getCurrentGameLevel = zQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await getGameSettings(ctx);
    return settings.currentGameLevel;
  }
});

// Get detailed game level info (public query)
export const getGameLevelInfo = zQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await getGameSettings(ctx);
    const now = Date.now();
    const timeSinceLastCron = now - settings.lastCronIncrease;
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    const nextCronIncrease = settings.lastCronIncrease + twoWeeksMs;

    return {
      currentLevel: settings.currentGameLevel,
      nextCronIncrease,
      daysUntilNextCron: Math.ceil((nextCronIncrease - now) / (24 * 60 * 60 * 1000)),
      lastCronIncrease: settings.lastCronIncrease,
      lastLevelIncrease: settings.lastLevelIncrease,
      launchDate: settings.launchDate,
      isActive: settings.isActive,
    };
  }
});

// Internal mutation for cron job to increase level by +10
export const increaseLevelScheduled = internalMutation({
  args: {},
  handler: async (ctx) => {
    const settings = await getGameSettings(ctx);

    // Safety check - only increase if enough time has passed since last cron increase
    const now = Date.now();
    const timeSinceLastCron = now - settings.lastCronIncrease;
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

    if (timeSinceLastCron < twoWeeksMs) {
      console.warn(`Cron attempted early increase. Last cron: ${new Date(settings.lastCronIncrease)}`);
      return { success: false, reason: "too_early", timeSinceLastCron };
    }

    if (!settings.isActive) {
      console.warn("Level increases are disabled");
      return { success: false, reason: "disabled" };
    }

    // Count active players (played in last 7 days)
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const activePlayers = await ctx.db
      .query("players")
      .filter((q) => q.gte(q.field("lastActive"), sevenDaysAgo))
      .collect();

    // +10 increment - works regardless of manual changes
    const incrementAmount = 10;
    const newLevel = settings.currentGameLevel + incrementAmount;

    // Update settings with new cron timestamp
    await ctx.db.patch(settings._id, {
      currentGameLevel: newLevel,
      lastCronIncrease: now, // Track when cron last ran
      lastLevelIncrease: now, // Track any level increase
    });

    // Record in history
    await ctx.db.insert("gameLevelHistory", {
      level: newLevel,
      effectiveDate: now,
      previousLevel: settings.currentGameLevel,
      triggerType: "cron",
      playerCount: activePlayers.length,
      changeAmount: incrementAmount,
      notes: `Automatic bi-weekly increase (+${incrementAmount}). ${activePlayers.length} active players.`,
    });

    console.log(`Game level increased to ${newLevel} via cron (+${incrementAmount}). Previous: ${settings.currentGameLevel}`);

    return {
      success: true,
      previousLevel: settings.currentGameLevel,
      newLevel,
      incrementAmount,
      activePlayerCount: activePlayers.length
    };
  }
});

// Manual level change (admin only) - can increase or decrease
export const setGameLevelManual = zMutation({
  args: {
    adminUserId: z.string(),
    newLevel: z.number(),
    notes: z.string().optional(),
  },
  handler: async (ctx, { adminUserId, newLevel, notes }) => {
    // TODO: Add admin permission check
    // const isAdmin = await checkAdminPermissions(ctx, adminUserId);
    // if (!isAdmin) throw new Error("Unauthorized");

    if (newLevel < 10) {
      throw new Error("Game level cannot be less than 10");
    }

    const settings = await getGameSettings(ctx);
    const now = Date.now();
    const previousLevel = settings.currentGameLevel;

    if (newLevel === previousLevel) {
      return { success: false, reason: "no_change", currentLevel: newLevel };
    }

    // Update settings - only update lastLevelIncrease, not lastCronIncrease
    await ctx.db.patch(settings._id, {
      currentGameLevel: newLevel,
      lastLevelIncrease: now,
      // lastCronIncrease stays the same - this preserves cron scheduling
    });

    // Record in history
    const changeType = newLevel > previousLevel ? "increase" : "decrease";
    const changeAmount = newLevel - previousLevel; // Can be negative

    await ctx.db.insert("gameLevelHistory", {
      level: newLevel,
      effectiveDate: now,
      previousLevel,
      triggerType: "manual",
      changeAmount,
      notes: notes || `Manual ${changeType} by admin ${adminUserId} (${changeAmount > 0 ? "+" : ""}${changeAmount})`,
    });

    console.log(`Game level manually changed from ${previousLevel} to ${newLevel} by ${adminUserId}`);

    return {
      success: true,
      previousLevel,
      newLevel,
      changeType,
      changeAmount: Math.abs(changeAmount)
    };
  }
});

// Toggle automatic level increases
export const toggleAutomaticIncreases = zMutation({
  args: {
    adminUserId: z.string(),
    isActive: z.boolean(),
    reason: z.string().optional(),
  },
  handler: async (ctx, { adminUserId, isActive, reason }) => {
    // TODO: Add admin permission check

    const settings = await getGameSettings(ctx);
    const now = Date.now();

    await ctx.db.patch(settings._id, {
      isActive,
    });

    // Record in history if disabling
    if (!isActive) {
      await ctx.db.insert("gameLevelHistory", {
        level: settings.currentGameLevel,
        effectiveDate: now,
        previousLevel: settings.currentGameLevel,
        triggerType: "manual",
        changeAmount: 0,
        notes: `Automatic increases disabled by ${adminUserId}. Reason: ${reason || "Not specified"}`,
      });
    }

    return { success: true, isActive, currentLevel: settings.currentGameLevel };
  }
});

// Get game level history
export const getGameLevelHistory = zQuery({
  args: {
    limit: z.number().optional().default(10),
    triggerType: z.enum(["cron", "manual", "init"]).optional(),
  },
  handler: async (ctx, { limit, triggerType }) => {
    let query = ctx.db.query("gameLevelHistory");

    if (triggerType) {
      query = query.withIndex("triggerType", (q) => q.eq("triggerType", triggerType));
    }

    return await query.order("desc").take(limit);
  }
});

// Helper functions
async function getGameSettings(ctx: any) {
  const settings = await ctx.db.query("gameSettings").first();
  if (!settings) {
    throw new Error("Game settings not initialized. Run initializeGameSettings first.");
  }
  return settings;
}
```

## Cron Job Configuration

### Cron Jobs Setup

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Bi-weekly game level increase - runs every 14 days at midnight UTC
// Cron attempts to add +10 to current level, regardless of manual changes
crons.cron(
  "game-level-increase",
  "0 0 */14 * *", // Every 14 days at midnight UTC
  internal.gameLevel.functions.increaseLevelScheduled
);

export default crons;
```

### Alternative Scheduling Options

For more predictable scheduling, you can use specific dates:

```typescript
// Option 1: First and fifteenth of each month
crons.cron(
  "game-level-increase",
  "0 0 1,15 * *", // 1st and 15th at midnight UTC
  internal.gameLevel.functions.increaseLevelScheduled
);

// Option 2: Every other Monday (more social timing)
crons.cron(
  "game-level-increase",
  "0 0 * * 1/2", // Every other Monday at midnight UTC
  internal.gameLevel.functions.increaseLevelScheduled
);
```

## XP System Integration

### Updated XP Functions

```typescript
// features/progression/functions.ts - Updated to use centralized game level
import { getCurrentGameLevel } from "../gameLevel/functions";

export const awardXP = zMutation({
  args: {
    userId: z.string(),
    xpAmount: z.number()
  },
  handler: async (ctx, { userId, xpAmount }) => {
    // Get player and current game level from centralized storage
    const player = await getPlayerByUserId(ctx, userId);
    const gameLevel = await getCurrentGameLevel(ctx, {});

    // Calculate current player level from XP
    const currentLevel = calculatePlayerLevel(player.xp);

    // Apply XP multiplier based on game level
    const multiplier = getXPMultiplier(currentLevel, gameLevel);
    const actualXP = Math.floor(xpAmount * multiplier);

    // Calculate new total XP and level
    const newTotalXP = player.xp + actualXP;
    const newLevel = calculatePlayerLevel(newTotalXP);

    // Update player XP, level, and last active timestamp
    await ctx.db.patch(player._id, {
      xp: newTotalXP,
      level: newLevel,
      lastActive: Date.now()
    });

    return {
      xpAwarded: actualXP,
      newTotalXP,
      newLevel,
      gameLevel, // Include current game level in response
      multiplier, // Include multiplier for transparency
    };
  }
});

// XP multiplier calculation
function getXPMultiplier(playerLevel: number, gameLevel: number): number {
  if (playerLevel < gameLevel) {
    // Catch-up bonus: XP Multiplier = 1.0 + (levels_behind × bonus_per_level)
    const levelsBehind = gameLevel - playerLevel;
    const bonusPerLevel = 0.1; // 10% bonus per level behind
    const multiplier = 1.0 + (levelsBehind * bonusPerLevel);
    return Math.min(5.0, multiplier); // Cap at 5.0x (500% XP)
  } else if (playerLevel > gameLevel) {
    // Prestige penalty: XP Multiplier = 1.0 - (levels_ahead × penalty_per_level)
    const levelsAhead = playerLevel - gameLevel;
    const penaltyPerLevel = 0.09; // 9% penalty per level ahead
    const multiplier = 1.0 - (levelsAhead * penaltyPerLevel);
    return Math.max(0.1, multiplier); // Floor at 0.1x (10% XP)
  } else {
    return 1.0; // Normal XP rate at game level
  }
}

// Helper functions
async function getPlayerByUserId(ctx: any, userId: string) {
  const player = await ctx.db
    .query("players")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!player) {
    throw new Error(`Player ${userId} not found`);
  }

  return player;
}

function calculatePlayerLevel(totalXP: number): number {
  let level = 1;
  let cumulativeXP = 0;

  while (cumulativeXP < totalXP) {
    level++;
    cumulativeXP += getXPRequiredForLevel(level);
  }

  return level - 1;
}

function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.15, level - 2));
}
```

## Error Handling & Safety

### Cron Job Safety Measures

```typescript
// Enhanced error handling in cron function
export const increaseLevelScheduled = zInternalMutation({
  args: {},
  handler: async (ctx) => {
    try {
      const settings = await getGameSettings(ctx);

      // Multiple safety checks
      const now = Date.now();
      const timeSinceLastCron = now - settings.lastCronIncrease;
      const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

      // Time validation
      if (timeSinceLastCron < twoWeeksMs) {
        const hoursRemaining = Math.ceil((twoWeeksMs - timeSinceLastCron) / (60 * 60 * 1000));
        console.warn(`Cron early attempt blocked. ${hoursRemaining} hours remaining.`);
        return {
          success: false,
          reason: "too_early",
          hoursRemaining,
          lastCronIncrease: settings.lastCronIncrease
        };
      }

      // Active flag check
      if (!settings.isActive) {
        console.warn("Automatic level increases are disabled");
        return { success: false, reason: "disabled" };
      }

      // Level bounds check
      const newLevel = settings.currentGameLevel + 10;
      if (newLevel > 1000) { // Arbitrary high limit
        console.error(`Game level would exceed maximum (${newLevel} > 1000)`);
        return { success: false, reason: "level_too_high", wouldBe: newLevel };
      }

      // Proceed with increase...
      // [Rest of function implementation]

    } catch (error) {
      console.error("Failed to increase game level:", error);
      return {
        success: false,
        reason: "error",
        error: error.message
      };
    }
  }
});
```

## Administrative Tools

### Admin Dashboard Queries

```typescript
// Get comprehensive game state for admin dashboard
export const getGameStateSummary = zQuery({
  args: {},
  handler: async (ctx) => {
    const gameInfo = await getGameLevelInfo(ctx, {});
    const recentHistory = await getGameLevelHistory(ctx, { limit: 5 });

    // Calculate player level distribution
    const players = await ctx.db.query("players").collect();
    const levelDistribution = players.reduce((acc, player) => {
      const levelRange = Math.floor(player.level / 10) * 10; // Group by 10s
      acc[levelRange] = (acc[levelRange] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Calculate average player level
    const totalLevels = players.reduce((sum, player) => sum + player.level, 0);
    const averageLevel = players.length > 0 ? totalLevels / players.length : 0;

    return {
      gameLevel: gameInfo,
      playerStats: {
        totalPlayers: players.length,
        averageLevel: Math.round(averageLevel * 10) / 10,
        levelDistribution,
      },
      recentHistory,
    };
  }
});

// Check if cron job is healthy
export const getCronHealthStatus = zQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await getGameSettings(ctx);
    const now = Date.now();
    const timeSinceLastCron = now - settings.lastCronIncrease;
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

    const isOverdue = timeSinceLastCron > (twoWeeksMs + (24 * 60 * 60 * 1000)); // 1 day grace
    const nextExpected = settings.lastCronIncrease + twoWeeksMs;

    return {
      isHealthy: !isOverdue && settings.isActive,
      isActive: settings.isActive,
      isOverdue,
      timeSinceLastCron,
      nextExpectedIncrease: nextExpected,
      daysOverdue: isOverdue ? Math.floor((now - nextExpected) / (24 * 60 * 60 * 1000)) : 0,
    };
  }
});
```

## Testing & Development

### Development Configuration

For testing, use a shorter interval:

```typescript
// convex/crons.ts - Development version
const crons = cronJobs();

// FOR TESTING ONLY - Daily increases instead of bi-weekly
crons.cron(
  "game-level-increase-dev",
  "0 0 * * *", // Daily at midnight UTC
  internal.gameLevel.functions.increaseLevelScheduled
);
```

### Manual Testing Functions

```typescript
// FOR DEVELOPMENT ONLY - Force cron execution
export const forceCronExecution = zMutation({
  args: {
    adminUserId: z.string(),
    bypassTimeCheck: z.boolean().default(false),
  },
  handler: async (ctx, { adminUserId, bypassTimeCheck }) => {
    // Only available in development
    if (process.env.CONVEX_CLOUD_URL?.includes("prod")) {
      throw new Error("Force execution not allowed in production");
    }

    if (bypassTimeCheck) {
      // Temporarily update lastCronIncrease to allow immediate execution
      const settings = await getGameSettings(ctx);
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);

      await ctx.db.patch(settings._id, {
        lastCronIncrease: twoWeeksAgo
      });
    }

    // Execute the cron function
    return await increaseLevelScheduled(ctx, {});
  }
});
```

## Deployment Checklist

### Initial Setup
1. **Deploy Schema**: Ensure gameSettings and gameLevelHistory tables are created
2. **Initialize Settings**: Run `initializeGameSettings` once
3. **Deploy Cron**: Ensure cron job is active in production
4. **Verify Timing**: Check that cron schedule aligns with desired dates

### Production Monitoring
1. **Cron Health**: Monitor `getCronHealthStatus` for issues
2. **Level History**: Check `gameLevelHistory` for successful executions
3. **Player Impact**: Monitor XP multiplier effectiveness
4. **Performance**: Ensure cron executions complete quickly

### Emergency Procedures
1. **Disable Cron**: Use `toggleAutomaticIncreases(false)` if needed
2. **Manual Adjustment**: Use `setGameLevelManual` to correct issues
3. **History Review**: Check `gameLevelHistory` to understand problems
4. **Re-enable**: Use `toggleAutomaticIncreases(true)` when ready

---

*This implementation provides a robust, automated game level progression system with comprehensive administrative control and monitoring capabilities.*