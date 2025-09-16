import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { ChestTemplateId } from "./features/chest-feature";

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

  // Test disarm trap (higher success rate)
  const disarmResult = await t.mutation(api.features.chest.disarmTrap, { userId });
  expect([ChestTemplateId.LOOT_SELECTION, ChestTemplateId.CHEST_EXAMINED]).toContain(disarmResult);

  // Test dynamic content queries
  const examineContent = await t.query(api.features.chest.getExamineResults, { userId });
  expect(examineContent.title).toBe("Trap Detected!");
  expect(examineContent.trapType).toBe("pressure plate");
  expect(examineContent.playerSkillLevel).toBe(1);

  // Test loot options query
  const lootContent = await t.query(api.features.chest.getLootOptions, { userId });
  expect(lootContent.title).toBe("Treasure Found!");
  expect(lootContent.availableItems).toHaveLength(2);
  expect(lootContent.coinsAvailable).toBeGreaterThan(0);
});

test("player creation and XP system", async () => {
  const t = convexTest(schema);
  const userId = "test-player-456";

  // Test getOrCreatePlayer
  const player = await t.mutation(api.players.getOrCreatePlayer, {
    userId,
    displayName: "Test Player 2"
  });

  expect(player.userId).toBe(userId);
  expect(player.displayName).toBe("Test Player 2");
  expect(player.xp).toBe(0);
  expect(player.level).toBe(1);

  // Test XP awarding
  const xpResult = await t.mutation(api.players.awardXP, {
    userId,
    xpAmount: 100
  });

  expect(xpResult.xpAwarded).toBe(100);
  expect(xpResult.newXP).toBe(100);
  expect(xpResult.newLevel).toBe(2); // Level formula: floor(sqrt(xp/100)) + 1

  // Verify player state
  const updatedPlayer = await t.query(api.players.getPlayer, { userId });
  expect(updatedPlayer?.xp).toBe(100);
  expect(updatedPlayer?.level).toBe(2);
});