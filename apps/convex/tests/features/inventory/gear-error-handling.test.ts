import { describe, test, expect } from "vitest";
import { createTestInstance } from "../../helpers/test-utils";
import { api } from "../../../convex/_generated/api";

describe("Gear Commands Error Handling", () => {

  describe("Equip Command Error Cases", () => {
    test("should handle equipping non-existent gear", async () => {
      const t = createTestInstance();

      // Create player and ensure inventory exists by adding some gear first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      // Add some gear to create inventory
      await t.mutation(api.features.inventory.functions.awardGear, {
        userId: "test-user",
        gearData: {
          name: "Test Sword",
          emoji: "⚔️",
          slot: "mainHand",
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common",
          stats: { Might: 5 }
        }
      });

      // Try to equip gear that doesn't exist
      await expect(
        t.mutation(api.features.inventory.functions.equipGear, {
          userId: "test-user",
          gearId: "non-existent-id"
        })
      ).rejects.toThrow("Gear not found in inventory");
    });

    test("should handle equipping gear for non-existent player", async () => {
      const t = createTestInstance();

      // Try to equip gear for a player that doesn't exist
      await expect(
        t.mutation(api.features.inventory.functions.equipGear, {
          userId: "non-existent-user",
          gearId: "some-gear-id"
        })
      ).rejects.toThrow();
    });

    test("should handle player with no inventory", async () => {
      const t = createTestInstance();

      // Create player but no inventory
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      // Try to equip gear when inventory doesn't exist
      await expect(
        t.mutation(api.features.inventory.functions.equipGear, {
          userId: "test-user",
          gearId: "some-gear-id"
        })
      ).rejects.toThrow("Player has no inventory");
    });
  });

  describe("Unequip Command Error Cases", () => {
    test("should handle unequipping from empty slot", async () => {
      const t = createTestInstance();

      // Create player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      // Try to unequip from an empty slot
      await expect(
        t.mutation(api.features.inventory.functions.unequipGear, {
          userId: "test-user",
          slot: "mainHand"
        })
      ).rejects.toThrow("No gear equipped in mainHand slot");
    });

    test("should handle unequipping for non-existent player", async () => {
      const t = createTestInstance();

      // Try to unequip for a player that doesn't exist
      await expect(
        t.mutation(api.features.inventory.functions.unequipGear, {
          userId: "non-existent-user",
          slot: "mainHand"
        })
      ).rejects.toThrow();
    });
  });

  describe("Autocomplete Edge Cases", () => {
    test("should handle autocomplete for non-existent player", async () => {
      const t = createTestInstance();

      // Should return empty array for non-existent player
      const result = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
        userId: "non-existent-user"
      });

      expect(result).toEqual([]);
    });

    test("should handle autocomplete with empty search term", async () => {
      const t = createTestInstance();

      // Create player and add gear
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      await t.mutation(api.features.inventory.functions.awardGear, {
        userId: "test-user",
        gearData: {
          name: "Test Sword",
          emoji: "⚔️",
          slot: "mainHand",
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common",
          stats: { Might: 5 }
        }
      });

      // Test with empty search term
      const result = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
        userId: "test-user",
        searchTerm: ""
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Sword");
    });

    test("should handle autocomplete with no matching search term", async () => {
      const t = createTestInstance();

      // Create player and add gear
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      await t.mutation(api.features.inventory.functions.awardGear, {
        userId: "test-user",
        gearData: {
          name: "Iron Sword",
          emoji: "⚔️",
          slot: "mainHand",
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common",
          stats: { Might: 5 }
        }
      });

      // Test with search term that doesn't match anything
      const result = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
        userId: "test-user",
        searchTerm: "nonexistent"
      });

      expect(result).toEqual([]);
    });
  });

  describe("Salvage Integration Edge Cases", () => {
    test("should handle salvaging with no gear", async () => {
      const t = createTestInstance();

      // Create player with no gear
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      // Salvage should return 0 (no gear to salvage)
      const result = await t.mutation(api.features.inventory.functions.salvageAllGear, {
        userId: "test-user"
      });

      expect(result).toBe(0);
    });

    test("should not salvage equipped gear", async () => {
      const t = createTestInstance();

      // Create player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      // Add and equip gear
      const gear = await t.mutation(api.features.inventory.functions.awardGear, {
        userId: "test-user",
        gearData: {
          name: "Test Sword",
          emoji: "⚔️",
          slot: "mainHand",
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common",
          stats: { Might: 5 }
        }
      });

      await t.mutation(api.features.inventory.functions.equipGear, {
        userId: "test-user",
        gearId: gear.id
      });

      // Salvage should return 0 (no unequipped gear to salvage)
      const result = await t.mutation(api.features.inventory.functions.salvageAllGear, {
        userId: "test-user"
      });

      expect(result).toBe(0);

      // Verify gear is still equipped
      const playerWithGear = await t.query(api.features.inventory.functions.getPlayerWithGear, {
        userId: "test-user"
      });

      expect(playerWithGear.equippedGear.mainHand).toBeDefined();
      expect(playerWithGear.equippedGear.mainHand.name).toBe("Test Sword");
    });
  });

  describe("Data Validation", () => {
    test("should handle invalid slot names in unequip", async () => {
      const t = createTestInstance();

      // Create player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId: "test-user",
        displayName: "Test User"
      });

      // This should be caught by Zod validation before reaching the function
      await expect(
        t.mutation(api.features.inventory.functions.unequipGear, {
          userId: "test-user",
          slot: "invalid-slot" as any
        })
      ).rejects.toThrow();
    });

    test("should handle missing required parameters", async () => {
      const t = createTestInstance();

      // Test missing userId
      await expect(
        t.mutation(api.features.inventory.functions.equipGear, {
          gearId: "some-id"
        } as any)
      ).rejects.toThrow();

      // Test missing gearId
      await expect(
        t.mutation(api.features.inventory.functions.equipGear, {
          userId: "test-user"
        } as any)
      ).rejects.toThrow();
    });
  });

});

describe("Gear Generation Error Handling", () => {
  test("should handle gear generation for various levels", async () => {
    const t = createTestInstance();

    // Create player
    await t.mutation(api.features.profile.functions.createPlayer, {
      userId: "test-user",
      displayName: "Test User"
    });

    // Test gear generation at level 1 (edge case)
    const lowLevelGear = await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData: {
        name: "Starter Sword",
        emoji: "⚔️",
        slot: "mainHand",
        itemLevel: 1,
        combatRating: 1,
        rarity: "Common",
        stats: { Might: 1 }
      }
    });

    expect(lowLevelGear.itemLevel).toBe(1);
    expect(lowLevelGear.combatRating).toBe(1);

    // Test gear generation at high level
    const highLevelGear = await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData: {
        name: "Epic Sword",
        emoji: "⚔️",
        slot: "offhand",
        itemLevel: 100,
        combatRating: 100,
        rarity: "Rare",
        stats: { Might: 50, Focus: 30, Armor: 20 }
      }
    });

    expect(highLevelGear.itemLevel).toBe(100);
    expect(highLevelGear.combatRating).toBe(100);
  });
});