import { describe, it, expect } from "vitest";
import {
  calculatePlayerLevel,
  getXPRequiredForLevel,
  getTotalXPForLevel,
  getXPMultiplier,
  calculateProgressionStats
} from "../../convex/helpers/progressionHelpers";

describe("progressionHelpers", () => {
  describe("XP calculations", () => {
    it("should calculate correct XP requirements for levels", () => {
      expect(getXPRequiredForLevel(1)).toBe(0);
      expect(getXPRequiredForLevel(2)).toBe(100);
      expect(getXPRequiredForLevel(3)).toBe(114); // Math.floor(100 * 1.15^1) = 114
      expect(getXPRequiredForLevel(4)).toBe(132); // Math.floor(100 * 1.15^2) = 132
    });

    it("should calculate correct total XP for levels", () => {
      expect(getTotalXPForLevel(1)).toBe(0);
      expect(getTotalXPForLevel(2)).toBe(100);
      expect(getTotalXPForLevel(3)).toBe(214); // 100 + 114 = 214
      expect(getTotalXPForLevel(4)).toBe(346); // 100 + 114 + 132 = 346
    });

    it("should calculate correct player level from XP", () => {
      expect(calculatePlayerLevel(0)).toBe(1);
      expect(calculatePlayerLevel(100)).toBe(2);
      expect(calculatePlayerLevel(214)).toBe(3);
      expect(calculatePlayerLevel(300)).toBe(3); // Between level 3 and 4
      expect(calculatePlayerLevel(346)).toBe(4);
    });
  });

  describe("XP multipliers", () => {
    it("should give catch-up bonus for players behind game level", () => {
      const gameLevel = 10;

      // 5 levels behind = 50% bonus (1.5x)
      expect(getXPMultiplier(5, gameLevel)).toBe(1.5);

      // 10 levels behind = 100% bonus (2.0x), but capped at 3.0x
      expect(getXPMultiplier(1, gameLevel)).toBe(1.9);

      // At game level = normal rate
      expect(getXPMultiplier(10, gameLevel)).toBe(1.0);
    });

    it("should give prestige penalty for players ahead of game level", () => {
      const gameLevel = 10;

      // 5 levels ahead = 25% penalty (0.75x)
      expect(getXPMultiplier(15, gameLevel)).toBe(0.75);

      // 10 levels ahead = 50% penalty (0.5x)
      expect(getXPMultiplier(20, gameLevel)).toBe(0.5);

      // Very far ahead should floor at 50%
      expect(getXPMultiplier(30, gameLevel)).toBe(0.5);
    });

    it("should cap catch-up bonus at 3.0x", () => {
      const gameLevel = 50;
      const veryLowLevel = 1;

      const multiplier = getXPMultiplier(veryLowLevel, gameLevel);
      expect(multiplier).toBeLessThanOrEqual(3.0);
    });
  });

  describe("progression stats", () => {
    it("should calculate correct progression statistics", () => {
      const mockPlayers = [
        { xp: 0 },     // Level 1
        { xp: 100 },   // Level 2
        { xp: 215 },   // Level 3
        { xp: 347 },   // Level 4
        { xp: 500 }    // Level 5
      ];

      const stats = calculateProgressionStats(mockPlayers, 10);

      expect(stats.gameLevel).toBe(10);
      expect(stats.totalPlayers).toBe(5);
      expect(stats.averageLevel).toBe((1 + 2 + 3 + 4 + 5) / 5);
      expect(stats.levelDistribution[1]).toBe(1);
      expect(stats.levelDistribution[2]).toBe(1);
      expect(stats.levelDistribution[3]).toBe(1);
      expect(stats.levelDistribution[4]).toBe(1);
      expect(stats.levelDistribution[5]).toBe(1);
    });
  });
});