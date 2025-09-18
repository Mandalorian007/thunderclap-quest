# Game Level System Design

## Overview

The Game Level System implements a **Paragon-style progression** where players can exceed the current game level but face exponentially increasing XP requirements. A global game level increases bi-weekly, providing catch-up mechanics for players below the current level while maintaining prestige for players who push beyond it.

## Core Concepts

### Game Level vs Player Level
- **Game Level**: A global server value that increases every 2 weeks, representing the "current content level"
- **Player Level**: Individual player progression that can exceed game level
- **Catch-Up Window**: Players below game level receive significant XP bonuses
- **Prestige Zone**: Players above game level face reduced XP rates but gain prestige

### Design Philosophy
- **Accessible Progression**: New and returning players can quickly reach current content
- **Prestige Rewards**: Hardcore players can push ahead for bragging rights
- **No Power Gaps**: Level differences don't create mechanical advantages (levels are pure prestige)
- **Sustainable Growth**: Bi-weekly increases prevent infinite level inflation

## Game Level Progression Schedule

### Bi-Weekly Increase System
```
Week 1-2:   Game Level 1
Week 3-4:   Game Level 2
Week 5-6:   Game Level 3
...
Week N:     Game Level = floor((weeks_since_launch - 1) / 2) + 1
```

### Launch Schedule Example
```
Launch Date:     January 1st  → Game Level 1
January 15th:    +2 weeks     → Game Level 2
January 29th:    +2 weeks     → Game Level 3
February 12th:   +2 weeks     → Game Level 4
```

### Special Events
- **Community Events**: Future consideration for temporary XP bonuses during special occasions

## XP Scaling System

### Exponential Level Requirements

#### Base XP Formula
```typescript
function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;

  // Exponential scaling: 100 * (1.15^(level-1))
  // Level 2: 100 XP, Level 3: 115 XP, Level 4: 132 XP, Level 10: 304 XP
  return Math.floor(100 * Math.pow(1.15, level - 2));
}

function getTotalXPForLevel(level: number): number {
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += getXPRequiredForLevel(i);
  }
  return totalXP;
}
```

#### XP Requirements Table
| Level | XP This Level | Total XP | Notes |
|-------|---------------|----------|-------|
| 1 | 0 | 0 | Starting level |
| 2 | 100 | 100 | Easy first level |
| 3 | 115 | 215 | 15% increase |
| 4 | 132 | 347 | Compound growth |
| 5 | 152 | 499 | |
| 10 | 304 | 1,994 | 3x harder than level 2 |
| 15 | 610 | 6,528 | 6x harder than level 2 |
| 20 | 1,223 | 19,244 | 12x harder than level 2 |
| 25 | 2,453 | 54,949 | 24x harder than level 2 |
| 30 | 4,922 | 152,261 | 49x harder than level 2 |

### XP Rate Modifiers

#### Catch-Up Mechanics (Below Game Level)
```typescript
function getCatchUpMultiplier(playerLevel: number, gameLevel: number): number {
  if (playerLevel >= gameLevel) return 1.0;

  // Linear scaling from 5x bonus down to 1x as you approach game level
  const levelsBehind = gameLevel - playerLevel;
  const maxBonus = 5.0; // 500% XP bonus
  const bonusDecay = maxBonus / gameLevel; // Bonus decreases as game level increases

  return Math.min(maxBonus, 1.0 + (levelsBehind * bonusDecay));
}
```

#### Prestige Penalties (Above Game Level)
```typescript
function getPrestigePenalty(playerLevel: number, gameLevel: number): number {
  if (playerLevel <= gameLevel) return 1.0;

  // Linear scaling from 100% down to 10% over 10 levels above game level
  const levelsAhead = playerLevel - gameLevel;
  const maxPenalty = 0.9; // 90% reduction maximum
  const penaltyScale = maxPenalty / 10; // 9% penalty per level ahead

  return Math.max(0.1, 1.0 - (levelsAhead * penaltyScale));
}
```

#### Combined XP Multiplier
```typescript
function getXPMultiplier(playerLevel: number, gameLevel: number): number {
  if (playerLevel < gameLevel) {
    return getCatchUpMultiplier(playerLevel, gameLevel);
  } else if (playerLevel > gameLevel) {
    return getPrestigePenalty(playerLevel, gameLevel);
  } else {
    return 1.0; // Normal XP rate at game level
  }
}
```

### XP Multiplier Examples

**Scenario: Game Level 10**

| Player Level | Levels Behind/Ahead | XP Multiplier | Effective Rate |
|--------------|-------------------|---------------|----------------|
| 5 | -5 behind | 3.5x | 350% XP |
| 7 | -3 behind | 2.5x | 250% XP |
| 9 | -1 behind | 1.5x | 150% XP |
| 10 | At game level | 1.0x | 100% XP |
| 12 | +2 ahead | 0.82x | 82% XP |
| 15 | +5 ahead | 0.55x | 55% XP |
| 20 | +10 ahead | 0.10x | 10% XP |

## Centralized XP Management

### Core XP System

#### Simple XP Award Function
```typescript
// features/progression/functions.ts
import { mutation, query } from "../../_generated/server";
import { z } from "zod";

// Get current game level based on launch date
export const getCurrentGameLevel = query({
  args: {},
  handler: async (ctx) => {
    // Calculate based on bi-weekly schedule
    const launchDate = new Date('2024-01-01').getTime(); // Set actual launch date
    const now = Date.now();
    const weeksSinceLaunch = Math.floor((now - launchDate) / (7 * 24 * 60 * 60 * 1000));

    return Math.floor(weeksSinceLaunch / 2) + 1;
  }
});

// Simple centralized XP awarding function
export const awardXP = mutation({
  args: {
    userId: z.string(),
    xpAmount: z.number()
  },
  handler: async (ctx, { userId, xpAmount }) => {
    // Get player and game level
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
      newLevel
    };
  }
});

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

function getXPMultiplier(playerLevel: number, gameLevel: number): number {
  if (playerLevel < gameLevel) {
    // Catch-up bonus
    const levelsBehind = gameLevel - playerLevel;
    const maxBonus = 5.0;
    const bonusDecay = maxBonus / Math.max(gameLevel, 1);
    return Math.min(maxBonus, 1.0 + (levelsBehind * bonusDecay));
  } else if (playerLevel > gameLevel) {
    // Prestige penalty
    const levelsAhead = playerLevel - gameLevel;
    const penaltyScale = 0.09; // 9% per level
    return Math.max(0.1, 1.0 - (levelsAhead * penaltyScale));
  } else {
    return 1.0;
  }
}
```

### Feature Integration

#### Updated Encounter Functions
```typescript
// features/social/functions.ts - Updated to use centralized system
import { awardXP } from "../progression/functions";

export const laughAtJoke = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    // Use centralized XP system - simple interface
    await awardXP(ctx, { userId, xpAmount: 15 });

    // Award title if first time
    await awardTitleIfNew(ctx, userId, "Good Sport");

    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});
```

## Player Experience Benefits

### For New Players
- **Natural Catch-Up**: Built-in XP multipliers help reach current content without special periods
- **Reduced Grind**: Don't need to replay months of content progression
- **Immediate Relevance**: Can participate in current community activities

### For Active Players
- **Steady Progress**: Regular bi-weekly game level increases provide progression goals
- **No Rushing**: Bi-weekly schedule allows casual play to keep up
- **Achievement Recognition**: Staying at game level shows consistent engagement

### For Hardcore Players
- **Prestige Opportunity**: Pushing ahead of game level demonstrates dedication
- **Long-term Goals**: High levels remain challenging with built-in catch-up system
- **Community Status**: Level becomes meaningful social currency

## Implementation Phases

### Phase 1: Core System (Week 1-2)
- [ ] Implement exponential XP formula and level calculation
- [ ] Create centralized `awardXP` function with multipliers
- [ ] Add game level calculation based on bi-weekly schedule
- [ ] Update player schema to store level field

### Phase 2: Integration (Week 3-4)
- [ ] Replace all encounter XP calls with centralized system
- [ ] Implement catch-up and prestige multipliers
- [ ] Update profile display to show game level relationship
- [ ] Test XP progression across all encounter types

### Phase 3: Balance & Polish (Week 5-6)
- [ ] Monitor player level distribution
- [ ] Adjust XP values and multipliers as needed
- [ ] Community feedback integration
- [ ] Performance optimization

## Balancing Considerations

### XP Amount Guidelines
- **Base Encounter XP**: 10-30 XP per action (current system)
- **Daily Play Session**: 100-200 base XP (3-6 encounters)
- **Weekly Progression**: 1-2 levels at game level with regular play
- **Catch-Up Time**: 2-3 weeks to reach game level from 5 levels behind

### Monitoring Metrics
- **Player Level Distribution**: Track how players cluster around game level
- **Catch-Up Effectiveness**: Measure time for new players to reach current content
- **Prestige Engagement**: Track how many players push beyond game level
- **Community Progression**: Monitor overall player advancement rates

## Future Enhancements

### Community Events
- **Special Events**: Temporary XP bonuses during special occasions or milestones
- **Community Goals**: Server-wide progression targets

### Social Features
- **Leaderboards**: Weekly/monthly top players by level
- **Guild Progression**: Collective guild advancement goals
- **Achievement Systems**: Special recognition for progression milestones

---

*This system provides sustainable, accessible progression while maintaining long-term engagement through prestige mechanics and regular content updates.*