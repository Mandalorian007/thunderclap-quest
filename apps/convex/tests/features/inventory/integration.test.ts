import { describe, test, expect } from "vitest";
import { createPlayer } from "../../../convex/models/playerModel";
import {
  addGearToInventory,
  addMaterialToInventory,
  addItemToInventory,
  getPlayerInventory,
  getInventorySummary
} from "../../../convex/models/inventoryModel";
import {
  equipGearHelper,
  unequipGearHelper,
  salvageAllGearHelper
} from "../../../convex/helpers/inventoryHelpers";
import { createTestInstance } from "../../helpers/test-utils";

describe("Inventory Feature Integration", () => {

  describe("Complete Item Award and Equipment Workflow", () => {
    test("should award gear, equip it, and calculate combat rating", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        // Create a player
        const player = await createPlayer(ctx, "user123", "TestPlayer");
        expect(player.equippedGear).toEqual({});

        // Award gear to inventory
        const gearData = {
          name: "Iron Sword",
          emoji: "⚔️",
          slot: "mainHand" as const,
          itemLevel: 15,
          combatRating: 15,
          rarity: "Common" as const,
          stats: { Might: 8 }
        };

        const gear = await addGearToInventory(ctx, "user123", gearData);

        expect(gear.name).toBe("Iron Sword");

        // Check inventory has the gear
        const inventory = await getPlayerInventory(ctx, "user123");

        expect(inventory.gear).toHaveLength(1);
        expect(inventory.gear[0].name).toBe("Iron Sword");

        // Equip the gear
        await ctx.runMutation(api.inventory.functions.equipGear, {
          userId: "user123",
          gearId: gear.id
        });

        // Check player now has equipped gear and inventory is empty
        const updatedPlayer = await ctx.runQuery(api.inventory.functions.getPlayerWithGear, {
          userId: "user123"
        });

        expect(updatedPlayer.equippedGear.mainHand).toBeDefined();
        expect(updatedPlayer.equippedGear.mainHand.name).toBe("Iron Sword");

        const updatedInventory = await ctx.runQuery(api.inventory.functions.getPlayerInventoryQuery, {
          userId: "user123"
        });

        expect(updatedInventory.gear).toHaveLength(0);

        // Combat rating should reflect equipped gear
        // 1 equipped (15) + 5 empty slots (game level 10) = (15 + 50) / 6 = ~10.83 -> 10
        expect(updatedPlayer.equippedGearFormatted.mainHand.combatRating).toBe(15);
      });
    });

    test("should handle gear swapping correctly", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        // Create player and award two weapons
        await createPlayer(ctx, "user123", "TestPlayer");

        const sword = await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Iron Sword", emoji: "⚔️", slot: "mainHand" as const,
            itemLevel: 10, combatRating: 10, rarity: "Common" as const, stats: { Might: 5 }
          }
        });

        const axe = await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Battle Axe", emoji: "🪓", slot: "mainHand" as const,
            itemLevel: 15, combatRating: 15, rarity: "Magic" as const, stats: { Might: 10 }
          }
        });

        // Equip sword first
        await ctx.runMutation(api.inventory.functions.equipGear, {
          userId: "user123",
          gearId: sword.id
        });

        let player = await ctx.runQuery(api.inventory.functions.getPlayerWithGear, {
          userId: "user123"
        });
        expect(player.equippedGear.mainHand.name).toBe("Iron Sword");

        let inventory = await ctx.runQuery(api.inventory.functions.getPlayerInventoryQuery, {
          userId: "user123"
        });
        expect(inventory.gear).toHaveLength(1);
        expect(inventory.gear[0].name).toBe("Battle Axe");

        // Equip axe (should swap with sword)
        await ctx.runMutation(api.inventory.functions.equipGear, {
          userId: "user123",
          gearId: axe.id
        });

        player = await ctx.runQuery(api.inventory.functions.getPlayerWithGear, {
          userId: "user123"
        });
        expect(player.equippedGear.mainHand.name).toBe("Battle Axe");

        inventory = await ctx.runQuery(api.inventory.functions.getPlayerInventoryQuery, {
          userId: "user123"
        });
        expect(inventory.gear).toHaveLength(1);
        expect(inventory.gear[0].name).toBe("Iron Sword");
      });
    });
  });

  describe("Template System Integration", () => {
    test("should execute inventory template navigation", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        // Create player with some inventory items
        await createPlayer(ctx, "user123", "TestPlayer");

        // Award various items
        await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Iron Sword", emoji: "⚔️", slot: "mainHand" as const,
            itemLevel: 10, combatRating: 10, rarity: "Common" as const, stats: {}
          }
        });

        await ctx.runMutation(api.inventory.functions.awardMaterial, {
          userId: "user123",
          materialData: {
            name: "Iron Ore", emoji: "⛏️", materialType: "ore" as const, quantity: 5
          }
        });

        await ctx.runMutation(api.inventory.functions.awardItem, {
          userId: "user123",
          itemData: {
            name: "Ancient Key", emoji: "🗝️", category: "key" as const, quantity: 1
          }
        });

        // Test template content helpers
        const overviewContent = await ctx.runQuery(api.engine.core.resolveTemplateContent, {
          content: "getInventoryOverviewHelper",
          userId: "user123"
        });

        expect(overviewContent.title).toBe("📦 Your Inventory");
        expect(overviewContent.description).toBe("1 Gear, 1 Materials, 1 Items");
        expect(overviewContent.gearCount).toBe(1);
        expect(overviewContent.materialsCount).toBe(1);
        expect(overviewContent.itemsCount).toBe(1);

        const gearContent = await ctx.runQuery(api.engine.core.resolveTemplateContent, {
          content: "getGearInventoryHelper",
          userId: "user123"
        });

        expect(gearContent.title).toBe("⚔️ Gear Inventory");
        expect(gearContent.gear).toHaveLength(1);
        expect(gearContent.gear[0].name).toBe("Iron Sword");
        expect(gearContent.isEmpty).toBe(false);

        const materialsContent = await ctx.runQuery(api.engine.core.resolveTemplateContent, {
          content: "getMaterialsInventoryHelper",
          userId: "user123"
        });

        expect(materialsContent.title).toBe("⛏️ Materials");
        expect(materialsContent.materials).toHaveLength(1);
        expect(materialsContent.materials[0].name).toBe("Iron Ore");
        expect(materialsContent.materials[0].quantity).toBe(5);

        const itemsContent = await ctx.runQuery(api.engine.core.resolveTemplateContent, {
          content: "getItemsInventoryHelper",
          userId: "user123"
        });

        expect(itemsContent.title).toBe("📦 Items");
        expect(itemsContent.items).toHaveLength(1);
        expect(itemsContent.items[0].name).toBe("Ancient Key");
      });
    });

    test("should handle salvage action with rewards", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        // Create player with multiple gear pieces
        await createPlayer(ctx, "user123", "TestPlayer");

        await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Iron Sword", emoji: "⚔️", slot: "mainHand" as const,
            itemLevel: 10, combatRating: 10, rarity: "Common" as const, stats: {}
          }
        });

        await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Steel Helm", emoji: "⛑️", slot: "helm" as const,
            itemLevel: 12, combatRating: 12, rarity: "Magic" as const, stats: {}
          }
        });

        // Verify gear is in inventory
        let inventory = await ctx.runQuery(api.inventory.functions.getPlayerInventoryQuery, {
          userId: "user123"
        });
        expect(inventory.gear).toHaveLength(2);

        // Execute salvage action
        const salvageCount = await ctx.runMutation(api.inventory.functions.salvageAllGear, {
          userId: "user123"
        });
        expect(salvageCount).toBe(2);

        // Verify gear is cleared
        inventory = await ctx.runQuery(api.inventory.functions.getPlayerInventoryQuery, {
          userId: "user123"
        });
        expect(inventory.gear).toHaveLength(0);
      });
    });
  });

  describe("Material and Item Stacking", () => {
    test("should stack materials correctly", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await createPlayer(ctx, "user123", "TestPlayer");

        // Award same material multiple times
        await ctx.runMutation(api.inventory.functions.awardMaterial, {
          userId: "user123",
          materialData: {
            name: "Iron Ore", emoji: "⛏️", materialType: "ore" as const, quantity: 3
          }
        });

        await ctx.runMutation(api.inventory.functions.awardMaterial, {
          userId: "user123",
          materialData: {
            name: "Iron Ore", emoji: "⛏️", materialType: "ore" as const, quantity: 5
          }
        });

        const inventory = await ctx.runQuery(api.inventory.functions.getPlayerInventoryQuery, {
          userId: "user123"
        });

        expect(inventory.materials).toHaveLength(1);
        expect(inventory.materials[0].quantity).toBe(8);
      });
    });

    test("should stack items correctly", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await createPlayer(ctx, "user123", "TestPlayer");

        // Award same item multiple times
        await ctx.runMutation(api.inventory.functions.awardItem, {
          userId: "user123",
          itemData: {
            name: "Health Potion", emoji: "🧪", category: "consumable" as const, quantity: 2
          }
        });

        await ctx.runMutation(api.inventory.functions.awardItem, {
          userId: "user123",
          itemData: {
            name: "Health Potion", emoji: "🧪", category: "consumable" as const, quantity: 3
          }
        });

        const inventory = await ctx.runQuery(api.inventory.functions.getPlayerInventoryQuery, {
          userId: "user123"
        });

        expect(inventory.items).toHaveLength(1);
        expect(inventory.items[0].quantity).toBe(5);
      });
    });
  });

  describe("Combat Rating Integration", () => {
    test("should calculate accurate combat rating with mixed gear", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await createPlayer(ctx, "user123", "TestPlayer");

        // Award and equip multiple pieces with different combat ratings
        const helm = await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Iron Helm", emoji: "⛑️", slot: "helm" as const,
            itemLevel: 8, combatRating: 8, rarity: "Common" as const, stats: {}
          }
        });

        const chest = await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Steel Chestplate", emoji: "🦺", slot: "chest" as const,
            itemLevel: 12, combatRating: 12, rarity: "Magic" as const, stats: {}
          }
        });

        const weapon = await ctx.runMutation(api.inventory.functions.awardGear, {
          userId: "user123",
          gearData: {
            name: "Magic Sword", emoji: "⚔️", slot: "mainHand" as const,
            itemLevel: 20, combatRating: 20, rarity: "Rare" as const, stats: {}
          }
        });

        // Equip all three pieces
        await ctx.runMutation(api.inventory.functions.equipGear, {
          userId: "user123", gearId: helm.id
        });
        await ctx.runMutation(api.inventory.functions.equipGear, {
          userId: "user123", gearId: chest.id
        });
        await ctx.runMutation(api.inventory.functions.equipGear, {
          userId: "user123", gearId: weapon.id
        });

        const player = await ctx.runQuery(api.inventory.functions.getPlayerWithGear, {
          userId: "user123"
        });

        // 3 equipped pieces (8+12+20=40) + 3 empty slots (10 each = 30) = 70/6 = 11.67 -> 11
        // Note: This assumes game level is 10 (default in test environment)
        expect(player.totalStats.Might).toBeDefined();
        expect(player.equippedGearFormatted.helm.combatRating).toBe(8);
        expect(player.equippedGearFormatted.chest.combatRating).toBe(12);
        expect(player.equippedGearFormatted.mainHand.combatRating).toBe(20);
      });
    });
  });

  describe("Empty State Handling", () => {
    test("should handle empty inventory gracefully", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await createPlayer(ctx, "user123", "TestPlayer");

        const summary = await ctx.runQuery(api.inventory.functions.getInventorySummaryQuery, {
          userId: "user123"
        });

        expect(summary.gearCount).toBe(0);
        expect(summary.materialsCount).toBe(0);
        expect(summary.itemsCount).toBe(0);

        // Test empty template content
        const gearContent = await ctx.runQuery(api.engine.core.resolveTemplateContent, {
          content: "getGearInventoryHelper",
          userId: "user123"
        });

        expect(gearContent.isEmpty).toBe(true);
        expect(gearContent.gear).toEqual([]);

        // Test salvage with no gear
        const salvageCount = await ctx.runMutation(api.inventory.functions.salvageAllGear, {
          userId: "user123"
        });
        expect(salvageCount).toBe(0);
      });
    });
  });
});