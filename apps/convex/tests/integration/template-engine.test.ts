import { describe, it, expect } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestInstance } from "../helpers/test-utils";

describe("Template Engine Integration", () => {

  describe("engine core functions", () => {
    it("should execute profile template without warnings", async () => {
      const t = createTestInstance();
      const userId = "template-test-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Template Test"
      });

      // Execute profile template
      const result = await t.query(api.engine.core.executeTemplate, {
        templateId: "PROFILE_DISPLAY",
        userId
      });

      expect(result.templateId).toBe("PROFILE_DISPLAY");
      expect(result.content).toBeDefined();
      expect(result.content.displayName).toBe("Template Test");
      expect(result.actions).toEqual([]); // Profile is terminal
      expect(result.isTerminal).toBe(true);
    });

    it("should get template registry", async () => {
      const t = createTestInstance();
      const registry = await t.query(api.engine.core.getTemplateRegistry, {});

      expect(Array.isArray(registry)).toBe(true);
      expect(registry).toContain("PROFILE_DISPLAY");
    });

    it("should resolve template content", async () => {
      const t = createTestInstance();
      const userId = "content-test-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Content Test"
      });

      // Test static content
      const staticContent = { title: "Static Test" };
      const staticResult = await t.query(api.engine.core.resolveTemplateContent, {
        content: staticContent,
        userId
      });

      expect(staticResult).toEqual(staticContent);
    });
  });

  describe("social encounter integration", () => {
    it("should execute social action and award rewards", async () => {
      const t = createTestInstance();
      const userId = "social-test-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Social Test"
      });

      // Execute social action
      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });

      expect(result.nextTemplateId).toBe("SOCIAL_SUCCESS");
      expect(result.rewards).toBeDefined();
      expect(result.rewards.rewards).toBeInstanceOf(Array);

      // Verify XP was awarded
      const profileAfter = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileAfter.xp).toBeGreaterThan(0);
    });

    it("should handle completion actions", async () => {
      const t = createTestInstance();
      const userId = "completion-test-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Completion Test"
      });

      // Execute an action that leads to completion (walk away)
      const result = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "WALK_AWAY",
        userId
      });

      expect(result.isComplete).toBe(true);
      expect(result.nextTemplateId).toBeUndefined();
    });
  });

  describe("progression system integration", () => {
    it("should calculate XP multipliers based on game level", async () => {
      const t = createTestInstance();
      const userId = "progression-test-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Progression Test"
      });

      // Get initial profile
      const initialProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(initialProfile.gameLevel).toBeTypeOf("number");
      expect(initialProfile.xpMultiplier).toBeTypeOf("number");

      // Award XP and check multiplier effect
      const xpResult = await t.run(async (ctx) => {
        const { awardXPHelper } = await import("../../convex/features/progression/functions");
        return await awardXPHelper(ctx, userId, 100, "test");
      });

      expect(xpResult.xpMultiplier).toBeTypeOf("number");
      expect(xpResult.xpAwarded).toBeGreaterThan(0);
    });

    it("should get progression statistics", async () => {
      const t = createTestInstance();
      // Create a few test players
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "stats-user-1",
        displayName: "Stats User 1"
      });

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "stats-user-2",
        displayName: "Stats User 2"
      });

      // Award different amounts of XP
      await t.run(async (ctx) => {
        const { awardXPHelper } = await import("../../convex/features/progression/functions");
        await awardXPHelper(ctx, "stats-user-1", 100, "test");
        await awardXPHelper(ctx, "stats-user-2", 200, "test");
      });

      // Get progression stats
      const stats = await t.query(api.features.progression.functions.getProgressionStats, {});

      expect(stats.gameLevel).toBeTypeOf("number");
      expect(stats.totalPlayers).toBeGreaterThanOrEqual(2);
      expect(stats.averageLevel).toBeTypeOf("number");
      expect(stats.levelDistribution).toBeTypeOf("object");
    });
  });

  describe("error handling", () => {
    it("should handle missing player gracefully", async () => {
      const t = createTestInstance();
      await expect(
        t.query(api.features.profile.functions.getPlayerProfileContent, {
          userId: "nonexistent-user"
        })
      ).rejects.toThrow("Player nonexistent-user not found");
    });

    it("should handle invalid template ID", async () => {
      const t = createTestInstance();
      const userId = "error-test-user";

      await expect(
        t.query(api.engine.core.executeTemplate, {
          templateId: "INVALID_TEMPLATE",
          userId
        })
      ).rejects.toThrow("Template INVALID_TEMPLATE not found in registry");
    });

    it("should handle invalid action ID", async () => {
      const t = createTestInstance();
      const userId = "action-error-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Action Error Test"
      });

      await expect(
        t.mutation(api.engine.core.executeAction, {
          templateId: "JOKESTER_ENCOUNTER",
          actionId: "INVALID_ACTION",
          userId
        })
      ).rejects.toThrow("Action INVALID_ACTION not found in template JOKESTER_ENCOUNTER");
    });
  });
});