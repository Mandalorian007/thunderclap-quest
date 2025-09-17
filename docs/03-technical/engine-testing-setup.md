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