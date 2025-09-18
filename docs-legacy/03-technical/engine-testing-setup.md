# Engine Testing Guide

## Minimal Setup

### **Install Dependencies**
```bash
npm install --save-dev convex-test vitest @edge-runtime/vm
```

### **Basic Config**
```typescript
// vitest.config.mts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } }
  }
});
```

```json
// package.json
{
  "scripts": {
    "test:engine": "vitest convex/"
  }
}
```

## Testing the Reward System

### **ActionResult Testing**
Test actions that return rewards by calling them directly:

```typescript
import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

test("action returns correct rewards", async () => {
  const t = createTestInstance();
  const userId = "test-user";

  // Create player
  await t.mutation(api.features.profile.functions.createPlayer, {
    userId,
    displayName: "Test Player"
  });

  // Execute action directly to test ActionResult
  const result = await t.mutation(api.features.social.functions.laughAtJoke, {
    userId
  });

  // Verify ActionResult structure
  expect(result.nextTemplateId).toBe("SOCIAL_SUCCESS");
  expect(result.rewards).toBeDefined();
  expect(result.rewards.rewards).toHaveLength(2); // XP + Title

  // Verify reward details
  const xpReward = result.rewards.rewards.find(r => r.icon === "✨");
  expect(xpReward.amount).toBeGreaterThan(0);
  expect(xpReward.name).toBe("Experience");

  const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
  expect(titleReward.amount).toBe(1);
  expect(titleReward.name).toBe("Good Sport");
});
```

### **Smart Helper Testing**
Test that helpers only award when appropriate:

```typescript
test("title helper is smart about duplicates", async () => {
  const t = createTestInstance();
  const userId = "test-user";

  await t.mutation(api.features.profile.functions.createPlayer, {
    userId,
    displayName: "Test Player"
  });

  // First time should award title and XP
  const result1 = await t.mutation(api.features.social.functions.laughAtJoke, {
    userId
  });
  expect(result1.rewards.rewards).toHaveLength(2);

  // Second time should only award XP
  const result2 = await t.mutation(api.features.social.functions.laughAtJoke, {
    userId
  });
  expect(result2.rewards.rewards).toHaveLength(1);
  expect(result2.rewards.rewards[0].icon).toBe("✨"); // Only XP
});
```

### **Engine Integration Testing**
Test that the engine passes rewards correctly:

```typescript
test("engine passes rewards to templates", async () => {
  const t = createTestInstance();
  const userId = "test-user";

  // Execute through engine
  const actionResult = await t.mutation(api.engine.core.executeAction, {
    templateId: "JOKESTER_ENCOUNTER",
    actionId: "LAUGH_AT_JOKE",
    userId
  });

  // Engine should include rewards
  expect(actionResult.rewards).toBeDefined();

  // Template execution should merge rewards into content
  const templateResult = await t.query(api.engine.core.executeTemplate, {
    templateId: "SOCIAL_SUCCESS",
    userId,
    rewards: actionResult.rewards
  });

  expect(templateResult.content.rewards).toEqual(actionResult.rewards);
});
```

### **Reward Format Validation**
Ensure all rewards follow the standard format:

```typescript
test("rewards follow icon+amount+name pattern", async () => {
  const t = createTestInstance();
  const userId = "test-user";

  await t.mutation(api.features.profile.functions.createPlayer, {
    userId,
    displayName: "Test Player"
  });

  const result = await t.mutation(api.features.social.functions.laughAtJoke, {
    userId
  });

  // Verify each reward follows the pattern
  for (const reward of result.rewards.rewards) {
    expect(typeof reward.icon).toBe("string");
    expect(reward.icon.length).toBeGreaterThan(0);
    expect(typeof reward.amount).toBe("number");
    expect(reward.amount).toBeGreaterThan(0);
    expect(typeof reward.name).toBe("string");
    expect(reward.name.length).toBeGreaterThan(0);
  }
});
```

## Single Engine Test Demo

This example shows how to test our Feature Template Set flow without any UI dependencies:

```typescript
// convex/engine-demo.test.ts
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { ChestTemplateId } from "./features/chest/types";

test("chest encounter engine flow", async () => {
  // Fresh isolated backend - automatic cleanup
  const t = convexTest(schema);
  const userId = "test-player-123";

  // Setup test player
  await t.run(async (ctx) => {
    await ctx.db.insert("players", {
      userId,
      displayName: "Test Player",
      xp: 0,
      level: 1,
      titles: [],
      equippedGear: {},
      inventory: [],
      createdAt: Date.now(),
      lastActive: Date.now()
    });
  });

  // Test the engine: MYSTERIOUS_CHEST → CHEST_EXAMINED
  const examineResult = await t.mutation(api.features.chest.examineChest, { userId });
  expect(examineResult).toBe(ChestTemplateId.CHEST_EXAMINED);

  // Verify side effects (XP gain)
  const updatedPlayer = await t.run(async (ctx) => {
    return await ctx.db.query("players").filter(q => q.eq(q.field("userId"), userId)).first();
  });

  expect(updatedPlayer?.xp).toBe(10); // XP awarded for examining

  // Test next transition: CHEST_EXAMINED → LOOT_SELECTION (or back to examined)
  const forceOpenResult = await t.mutation(api.features.chest.forceOpenChest, { userId });
  expect([ChestTemplateId.LOOT_SELECTION, ChestTemplateId.CHEST_EXAMINED]).toContain(forceOpenResult);
});
```

## What This Tests

- **Template Flow**: Validates your enum-based routing works correctly
- **Business Logic**: Confirms XP is awarded, items are generated, etc.
- **Engine Integration**: Tests the complete Convex function → template transition cycle
- **Data Persistence**: Verifies player state changes are saved

## Run the Test

```bash
npm run test:engine
```

That's it. No complex setup, no extensive mocking - just validate your core engine framework works as designed before building any Discord bot UI.