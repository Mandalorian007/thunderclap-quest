# Global Reward System

## Overview

The Global Reward System provides a unified, extensible framework for awarding and displaying player rewards across all game features. It ensures consistent UI display and smart logic that only shows meaningful rewards.

## Core Philosophy

- **Icon + Amount + Name**: Every reward follows this simple, visual pattern
- **Smart Helpers**: Only award what's actually earned (no duplicate titles)
- **Universal Display**: Same reward format works everywhere (Discord, web, mobile)
- **Extensible**: Easy to add new reward types without changing existing code

## Core Interfaces

### RewardEntry
```typescript
interface RewardEntry {
  icon: string;      // Emoji for visual display (e.g., "✨")
  amount: number;    // Quantity earned (always positive)
  name: string;      // Human-readable name (e.g., "Experience")
}
```

### RewardBundle
```typescript
interface RewardBundle {
  rewards: RewardEntry[];
}
```

### ActionResult
```typescript
interface ActionResult {
  nextTemplateId: string | null;  // Where to go next
  rewards?: RewardBundle;         // What was earned
}
```

## Reward Type Constants

**File**: `apps/convex/convex/shared/rewards.ts`

```typescript
export const XP_REWARD = { icon: "✨", name: "Experience" } as const;
export const TITLE_REWARD = { icon: "🏆", name: "Title" } as const;
export const GOLD_REWARD = { icon: "🪙", name: "Gold" } as const;
export const ITEM_REWARD = { icon: "📦", name: "Item" } as const;
export const STAT_REWARD = { icon: "📊", name: "Stat" } as const;
export const UNLOCK_REWARD = { icon: "🗺️", name: "Unlock" } as const;
export const ACHIEVEMENT_REWARD = { icon: "🎖️", name: "Achievement" } as const;
```

**Usage Pattern**:
```typescript
// Reference constants like this:
{ icon: XP_REWARD.icon, amount: 25, name: XP_REWARD.name }
{ icon: TITLE_REWARD.icon, amount: 1, name: "Brave Hero" }
```

## Smart Helper Functions

### XP Helper
```typescript
// Returns actual XP awarded (includes multipliers, catch-up bonuses, etc.)
export async function awardXPHelper(
  ctx: any,
  userId: string,
  xpAmount: number,
  source: string
): Promise<{ xpAwarded: number; xpMultiplier: number; newLevel: number; levelUp: boolean; /* ... */ }>
```

### Title Helper
```typescript
// Returns true only if title was newly awarded, false if player already had it
export async function awardTitleHelper(
  ctx: any,
  userId: string,
  title: string
): Promise<boolean>
```

## Action Function Pattern

### Basic Implementation
```typescript
import { ActionResult, XP_REWARD, TITLE_REWARD } from "../../shared/rewards";

export const laughAtJoke = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    // Award XP and check for new title
    const xpResult = await awardXPHelper(ctx, userId, 15, "social.laughAtJoke");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Good Sport");

    // Build rewards array
    const rewards = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    // Only include title if it was actually newly awarded
    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Good Sport" });
    }

    return {
      nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
      rewards: { rewards }
    };
  }
});
```

### Multiple Reward Types
```typescript
export const openTreasureChest = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 50, "treasure.opened");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Treasure Hunter");

    // Simulate finding gold and an item
    await awardGold(ctx, userId, 100);
    await awardItem(ctx, userId, "magic_sword");

    const rewards = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name },
      { icon: GOLD_REWARD.icon, amount: 100, name: GOLD_REWARD.name },
      { icon: ITEM_REWARD.icon, amount: 1, name: "Magic Sword" }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Treasure Hunter" });
    }

    return {
      nextTemplateId: TreasureTemplateId.TREASURE_SUCCESS,
      rewards: { rewards }
    };
  }
});
```

## Engine Integration

### Action Execution
The engine automatically handles both legacy and reward-enabled actions:

```typescript
// In engine/core.ts
const result = await action.execute(ctx, { userId });

// Handle ActionResult with rewards
if (result && typeof result === 'object' && 'nextTemplateId' in result) {
  return {
    nextTemplateId: result.nextTemplateId,
    isComplete: !result.nextTemplateId,
    rewards: result.rewards  // Pass rewards through
  };
}

// Handle legacy string/null result (backward compatible)
return result ? { nextTemplateId: result as string } : { isComplete: true };
```

### Template Content
Rewards are automatically added to template content:

```typescript
// In engine/core.ts executeTemplate
if (rewards) {
  content = {
    ...content,
    rewards  // Merge rewards into content
  };
}
```

## Discord Display

### Automatic Rendering
The content renderer automatically detects and displays rewards:

```typescript
// In contentRenderers.ts
if (content.rewards && content.rewards.rewards && content.rewards.rewards.length > 0) {
  embed.addFields({
    name: '🎁 Rewards Earned',
    value: formatRewardBundle(content.rewards),
    inline: false
  });
}
```

### Universal Formatter
```typescript
function formatRewardBundle(bundle: RewardBundle): string {
  return bundle.rewards
    .map(reward => `${reward.icon} +${reward.amount} ${reward.name}`)
    .join('\n');
}
```

## Player Experience Examples

### First Time Action
```
🎁 Rewards Earned
✨ +27 Experience
🏆 +1 Good Sport
```

### Repeat Action (No New Title)
```
🎁 Rewards Earned
✨ +27 Experience
```

### Complex Reward
```
🎁 Rewards Earned
✨ +50 Experience
🪙 +100 Gold
📦 +1 Magic Sword
🏆 +1 Treasure Hunter
```

### No Rewards
```
[No rewards section appears]
```

## Testing Framework

### Testing Actions with Rewards
```typescript
test("laughAtJoke awards XP and title correctly", async () => {
  const t = createTestInstance();
  const userId = "test-user";

  // Create player first
  await t.mutation(api.features.profile.functions.createPlayer, {
    userId,
    displayName: "Test Player"
  });

  // Execute action
  const result = await t.mutation(api.features.social.functions.laughAtJoke, {
    userId
  });

  // Verify ActionResult structure
  expect(result.nextTemplateId).toBe("SOCIAL_SUCCESS");
  expect(result.rewards).toBeDefined();
  expect(result.rewards.rewards).toHaveLength(2); // XP + Title

  // Verify XP reward
  const xpReward = result.rewards.rewards.find(r => r.icon === "✨");
  expect(xpReward).toBeDefined();
  expect(xpReward.amount).toBeGreaterThan(0);
  expect(xpReward.name).toBe("Experience");

  // Verify title reward
  const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
  expect(titleReward).toBeDefined();
  expect(titleReward.amount).toBe(1);
  expect(titleReward.name).toBe("Good Sport");
});

test("repeated action doesn't award same title twice", async () => {
  const t = createTestInstance();
  const userId = "test-user";

  // Create player and award title once
  await t.mutation(api.features.profile.functions.createPlayer, {
    userId,
    displayName: "Test Player"
  });

  // First execution
  const result1 = await t.mutation(api.features.social.functions.laughAtJoke, {
    userId
  });
  expect(result1.rewards.rewards).toHaveLength(2); // XP + Title

  // Second execution
  const result2 = await t.mutation(api.features.social.functions.laughAtJoke, {
    userId
  });
  expect(result2.rewards.rewards).toHaveLength(1); // Only XP, no duplicate title
});
```

### Testing Template Integration
```typescript
test("template system passes rewards correctly", async () => {
  const t = createTestInstance();
  const userId = "test-user";

  // Mock rewards from action execution
  const mockRewards = {
    rewards: [
      { icon: "✨", amount: 25, name: "Experience" }
    ]
  };

  // Execute template with rewards
  const result = await t.query(api.engine.core.executeTemplate, {
    templateId: "SOCIAL_SUCCESS",
    userId,
    rewards: mockRewards
  });

  // Verify rewards are in content
  expect(result.content.rewards).toEqual(mockRewards);
});
```

## Migration Guide

### Updating Existing Actions

**Before (Legacy)**:
```typescript
export const oldAction = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<string | null> => {
    await awardXPHelper(ctx, userId, 15, "source");
    await awardTitleHelper(ctx, userId, "Title");
    return "NEXT_TEMPLATE";
  }
});
```

**After (With Rewards)**:
```typescript
export const newAction = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 15, "source");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Title");

    const rewards = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Title" });
    }

    return {
      nextTemplateId: "NEXT_TEMPLATE",
      rewards: { rewards }
    };
  }
});
```

### Backward Compatibility
The engine supports both patterns simultaneously. Legacy actions continue to work while new actions provide rich reward feedback.

## Future Extensions

### Additional Reward Types
```typescript
// Stat increases
{ icon: "💪", amount: 2, name: "Strength" }
{ icon: "🧠", amount: 1, name: "Intelligence" }

// Area unlocks
{ icon: "🗺️", amount: 1, name: "Northern Forest" }

// Achievements
{ icon: "🎖️", amount: 1, name: "First Quest Complete" }

// Seasonal rewards
{ icon: "🎃", amount: 5, name: "Halloween Tokens" }
```

### Aggregated Rewards
For multi-step encounters, rewards could be collected and displayed together:

```typescript
// Collect rewards from multiple actions
const allRewards = [
  ...step1Rewards.rewards,
  ...step2Rewards.rewards,
  ...step3Rewards.rewards
];

// Display as single reward summary
return {
  nextTemplateId: "ENCOUNTER_COMPLETE",
  rewards: { rewards: aggregateRewards(allRewards) }
};
```

## Best Practices

1. **Always use smart helpers** - They handle the complexity of multipliers and duplicates
2. **Only show meaningful rewards** - Use helper return values to decide what to include
3. **Use reward constants** - Reference `XP_REWARD.icon` instead of hardcoding "✨"
4. **Test both first-time and repeat scenarios** - Ensure titles aren't duplicated
5. **Keep rewards simple** - Icon + amount + name covers 99% of use cases
6. **Document custom reward types** - If you add new icons, document them for consistency