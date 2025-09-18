import { describe, it, expect } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestInstance } from "../helpers/test-utils";

describe("playerModel", () => {

  describe("player creation and retrieval", () => {
    it("should create a player with correct default values", async () => {
      const t = createTestInstance();
      const userId = "test-user-123";
      const displayName = "Test Player";

      const player = await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName
      });

      expect(player.userId).toBe(userId);
      expect(player.displayName).toBe(displayName);
      expect(player.xp).toBe(0);
      expect(player.level).toBe(1);
      expect(player.titles).toEqual([]);
      expect(player.currentTitle).toBeUndefined();
      expect(player.createdAt).toBeTypeOf("number");
      expect(player.lastActive).toBeTypeOf("number");
    });

    it("should get player profile content with computed fields", async () => {
      const t = createTestInstance();
      const userId = "test-user-456";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Test Player"
      });

      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.displayName).toBe("Test Player");
      expect(profileContent.level).toBe(1);
      expect(profileContent.xp).toBe(0);
      expect(profileContent.xpProgress).toBe(0);
      expect(profileContent.xpRequired).toBe(100); // XP required for level 2
      expect(profileContent.gameLevel).toBeTypeOf("number");
      expect(profileContent.xpMultiplier).toBeTypeOf("number");
    });

    it("should ensure player exists creates player if not found", async () => {
      const t = createTestInstance();
      const userId = "new-user-789";

      const player = await t.mutation(api.features.profile.functions.ensurePlayerExists, {
        userId
      });

      expect(player.userId).toBe(userId);
      expect(player.displayName).toBe("Unknown Player");
      expect(player.xp).toBe(0);
      expect(player.level).toBe(1);
    });
  });

  describe("XP and progression", () => {
    it("should award XP and update level correctly", async () => {
      const t = createTestInstance();
      const userId = "xp-test-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "XP Test"
      });

      // Award enough XP to reach level 2
      const result = await t.run(async (ctx) => {
        const { awardXPHelper } = await import("../../convex/features/progression/functions");
        return await awardXPHelper(ctx, userId, 100, "test");
      });

      expect(result.xpAwarded).toBeGreaterThan(0);
      expect(result.newLevel).toBe(2);
      expect(result.levelUp).toBe(true);

      // Verify the player was updated
      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.level).toBe(2);
      expect(profileContent.xp).toBeGreaterThanOrEqual(100);
    });

    it("should award titles correctly", async () => {
      const t = createTestInstance();
      const userId = "title-test-user";
      const title = "Test Champion";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Title Test"
      });

      // Award title
      const titleAwarded = await t.run(async (ctx) => {
        const { awardTitleHelper } = await import("../../convex/features/progression/functions");
        return await awardTitleHelper(ctx, userId, title);
      });

      expect(titleAwarded).toBe(true);

      // Verify title was added
      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.titles).toContain(title);

      // Award same title again - should return false
      const secondAward = await t.run(async (ctx) => {
        const { awardTitleHelper } = await import("../../convex/features/progression/functions");
        return await awardTitleHelper(ctx, userId, title);
      });

      expect(secondAward).toBe(false);
    });
  });

  describe("game level integration", () => {
    it("should include game level in profile content", async () => {
      const t = createTestInstance();
      const userId = "game-level-test";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Game Level Test"
      });

      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.gameLevel).toBeTypeOf("number");
      expect(profileContent.xpMultiplier).toBeTypeOf("number");
      expect(typeof profileContent.isBehindGameLevel).toBe("boolean");
      expect(typeof profileContent.isAheadOfGameLevel).toBe("boolean");
      expect(typeof profileContent.isAtGameLevel).toBe("boolean");
    });
  });
});