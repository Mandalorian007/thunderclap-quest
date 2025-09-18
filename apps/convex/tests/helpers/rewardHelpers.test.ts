import { describe, test, expect } from "vitest";
import {
  awardGearReward,
  awardMaterialReward,
  awardItemReward,
  generateSampleGear,
  generateSampleMaterial,
  generateSampleItem
} from "../../convex/helpers/rewardHelpers";
import { createPlayer } from "../../convex/models/playerModel";
import { createTestInstance } from "./test-utils";

describe("Reward Helpers - Database Functions", () => {

  describe("Reward Awarding", () => {
    test("should award gear and return correct reward entry", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await createPlayer(ctx, "user123", "TestPlayer");

        const gearData = {
          name: "Iron Sword",
          emoji: "⚔️",
          slot: "mainHand" as const,
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common" as const,
          stats: { Might: 5 }
        };

        const rewardEntry = await awardGearReward(ctx, "user123", gearData);

        expect(rewardEntry.icon).toBe("⚔️");
        expect(rewardEntry.amount).toBe(1);
        expect(rewardEntry.name).toBe("Iron Sword");

        // Verify gear was actually added to inventory
        const inventory = await ctx.db
          .query("inventory")
          .withIndex("userId", (q: any) => q.eq("userId", "user123"))
          .first();

        expect(inventory.gear).toHaveLength(1);
        expect(inventory.gear[0].name).toBe("Iron Sword");
      });
    });

    test("should award material and return correct reward entry", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await createPlayer(ctx, "user123", "TestPlayer");

        const materialData = {
          name: "Iron Ore",
          emoji: "⛏️",
          materialType: "ore" as const,
          quantity: 5
        };

        const rewardEntry = await awardMaterialReward(ctx, "user123", materialData);

        expect(rewardEntry.icon).toBe("⛏️");
        expect(rewardEntry.amount).toBe(5);
        expect(rewardEntry.name).toBe("Iron Ore");

        // Verify material was actually added to inventory
        const inventory = await ctx.db
          .query("inventory")
          .withIndex("userId", (q: any) => q.eq("userId", "user123"))
          .first();

        expect(inventory.materials).toHaveLength(1);
        expect(inventory.materials[0].quantity).toBe(5);
      });
    });

    test("should award item and return correct reward entry", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await createPlayer(ctx, "user123", "TestPlayer");

        const itemData = {
          name: "Ancient Key",
          emoji: "🗝️",
          category: "key" as const,
          quantity: 1
        };

        const rewardEntry = await awardItemReward(ctx, "user123", itemData);

        expect(rewardEntry.icon).toBe("🗝️");
        expect(rewardEntry.amount).toBe(1);
        expect(rewardEntry.name).toBe("Ancient Key");

        // Verify item was actually added to inventory
        const inventory = await ctx.db
          .query("inventory")
          .withIndex("userId", (q: any) => q.eq("userId", "user123"))
          .first();

        expect(inventory.items).toHaveLength(1);
        expect(inventory.items[0].name).toBe("Ancient Key");
      });
    });
  });
});

describe("Reward Helpers - Pure Functions", () => {
  describe("Sample Generation", () => {
    test("should generate valid sample gear", () => {
      const gear = generateSampleGear(15, "helm");

      expect(gear.slot).toBe("helm");
      expect(gear.itemLevel).toBe(15);
      expect(gear.combatRating).toBe(15);
      expect(gear.name).toBeTypeOf("string");
      expect(gear.emoji).toBe("⛑️");
      expect(['Common', 'Magic', 'Rare']).toContain(gear.rarity);
      expect(gear.stats).toBeTypeOf("object");

      // Verify stats based on rarity
      const statCount = Object.keys(gear.stats).length;
      if (gear.rarity === 'Common') {
        expect(statCount).toBe(1);
      } else if (gear.rarity === 'Magic') {
        expect(statCount).toBe(2);
      } else if (gear.rarity === 'Rare') {
        expect(statCount).toBe(3);
      }
    });

    test("should generate gear for all slots", () => {
      const slots: Array<Parameters<typeof generateSampleGear>[1]> =
        ['helm', 'chest', 'gloves', 'legs', 'mainHand', 'offhand'];

      for (const slot of slots) {
        const gear = generateSampleGear(10, slot);
        expect(gear.slot).toBe(slot);
        expect(gear.name).toBeTypeOf("string");
        expect(gear.emoji).toBeTypeOf("string");
      }
    });

    test("should generate valid sample material", () => {
      const material = generateSampleMaterial();

      expect(material.name).toBeTypeOf("string");
      expect(material.emoji).toBeTypeOf("string");
      expect(['ore', 'essence', 'component', 'reagent']).toContain(material.materialType);
      expect(material.quantity).toBeGreaterThan(0);
      expect(material.quantity).toBeLessThanOrEqual(5);
    });

    test("should generate valid sample item", () => {
      const item = generateSampleItem();

      expect(item.name).toBeTypeOf("string");
      expect(item.emoji).toBeTypeOf("string");
      expect(['key', 'consumable', 'currency', 'trophy', 'lore']).toContain(item.category);
      expect(item.quantity).toBeGreaterThan(0);
    });

    test("should generate different items on multiple calls", () => {
      const materials = Array.from({ length: 10 }, () => generateSampleMaterial());
      const uniqueNames = new Set(materials.map(m => m.name));

      // With 4 different materials, we should see at least 2 different ones in 10 generations
      expect(uniqueNames.size).toBeGreaterThan(1);

      const items = Array.from({ length: 10 }, () => generateSampleItem());
      const uniqueItemNames = new Set(items.map(i => i.name));

      // With 5 different items, we should see at least 2 different ones in 10 generations
      expect(uniqueItemNames.size).toBeGreaterThan(1);
    });
  });

  describe("Stat Generation", () => {
    test("should generate stats within reasonable ranges", () => {
      const gear = generateSampleGear(20, "mainHand");
      const statValues = Object.values(gear.stats).filter(v => v !== undefined) as number[];

      for (const statValue of statValues) {
        expect(statValue).toBeGreaterThan(0);
        expect(statValue).toBeLessThanOrEqual(15); // Should be roughly playerLevel / 2 + variation
      }
    });

    test("should scale stats with player level", () => {
      const lowLevelGear = generateSampleGear(4, "helm");
      const highLevelGear = generateSampleGear(40, "helm");

      const lowStats = Object.values(lowLevelGear.stats).filter(v => v !== undefined) as number[];
      const highStats = Object.values(highLevelGear.stats).filter(v => v !== undefined) as number[];

      if (lowStats.length > 0 && highStats.length > 0) {
        const avgLowStat = lowStats.reduce((sum, val) => sum + val, 0) / lowStats.length;
        const avgHighStat = highStats.reduce((sum, val) => sum + val, 0) / highStats.length;

        expect(avgHighStat).toBeGreaterThan(avgLowStat);
      }
    });
  });
});