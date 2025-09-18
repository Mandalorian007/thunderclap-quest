import { describe, test, expect } from "vitest";
import {
  calculatePlayerCombatRating,
  formatEquippedGear,
  getEquippedGearArray,
  hasGearEquipped,
  calculateTotalStats
} from "../../convex/helpers/inventoryHelpers";

describe("Inventory Helpers", () => {

  describe("Combat Rating Calculation", () => {
    test("should calculate combat rating with all slots equipped", () => {
      const player = {
        equippedGear: {
          helm: { combatRating: 10 },
          chest: { combatRating: 12 },
          gloves: { combatRating: 8 },
          legs: { combatRating: 11 },
          mainHand: { combatRating: 15 },
          offhand: { combatRating: 9 }
        }
      };
      const gameLevel = 20;

      const cr = calculatePlayerCombatRating(player, gameLevel);
      expect(cr).toBe(Math.floor((10 + 12 + 8 + 11 + 15 + 9) / 6));
    });

    test("should fill empty slots with game level", () => {
      const player = {
        equippedGear: {
          mainHand: { combatRating: 30 },
          chest: { combatRating: 25 }
        }
      };
      const gameLevel = 20;

      // 2 equipped pieces (30 + 25) + 4 empty slots (20 each) = 135 / 6 = 22.5 -> 22
      const cr = calculatePlayerCombatRating(player, gameLevel);
      expect(cr).toBe(22);
    });

    test("should handle completely empty gear", () => {
      const player = { equippedGear: {} };
      const gameLevel = 20;

      const cr = calculatePlayerCombatRating(player, gameLevel);
      expect(cr).toBe(20); // All 6 slots filled with game level
    });
  });

  describe("Equipped Gear Formatting", () => {
    test("should format equipped gear correctly", () => {
      const equippedGear = {
        helm: {
          name: "Iron Helm",
          emoji: "⛑️",
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common",
          stats: { Armor: 5 }
        },
        mainHand: {
          name: "Steel Sword",
          emoji: "⚔️",
          itemLevel: 15,
          combatRating: 15,
          rarity: "Magic",
          stats: { Might: 8, Focus: 3 }
        }
      };

      const formatted = formatEquippedGear(equippedGear);

      expect(formatted.helm).toEqual({
        name: "Iron Helm",
        emoji: "⛑️",
        itemLevel: 10,
        combatRating: 10,
        rarity: "Common",
        stats: { Armor: 5 }
      });

      expect(formatted.mainHand).toEqual({
        name: "Steel Sword",
        emoji: "⚔️",
        itemLevel: 15,
        combatRating: 15,
        rarity: "Magic",
        stats: { Might: 8, Focus: 3 }
      });

      expect(formatted.chest).toBeNull();
    });
  });

  describe("Equipped Gear Array", () => {
    test("should return only equipped items", () => {
      const equippedGear = {
        helm: { name: "Iron Helm" },
        chest: undefined,
        mainHand: { name: "Steel Sword" }
      };

      const gearArray = getEquippedGearArray(equippedGear);

      expect(gearArray).toHaveLength(2);
      expect(gearArray[0].name).toBe("Iron Helm");
      expect(gearArray[1].name).toBe("Steel Sword");
    });

    test("should return empty array for no equipped gear", () => {
      const equippedGear = {};
      const gearArray = getEquippedGearArray(equippedGear);
      expect(gearArray).toHaveLength(0);
    });
  });

  describe("Gear Equipped Check", () => {
    test("should correctly identify equipped slots", () => {
      const equippedGear = {
        helm: { name: "Iron Helm" },
        chest: undefined,
        mainHand: { name: "Steel Sword" }
      };

      expect(hasGearEquipped(equippedGear, "helm")).toBe(true);
      expect(hasGearEquipped(equippedGear, "chest")).toBe(false);
      expect(hasGearEquipped(equippedGear, "mainHand")).toBe(true);
      expect(hasGearEquipped(equippedGear, "legs")).toBe(false);
    });
  });

  describe("Total Stats Calculation", () => {
    test("should sum stats from all equipped gear", () => {
      const equippedGear = {
        helm: {
          stats: { Armor: 5, Evasion: 2 }
        },
        chest: {
          stats: { Armor: 8, Aegis: 3 }
        },
        mainHand: {
          stats: { Might: 10, Focus: 4 }
        },
        offhand: {
          stats: { Armor: 3, Aegis: 2 }
        }
      };

      const totalStats = calculateTotalStats(equippedGear);

      expect(totalStats).toEqual({
        Might: 10,
        Focus: 4,
        Sage: 0,
        Armor: 16, // 5 + 8 + 3
        Evasion: 2,
        Aegis: 5 // 3 + 2
      });
    });

    test("should handle empty equipped gear", () => {
      const equippedGear = {};
      const totalStats = calculateTotalStats(equippedGear);

      expect(totalStats).toEqual({
        Might: 0,
        Focus: 0,
        Sage: 0,
        Armor: 0,
        Evasion: 0,
        Aegis: 0
      });
    });

    test("should ignore undefined stats", () => {
      const equippedGear = {
        helm: {
          stats: { Armor: 5 } // Only has Armor, no other stats
        },
        mainHand: {
          stats: { Might: 8, Focus: undefined } // Focus is undefined
        }
      };

      const totalStats = calculateTotalStats(equippedGear);

      expect(totalStats.Armor).toBe(5);
      expect(totalStats.Might).toBe(8);
      expect(totalStats.Focus).toBe(0);
      expect(totalStats.Sage).toBe(0);
    });
  });
});