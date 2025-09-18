# Game Level Cron System Implementation

## Overview

This document outlines the implementation of a centralized game level system using Convex cron jobs for bi-weekly automatic increases, with robust storage and management capabilities.

## Research Findings: Convex Cron Jobs

### Key Capabilities
- **Static Cron Definition**: Cron jobs defined in `convex/crons.ts` file
- **Internal Mutations**: Can call internal mutations for database updates
- **Guaranteed Execution**: Mutations execute exactly once with automatic retry on internal errors
- **UTC Timezone**: All cron schedules run in UTC timezone
- **Durability**: Scheduled functions stored durably and survive system restarts

### Bi-Weekly Scheduling
```typescript
// Option 1: Every 14 days starting from deployment
crons.cron("bi-weekly-game-level", "0 0 */14 * *", internal.gameLevel.increaseLevelScheduled);

// Option 2: Specific day every 2 weeks (more predictable)
crons.cron("bi-weekly-game-level", "0 0 1,15 * *", internal.gameLevel.increaseLevelScheduled);
```

### Limitations
- At most one run of each cron job can execute simultaneously
- If function takes too long, subsequent runs may be skipped
- Cron jobs must be defined statically (no dynamic registration)

## Centralized Game Level Storage

### Schema Design

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
  notes: z.string().optional(),           // Optional admin notes
});

export type GameSettings = z.infer<typeof GameSettingsSchema>;
export type GameLevelHistory = z.infer<typeof GameLevelHistorySchema>;
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
    .index("level", ["level"]),
});
```

## Core Game Level Functions

### Game Level Management

```typescript
// features/gameLevel/functions.ts
import { query, mutation, internalMutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { GameSettingsSchema, GameLevelHistorySchema } from "./schema";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);
const zInternalMutation = zCustomMutation(internalMutation, NoOp);

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
      currentGameLevel: 1,
      launchDate,
      lastLevelIncrease: launchDate,
      lastCronIncrease: launchDate, // Initialize cron tracking
      isActive: true,
    });

    // Create initial history record
    await ctx.db.insert("gameLevelHistory", {
      level: 1,
      effectiveDate: launchDate,
      triggerType: "init",
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

// Internal mutation for cron job to increase level
export const increaseLevelScheduled = zInternalMutation({
  args: {},
  handler: async (ctx) => {
    const settings = await getGameSettings(ctx);

    // Safety check - only increase if enough time has passed since last cron increase
    const now = Date.now();
    const timeSinceLastCron = now - settings.lastCronIncrease;
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

    if (timeSinceLastCron < twoWeeksMs) {
      console.warn(`Cron attempted early increase. Last cron: ${new Date(settings.lastCronIncrease)}`);
      return { success: false, reason: "too_early" };
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

    // Simple +1 increment - works regardless of manual changes
    const newLevel = settings.currentGameLevel + 1;

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
      notes: `Automatic bi-weekly increase (+1). ${activePlayers.length} active players.`,
    });

    console.log(`Game level increased to ${newLevel} via cron. Previous: ${settings.currentGameLevel}`);

    return {
      success: true,
      previousLevel: settings.currentGameLevel,
      newLevel,
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

    if (newLevel < 1) {
      throw new Error("Game level cannot be less than 1");
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
    const changeAmount = Math.abs(newLevel - previousLevel);

    await ctx.db.insert("gameLevelHistory", {
      level: newLevel,
      effectiveDate: now,
      previousLevel,
      triggerType: "manual",
      notes: notes || `Manual ${changeType} by admin ${adminUserId} (${changeType === "increase" ? "+" : "-"}${changeAmount})`,
    });

    console.log(`Game level manually changed from ${previousLevel} to ${newLevel} by ${adminUserId}`);

    return {
      success: true,
      previousLevel,
      newLevel,
      changeType,
      changeAmount
    };
  }
});

// Get game level history
export const getGameLevelHistory = zQuery({
  args: {
    limit: z.number().optional().default(10),
  },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("gameLevelHistory")
      .order("desc")
      .take(limit);
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

// Helper function no longer needed - cron timing is independent of current level
```

## Cron Job Configuration

### Cron Jobs Setup

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Bi-weekly game level increase - runs every 14 days at midnight UTC
// Cron attempts to add +1 to current level, regardless of manual changes
crons.cron(
  "game-level-increase",
  "0 0 */14 * *", // Every 14 days at midnight UTC
  internal.gameLevel.functions.increaseLevelScheduled
);

export default crons;
```

### Alternative Scheduling Options

```typescript
// Option 1: Specific dates (1st and 15th of each month)
crons.cron(
  "game-level-increase",
  "0 0 1,15 * *", // 1st and 15th at midnight UTC
  internal.gameLevel.functions.increaseLevelScheduled
);

// Option 2: Every other Monday at midnight
crons.cron(
  "game-level-increase",
  "0 0 * * 1/2", // Every other Monday
  internal.gameLevel.functions.increaseLevelScheduled
);
```

## Updated XP System Integration

### Enhanced XP Functions

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
    };
  }
});

// Helper function implementations remain the same...
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create game level schema and database tables
- [ ] Implement basic game level functions (get, initialize)
- [ ] Create internal mutation for level increases
- [ ] Add game level history tracking

### Phase 2: Cron Integration (Week 2)
- [ ] Set up cron jobs configuration
- [ ] Implement scheduled level increase function
- [ ] Add safety checks and error handling
- [ ] Test cron job execution in development

### Phase 3: XP System Integration (Week 3)
- [ ] Update awardXP function to use centralized game level
- [ ] Remove old game level calculation logic
- [ ] Update profile display to show game level relationship
- [ ] Test XP multipliers with real game level data

### Phase 4: Management & Monitoring (Week 4)
- [ ] Add manual level increase functionality (admin)
- [ ] Create game level info displays
- [ ] Add game level history queries
- [ ] Implement logging and monitoring

## Error Handling & Safety

### Cron Job Safety Measures
- **Time Validation**: Check if enough time has passed before increasing
- **Active Flag**: Ability to disable automatic increases
- **Duplicate Prevention**: Only one cron job can run at a time
- **Logging**: Comprehensive logging of all level changes

### Recovery Mechanisms
- **Manual Override**: Admin can manually trigger level increases
- **History Tracking**: Complete audit trail of all changes
- **Settings Validation**: Ensure game settings are always in valid state

## Monitoring & Analytics

### Key Metrics to Track
- Current game level vs average player level
- Number of active players at each level increase
- Time between level increases (should be exactly 14 days)
- XP multiplier effectiveness (catch-up rates)

### Admin Dashboard Queries
```typescript
// Get current game state summary
export const getGameStateSummary = zQuery({
  args: {},
  handler: async (ctx) => {
    const gameInfo = await getGameLevelInfo(ctx, {});
    const playerStats = await getPlayerLevelDistribution(ctx);
    const recentHistory = await getGameLevelHistory(ctx, { limit: 5 });

    return {
      gameLevel: gameInfo,
      playerDistribution: playerStats,
      recentChanges: recentHistory,
    };
  }
});
```

## Testing Strategy

### Development Testing
- Use shorter intervals for testing (daily instead of bi-weekly)
- Manual trigger functions for immediate testing
- Comprehensive unit tests for all helper functions

### Production Validation
- Monitor first few cron job executions closely
- Validate XP multipliers are working correctly
- Check player progression rates match expectations

---

*This system provides reliable, automated game level management with comprehensive tracking, safety measures, and administrative control.*