import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";
import { formatProfileContent } from "../../../convex/features/profile/functions";

describe("Profile Functions", () => {
  describe("createPlayer", () => {
    test("creates new player with correct data", async () => {
      const t = createTestInstance();
      const userId = "test-create-player";
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
      expect(player.createdAt).toBeDefined();
      expect(player.lastActive).toBeDefined();
    });

    test("creates player with proper timestamps", async () => {
      const t = createTestInstance();
      const before = Date.now();

      const player = await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-timestamps",
        displayName: "Timestamp Test"
      });

      const after = Date.now();

      expect(player.createdAt).toBeGreaterThanOrEqual(before);
      expect(player.createdAt).toBeLessThanOrEqual(after);
      expect(player.lastActive).toBeGreaterThanOrEqual(before);
      expect(player.lastActive).toBeLessThanOrEqual(after);
    });
  });

  describe("ensurePlayerExists", () => {
    test("creates player if not exists", async () => {
      const t = createTestInstance();
      const userId = "test-ensure-new";

      const player = await t.mutation(api.features.profile.functions.ensurePlayerExists, {
        userId
      });

      expect(player.userId).toBe(userId);
      expect(player.displayName).toBe("Unknown Player");
      expect(player.xp).toBe(0);
    });

    test("returns existing player if already exists", async () => {
      const t = createTestInstance();
      const userId = "test-ensure-existing";
      const displayName = "Original Name";

      // Create player first
      const originalPlayer = await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName
      });

      // Ensure player exists should return the same player
      const ensuredPlayer = await t.mutation(api.features.profile.functions.ensurePlayerExists, {
        userId
      });

      expect(ensuredPlayer._id).toBe(originalPlayer._id);
      expect(ensuredPlayer.displayName).toBe(displayName); // Should keep original name
      expect(ensuredPlayer.xp).toBe(originalPlayer.xp);
    });
  });

  describe("getPlayerProfileContent", () => {
    test("returns profile content for existing player", async () => {
      const t = createTestInstance();
      const userId = "test-profile-content";
      const displayName = "Profile Test";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName
      });

      const content = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(content.displayName).toBe(displayName);
      expect(content.level).toBe(1);
      expect(content.xp).toBe(0);
      expect(content.xpProgress).toBe(0);
      expect(content.xpRequired).toBe(100);
      expect(content.titles).toEqual([]);
      expect(content.currentTitle).toBeUndefined();
      expect(content.createdAt).toBeDefined();
      expect(content.lastActive).toBeDefined();
    });

    test("throws error for non-existent player", async () => {
      const t = createTestInstance();
      const userId = "test-nonexistent";

      await expect(
        t.query(api.features.profile.functions.getPlayerProfileContent, {
          userId
        })
      ).rejects.toThrow("Player test-nonexistent not found - must be created first");
    });
  });

  describe("formatProfileContent", () => {
    test("calculates level 1 for 0-99 XP", () => {
      const player = {
        displayName: "Test",
        xp: 0,
        titles: [],
        currentTitle: undefined,
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      const content = formatProfileContent(player);
      expect(content.level).toBe(1);
      expect(content.xpProgress).toBe(0);
      expect(content.xpRequired).toBe(100);
    });

    test("calculates level 2 for 100-199 XP", () => {
      const player = {
        displayName: "Test",
        xp: 150,
        titles: [],
        currentTitle: undefined,
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      const content = formatProfileContent(player);
      expect(content.level).toBe(2);
      expect(content.xpProgress).toBe(50); // 150 - 100 (level 2 start)
      expect(content.xpRequired).toBe(100); // 200 - 100 (level range)
    });

    test("calculates level 5 for 450 XP", () => {
      const player = {
        displayName: "Test",
        xp: 450,
        titles: [],
        currentTitle: undefined,
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      const content = formatProfileContent(player);
      expect(content.level).toBe(5);
      expect(content.xpProgress).toBe(50); // 450 - 400 (level 5 start)
      expect(content.xpRequired).toBe(100); // 500 - 400 (level range)
    });

    test("handles titles correctly", () => {
      const player = {
        displayName: "Veteran Player",
        xp: 300,
        titles: ["First Steps", "Explorer", "Warrior"],
        currentTitle: "Explorer",
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      const content = formatProfileContent(player);
      expect(content.titles).toEqual(["First Steps", "Explorer", "Warrior"]);
      expect(content.currentTitle).toBe("Explorer");
    });

    test("preserves all player data", () => {
      const now = Date.now();
      const player = {
        displayName: "Data Test",
        xp: 75,
        titles: ["Newbie"],
        currentTitle: "Newbie",
        createdAt: now - 1000,
        lastActive: now
      };

      const content = formatProfileContent(player);
      expect(content.displayName).toBe("Data Test");
      expect(content.xp).toBe(75);
      expect(content.createdAt).toBe(now - 1000);
      expect(content.lastActive).toBe(now);
    });
  });

  describe("getPlayerProfileContentHelper", () => {
    test("returns formatted content for existing player", async () => {
      const t = createTestInstance();
      const userId = "test-helper-content";

      // Create player with specific data
      await t.run(async (ctx) => {
        await ctx.db.insert("players", {
          userId,
          displayName: "Helper Test",
          xp: 250,
          level: 3, // Note: level is calculated, not stored
          titles: ["Adventurer"],
          currentTitle: "Adventurer",
          createdAt: Date.now(),
          lastActive: Date.now()
        });
      });

      const content = await t.run(async (ctx) => {
        const { getPlayerProfileContentHelper } = await import("../../../convex/features/profile/functions");
        return await getPlayerProfileContentHelper(ctx, { userId });
      });

      expect(content.displayName).toBe("Helper Test");
      expect(content.level).toBe(3); // Calculated from 250 XP
      expect(content.xp).toBe(250);
      expect(content.titles).toEqual(["Adventurer"]);
      expect(content.currentTitle).toBe("Adventurer");
    });

    test("throws error for non-existent player", async () => {
      const t = createTestInstance();
      const userId = "test-helper-nonexistent";

      await expect(
        t.run(async (ctx) => {
          const { getPlayerProfileContentHelper } = await import("../../../convex/features/profile/functions");
          return await getPlayerProfileContentHelper(ctx, { userId });
        })
      ).rejects.toThrow("Player test-helper-nonexistent not found - must be created first");
    });
  });
});