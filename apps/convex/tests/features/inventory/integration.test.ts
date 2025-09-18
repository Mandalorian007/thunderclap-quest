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
import { api } from "../../../convex/_generated/api";

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

        // Equip the gear using helper function directly
        await equipGearHelper(ctx, "user123", gear.id);

        // Check player now has equipped gear and inventory is empty
        const { getPlayerWithStats } = await import("../../../convex/models/playerModel");
        const updatedPlayer = await getPlayerWithStats(ctx, "user123");

        expect(updatedPlayer.equippedGear.mainHand).toBeDefined();
        expect(updatedPlayer.equippedGear.mainHand.name).toBe("Iron Sword");

        const updatedInventory = await getPlayerInventory(ctx, "user123");
        expect(updatedInventory.gear).toHaveLength(0);

        // Combat rating should reflect equipped gear
        expect(updatedPlayer.equippedGear.mainHand.combatRating).toBe(15);
      });
    });

    test("should handle gear swapping correctly", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        // Create player and award two weapons
        await createPlayer(ctx, "user123", "TestPlayer");

        const sword = await addGearToInventory(ctx, "user123", {
          name: "Iron Sword", emoji: "⚔️", slot: "mainHand" as const,
          itemLevel: 10, combatRating: 10, rarity: "Common" as const, stats: { Might: 5 }
        });

        const axe = await addGearToInventory(ctx, "user123", {
          name: "Battle Axe", emoji: "🪓", slot: "mainHand" as const,
          itemLevel: 15, combatRating: 15, rarity: "Magic" as const, stats: { Might: 10 }
        });

        // Equip sword first
        await equipGearHelper(ctx, "user123", sword.id);

        const { getPlayerWithStats } = await import("../../../convex/models/playerModel");
        let player = await getPlayerWithStats(ctx, "user123");
        expect(player.equippedGear.mainHand.name).toBe("Iron Sword");

        let inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.gear).toHaveLength(1);
        expect(inventory.gear[0].name).toBe("Battle Axe");

        // Equip axe (should swap with sword)
        await equipGearHelper(ctx, "user123", axe.id);

        player = await getPlayerWithStats(ctx, "user123");
        expect(player.equippedGear.mainHand.name).toBe("Battle Axe");

        inventory = await getPlayerInventory(ctx, "user123");
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
        await addGearToInventory(ctx, "user123", {
          name: "Iron Sword", emoji: "⚔️", slot: "mainHand" as const,
          itemLevel: 10, combatRating: 10, rarity: "Common" as const, stats: {}
        });

        await addMaterialToInventory(ctx, "user123", {
          name: "Iron Ore", emoji: "⛏️", materialType: "ore" as const, quantity: 5
        });

        await addItemToInventory(ctx, "user123", {
          name: "Ancient Key", emoji: "🗝️", category: "key" as const, quantity: 1
        });

        // Test template content helpers
        const {
          getInventoryOverviewHelper,
          getGearInventoryHelper,
          getMaterialsInventoryHelper,
          getItemsInventoryHelper
        } = await import("../../../convex/features/inventory/functions");

        const overviewContent = await getInventoryOverviewHelper(ctx, { userId: "user123" });

        expect(overviewContent.title).toBe("📦 Your Inventory");
        expect(overviewContent.description).toBe("1 Gear, 1 Materials, 1 Items");
        expect(overviewContent.gearCount).toBe(1);
        expect(overviewContent.materialsCount).toBe(1);
        expect(overviewContent.itemsCount).toBe(1);

        const gearContent = await getGearInventoryHelper(ctx, { userId: "user123" });

        expect(gearContent.title).toBe("⚔️ Gear Inventory");
        expect(gearContent.gear).toHaveLength(1);
        expect(gearContent.gear[0].name).toBe("Iron Sword");
        expect(gearContent.isEmpty).toBe(false);

        const materialsContent = await getMaterialsInventoryHelper(ctx, { userId: "user123" });

        expect(materialsContent.title).toBe("⛏️ Materials");
        expect(materialsContent.materials).toHaveLength(1);
        expect(materialsContent.materials[0].name).toBe("Iron Ore");
        expect(materialsContent.materials[0].quantity).toBe(5);

        const itemsContent = await getItemsInventoryHelper(ctx, { userId: "user123" });

        expect(itemsContent.title).toBe("📦 Items");
        expect(itemsContent.items).toHaveLength(1);
        expect(itemsContent.items[0].name).toBe("Ancient Key");
      });
    });

  });
});