import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

describe("Social Rewards System", () => {
  describe("laughAtJoke action rewards", () => {
    test("first time awards XP and title", async () => {
      const t = createTestInstance();
      const userId = "test-laugh-first-time";

      // Create player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // Execute action through engine action registry to test ActionResult
      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });

      // Verify ActionResult structure
      expect(result.nextTemplateId).toBe("SOCIAL_SUCCESS");
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
      expect(titleReward.name).toBe("Good Sport");
    });

    test("second time awards only XP, no duplicate title", async () => {
      const t = createTestInstance();
      const userId = "test-laugh-repeat";

      // Create player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // First execution
      const result1 = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });
      expect(result1.rewards.rewards).toHaveLength(2); // XP + Title

      // Second execution
      const result2 = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });
      expect(result2.rewards.rewards).toHaveLength(1); // Only XP

      // Verify only XP reward
      const xpReward = result2.rewards.rewards[0];
      expect(xpReward.icon).toBe("✨");
      expect(xpReward.amount).toBeGreaterThan(0);
      expect(xpReward.name).toBe("Experience");

      // No title reward
      const titleReward = result2.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward).toBeUndefined();
    });

    test("XP amount includes multipliers", async () => {
      const t = createTestInstance();
      const userId = "test-laugh-multiplier";

      // Create player at low level (should get catch-up bonus)
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Low Level Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });

      const xpReward = result.rewards.rewards.find(r => r.icon === "✨");

      // Should be more than base 15 XP due to catch-up bonus
      expect(xpReward.amount).toBeGreaterThan(15);

      // Verify actual player XP matches reward display
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.xp).toBe(xpReward.amount);
    });
  });

  describe("groanAtJoke action rewards", () => {
    test("first time awards XP and different title", async () => {
      const t = createTestInstance();
      const userId = "test-groan-first-time";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "GROAN_AT_JOKE",
        userId
      });

      expect(result.nextTemplateId).toBe("SOCIAL_NEUTRAL");
      expect(result.rewards.rewards).toHaveLength(2); // XP + Title

      // Verify XP reward (should be less than laughing)
      const xpReward = result.rewards.rewards.find(r => r.icon === "✨");
      expect(xpReward).toBeDefined();
      expect(xpReward.amount).toBeGreaterThan(0);

      // Verify different title
      const titleReward = result.rewards.rewards.find(r => r.icon === "🏆");
      expect(titleReward).toBeDefined();
      expect(titleReward.name).toBe("Honest Critic");
    });

    test("awards different title than laughing", async () => {
      const t = createTestInstance();
      const userId = "test-different-titles";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // Laugh first
      const laughResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });
      const laughTitle = laughResult.rewards.rewards.find(r => r.icon === "🏆")?.name;

      // Groan with different player to get fresh title
      const userId2 = "test-different-titles-2";
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: userId2,
        displayName: "Test Player 2"
      });

      const groanResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "GROAN_AT_JOKE",
        userId: userId2
      });
      const groanTitle = groanResult.rewards.rewards.find(r => r.icon === "🏆")?.name;

      // Should be different titles
      expect(laughTitle).toBe("Good Sport");
      expect(groanTitle).toBe("Honest Critic");
      expect(laughTitle).not.toBe(groanTitle);
    });
  });

  describe("engine integration with rewards", () => {
    test("engine executeAction returns rewards", async () => {
      const t = createTestInstance();
      const userId = "test-engine-rewards";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // Execute through engine
      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });

      // Engine should pass through rewards
      expect(result.rewards).toBeDefined();
      expect(result.rewards.rewards).toBeDefined();
      expect(result.rewards.rewards.length).toBeGreaterThan(0);

      // Should have both routing and rewards
      expect(result.nextTemplateId).toBe("SOCIAL_SUCCESS");
    });

    test("template execution includes rewards in content", async () => {
      const t = createTestInstance();
      const userId = "test-template-rewards";

      // Create mock rewards
      const mockRewards = {
        rewards: [
          { icon: "✨", amount: 25, name: "Experience" },
          { icon: "🏆", amount: 1, name: "Test Title" }
        ]
      };

      // Execute template with rewards
      const result = await t.query(api.engine.core.executeTemplate, {
        templateId: "SOCIAL_SUCCESS",
        userId,
        rewards: mockRewards
      });

      // Rewards should be merged into content
      expect(result.content.rewards).toEqual(mockRewards);
    });
  });

  describe("reward system edge cases", () => {
    test("handles empty rewards gracefully", async () => {
      const t = createTestInstance();
      const userId = "test-empty-rewards";

      // Execute template with no rewards
      const result = await t.query(api.engine.core.executeTemplate, {
        templateId: "SOCIAL_SUCCESS",
        userId
        // No rewards parameter
      });

      // Should not have rewards in content
      expect(result.content.rewards).toBeUndefined();
    });

    test("handles malformed rewards gracefully", async () => {
      const t = createTestInstance();
      const userId = "test-malformed-rewards";

      // Execute template with malformed rewards
      const result = await t.query(api.engine.core.executeTemplate, {
        templateId: "SOCIAL_SUCCESS",
        userId,
        rewards: { rewards: null } // Malformed
      });

      // Should include the rewards as-is (renderer will handle safely)
      expect(result.content.rewards).toEqual({ rewards: null });
    });

    test("reward formatting is consistent", async () => {
      const t = createTestInstance();
      const userId = "test-reward-format";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });

      // Verify all rewards follow the icon + amount + name pattern
      for (const reward of result.rewards.rewards) {
        expect(typeof reward.icon).toBe("string");
        expect(reward.icon.length).toBeGreaterThan(0);
        expect(typeof reward.amount).toBe("number");
        expect(reward.amount).toBeGreaterThan(0);
        expect(typeof reward.name).toBe("string");
        expect(reward.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe("complete reward system migration", () => {
    test("all social actions now return rewards", async () => {
      const t = createTestInstance();
      const userId = "test-complete-migration";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      // Test that previously legacy action now returns rewards
      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "TELL_JOKE", // Now uses ActionResult
        userId
      });

      // Should now include rewards
      expect(result.nextTemplateId).toBeDefined();
      expect(result.rewards).toBeDefined();
      expect(result.rewards.rewards).toBeDefined();
      expect(result.rewards.rewards.length).toBeGreaterThan(0);

      // Verify XP reward is present
      const xpReward = result.rewards.rewards.find(r => r.icon === "✨");
      expect(xpReward).toBeDefined();
      expect(xpReward.amount).toBeGreaterThan(0);
    });
  });
});