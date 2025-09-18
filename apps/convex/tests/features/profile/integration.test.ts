import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

describe("Profile Feature Integration", () => {
  describe("complete profile workflow", () => {
    test("new player creation and profile retrieval", async () => {
      const t = createTestInstance();
      const userId = "integration-new-player";
      const displayName = "New Player";

      // 1. Create player
      const player = await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName
      });

      expect(player.userId).toBe(userId);
      expect(player.displayName).toBe(displayName);

      // 2. Get profile content directly
      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // 3. Verify profile content
      expect(profileContent.displayName).toBe(displayName);
      expect(profileContent.level).toBe(1);
      expect(profileContent.xp).toBe(0);
      expect(profileContent.xpProgress).toBe(0);
      expect(profileContent.xpRequired).toBe(100);
      expect(profileContent.titles).toEqual([]);
      expect(profileContent.currentTitle).toBeUndefined();
      expect(profileContent.createdAt).toBeDefined();
      expect(profileContent.lastActive).toBeDefined();
    });

    test("experienced player profile display", async () => {
      const t = createTestInstance();
      const userId = "integration-experienced-player";
      const displayName = "Veteran Adventurer";

      // 1. Create player with progression
      await t.run(async (ctx) => {
        await ctx.db.insert("players", {
          userId,
          displayName,
          xp: 350,
          level: 4, // This will be recalculated
          titles: ["First Steps", "Explorer", "Warrior"],
          currentTitle: "Warrior",
          equippedGear: {},
          createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
          lastActive: Date.now()
        });
      });

      // 2. Get profile content
      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // 3. Verify experienced player data
      expect(profileContent.displayName).toBe(displayName);
      expect(profileContent.level).toBe(4); // Calculated from 350 XP (exponential)
      expect(profileContent.xp).toBe(350);
      expect(profileContent.xpProgress).toBe(4); // 350 - 346 (level 4 start)
      expect(profileContent.xpRequired).toBe(152); // Level 5 requires 152 XP (exponential)
      expect(profileContent.titles).toEqual(["First Steps", "Explorer", "Warrior"]);
      expect(profileContent.currentTitle).toBe("Warrior");
    });

    test("player profile update workflow", async () => {
      const t = createTestInstance();
      const userId = "integration-update-player";
      const originalName = "Original Name";
      const updatedName = "Updated Name";

      // 1. Create initial player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: originalName
      });

      // 2. Verify initial profile
      let profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.displayName).toBe(originalName);
      expect(profileContent.level).toBe(1);

      // 3. Update player data manually (simulating game progression)
      await t.run(async (ctx) => {
        const player = await ctx.db
          .query("players")
          .withIndex("userId", (q) => q.eq("userId", userId))
          .first();

        if (player) {
          await ctx.db.patch(player._id, {
            displayName: updatedName,
            xp: 150,
            titles: ["First Steps"],
            currentTitle: "First Steps",
            lastActive: Date.now()
          });
        }
      });

      // 4. Verify updated profile
      profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.displayName).toBe(updatedName);
      expect(profileContent.level).toBe(2); // 150 XP = level 2
      expect(profileContent.xp).toBe(150);
      expect(profileContent.titles).toEqual(["First Steps"]);
      expect(profileContent.currentTitle).toBe("First Steps");
    });

    test("error handling for non-existent player", async () => {
      const t = createTestInstance();
      const userId = "integration-nonexistent";

      // Should handle error gracefully when player doesn't exist
      await expect(
        t.query(api.features.profile.functions.getPlayerProfileContent, {
          userId
        })
      ).rejects.toThrow("Player integration-nonexistent not found");
    });
  });

  describe("profile data consistency", () => {
    test("helper function vs query function consistency", async () => {
      const t = createTestInstance();
      const userId = "helper-consistency-test";

      // Create player with data
      await t.run(async (ctx) => {
        await ctx.db.insert("players", {
          userId,
          displayName: "Helper Test",
          xp: 200,
          level: 3,
          titles: ["Test Title"],
          currentTitle: "Test Title",
          equippedGear: {},
          createdAt: Date.now(),
          lastActive: Date.now()
        });
      });

      // Get content via query function
      const queryContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // Get content via helper function
      const helperContent = await t.run(async (ctx) => {
        const { getPlayerProfileContentHelper } = await import("../../../convex/features/profile/functions");
        return await getPlayerProfileContentHelper(ctx, { userId });
      });

      // Both should return identical content
      expect(helperContent).toEqual(queryContent);
    });
  });

  describe("performance and edge cases", () => {
    test("handles player with maximum typical XP", async () => {
      const t = createTestInstance();
      const userId = "max-xp-test";

      // Create player with high XP
      await t.run(async (ctx) => {
        await ctx.db.insert("players", {
          userId,
          displayName: "Max Level Player",
          xp: 9999,
          level: 100,
          titles: ["Legend"],
          currentTitle: "Legend",
          equippedGear: {},
          createdAt: Date.now(),
          lastActive: Date.now()
        });
      });

      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.level).toBe(20); // 9999 XP = level 20 (exponential)
      expect(profileContent.xp).toBe(9999);
      expect(profileContent.displayName).toBe("Max Level Player");
    });

    test("handles player with empty titles", async () => {
      const t = createTestInstance();
      const userId = "empty-titles-test";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "No Titles Player"
      });

      const profileContent = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(profileContent.titles).toEqual([]);
      expect(profileContent.currentTitle).toBeUndefined();
    });

    test("multiple players can exist simultaneously", async () => {
      const t = createTestInstance();
      const user1 = "multi-test-user-1";
      const user2 = "multi-test-user-2";

      // Create two different players
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: user1,
        displayName: "Player One"
      });

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: user2,
        displayName: "Player Two"
      });

      // Get both profiles
      const profile1 = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId: user1
      });

      const profile2 = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId: user2
      });

      // Verify they're different
      expect(profile1.displayName).toBe("Player One");
      expect(profile2.displayName).toBe("Player Two");
      expect(profile1.displayName).not.toBe(profile2.displayName);
    });
  });
});