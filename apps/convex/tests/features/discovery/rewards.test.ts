import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

describe("Discovery Rewards System", () => {
  describe("butterfly conference actions", () => {
    test("eavesdropOnButterflies awards XP and title", async () => {
      const t = createTestInstance();
      const userId = "test-butterfly-eavesdrop";

      // Create player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // Execute action directly to test ActionResult
      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "EAVESDROP_ON_BUTTERFLIES",
        userId
      });

      // Verify ActionResult structure
      expect(result.nextTemplateId).toBe("DISCOVERY_WONDER");
      expect(result.rewards).toBeDefined();
      expect(result.rewards.rewards).toBeDefined();
      expect(Array.isArray(result.rewards.rewards)).toBe(true);
      expect(result.rewards.rewards.length).toBe(2); // XP + Title

      // Verify XP reward
      const xpReward = result.rewards.rewards.find(r => r.icon === "✨");
      expect(xpReward).toBeDefined();
      expect(xpReward.amount).toBeGreaterThan(0);
      expect(xpReward.name).toBe("Experience");

      // Verify title reward
      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward).toBeDefined();
      expect(titleReward.amount).toBe(1);
      expect(titleReward.name).toBe("Butterfly Translator");
    });

    test("joinButterflyDebate awards XP and different title", async () => {
      const t = createTestInstance();
      const userId = "test-butterfly-debate";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "JOIN_BUTTERFLY_DEBATE",
        userId
      });

      expect(result.nextTemplateId).toBe("DISCOVERY_WONDER");
      expect(result.rewards.rewards).toHaveLength(2); // XP + Title

      // Verify title is different from eavesdropping
      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward).toBeDefined();
      expect(titleReward.name).toBe("Controversial Pollinator");
    });

    test("mediateButterflyDispute awards higher XP and diplomat title", async () => {
      const t = createTestInstance();
      const userId = "test-butterfly-mediate";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "MEDIATE_BUTTERFLY_DISPUTE",
        userId
      });

      expect(result.nextTemplateId).toBe("DISCOVERY_MAGIC");
      expect(result.rewards.rewards).toHaveLength(2); // XP + Title

      // Verify higher XP amount (25 base vs 15 for other actions)
      const xpReward = result.rewards.rewards.find(r => r.icon === "✨");
      expect(xpReward.amount).toBeGreaterThan(20); // Should be at least base amount with multipliers

      // Verify title
      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward.name).toBe("Diplomat");
    });
  });

  describe("upside-down puddle actions", () => {
    test("stickHandInPuddle awards brave title", async () => {
      const t = createTestInstance();
      const userId = "test-puddle-hand";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "UPSIDE_DOWN_PUDDLE",
        actionId: "STICK_HAND_IN_PUDDLE",
        userId
      });

      expect(result.nextTemplateId).toBe("DISCOVERY_MAGIC");
      expect(result.rewards.rewards).toHaveLength(2); // XP + Title

      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward.name).toBe("Brave");
    });

    test("drinkFromPuddle awards rainbow burper title", async () => {
      const t = createTestInstance();
      const userId = "test-puddle-drink";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "UPSIDE_DOWN_PUDDLE",
        actionId: "DRINK_FROM_PUDDLE",
        userId
      });

      expect(result.nextTemplateId).toBe("DISCOVERY_MAGIC");
      expect(result.rewards.rewards).toHaveLength(2); // XP + Title

      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward.name).toBe("Rainbow Burper");
    });
  });

  describe("book house actions", () => {
    test("knockOnBookDoor awards polite title", async () => {
      const t = createTestInstance();
      const userId = "test-book-knock";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "BOOK_HOUSE",
        actionId: "KNOCK_ON_BOOK_DOOR",
        userId
      });

      expect(result.nextTemplateId).toBe("DISCOVERY_DELIGHT");
      expect(result.rewards.rewards).toHaveLength(2); // XP + Title

      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward.name).toBe("Polite");
    });

    test("readTheWalls awards scholar title", async () => {
      const t = createTestInstance();
      const userId = "test-book-read";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "BOOK_HOUSE",
        actionId: "READ_THE_WALLS",
        userId
      });

      expect(result.nextTemplateId).toBe("DISCOVERY_WONDER");
      expect(result.rewards.rewards).toHaveLength(2); // XP + Title

      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward.name).toBe("Scholar");
    });
  });

  describe("engine integration", () => {
    test("discovery actions work through engine with rewards", async () => {
      const t = createTestInstance();
      const userId = "test-discovery-engine";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // Execute butterfly eavesdrop through engine
      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "EAVESDROP_ON_BUTTERFLIES",
        userId
      });

      // Engine should pass through rewards
      expect(result.rewards).toBeDefined();
      expect(result.rewards.rewards).toBeDefined();
      expect(result.rewards.rewards.length).toBeGreaterThan(0);

      // Should have both routing and rewards
      expect(result.nextTemplateId).toBe("DISCOVERY_WONDER");

      // Verify XP reward is present
      const xpReward = result.rewards.rewards.find(r => r.icon === "✨");
      expect(xpReward).toBeDefined();
      expect(xpReward.amount).toBeGreaterThan(0);
    });
  });

  describe("smart title system", () => {
    test("duplicate titles are not awarded", async () => {
      const t = createTestInstance();
      const userId = "test-duplicate-titles";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // First eavesdrop - should get title
      const result1 = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "EAVESDROP_ON_BUTTERFLIES",
        userId
      });
      expect(result1.rewards.rewards).toHaveLength(2); // XP + Title

      // Second eavesdrop - should only get XP
      const result2 = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "EAVESDROP_ON_BUTTERFLIES",
        userId
      });
      expect(result2.rewards.rewards).toHaveLength(1); // Only XP

      const xpReward = result2.rewards.rewards[0];
      expect(xpReward.icon).toBe("✨");
      expect(xpReward.name).toBe("Experience");
    });
  });
});