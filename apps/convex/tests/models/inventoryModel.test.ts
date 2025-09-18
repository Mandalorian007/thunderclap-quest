import { describe, test, expect } from "vitest";
import {
  getPlayerInventory,
  ensureInventoryExists,
  addGearToInventory,
  addMaterialToInventory,
  addItemToInventory,
  removeGearFromInventory,
  clearAllGearFromInventory,
  getInventorySummary
} from "../../convex/models/inventoryModel";
import { createPlayer } from "../../convex/models/playerModel";
import { createTestInstance } from "../helpers/test-utils";

describe("Inventory Model", () => {
  describe("Inventory Creation", () => {
    test("should return null for non-existent inventory", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory).toBeNull();
      });
    });

    test("should create inventory if it doesn't exist", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const inventory = await ensureInventoryExists(ctx, "user123");

        expect(inventory).toBeDefined();
        expect(inventory.userId).toBe("user123");
        expect(inventory.gear).toEqual([]);
        expect(inventory.materials).toEqual([]);
        expect(inventory.items).toEqual([]);
        expect(inventory.createdAt).toBeTypeOf("number");
        expect(inventory.lastModified).toBeTypeOf("number");
      });
    });

    test("should return existing inventory if it already exists", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const first = await ensureInventoryExists(ctx, "user123");
        const second = await ensureInventoryExists(ctx, "user123");

        expect(first._id).toEqual(second._id);
        expect(first.createdAt).toBe(second.createdAt);
      });
    });
  });

  describe("Gear Management", () => {
    test("should add gear to inventory", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const gearData = {
          name: "Iron Sword",
          emoji: "⚔️",
          slot: "mainHand" as const,
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common" as const,
          stats: { Might: 5 }
        };

        const gear = await addGearToInventory(ctx, "user123", gearData);

        expect(gear.id).toBeTypeOf("string");
        expect(gear.name).toBe("Iron Sword");
        expect(gear.slot).toBe("mainHand");
        expect(gear.createdAt).toBeTypeOf("number");

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.gear).toHaveLength(1);
        expect(inventory.gear[0].id).toBe(gear.id);
      });
    });

    test("should remove gear from inventory", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const gearData = {
          name: "Iron Sword",
          emoji: "⚔️",
          slot: "mainHand" as const,
          itemLevel: 10,
          combatRating: 10,
          rarity: "Common" as const,
          stats: { Might: 5 }
        };

        const gear = await addGearToInventory(ctx, "user123", gearData);
        const removedGear = await removeGearFromInventory(ctx, "user123", gear.id);

        expect(removedGear).toBeDefined();
        expect(removedGear!.id).toBe(gear.id);

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.gear).toHaveLength(0);
      });
    });

    test("should return null when removing non-existent gear", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const removedGear = await removeGearFromInventory(ctx, "user123", "nonexistent");
        expect(removedGear).toBeNull();
      });
    });

    test("should clear all gear from inventory", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        // Add multiple gear pieces
        await addGearToInventory(ctx, "user123", {
          name: "Iron Sword", emoji: "⚔️", slot: "mainHand" as const,
          itemLevel: 10, combatRating: 10, rarity: "Common" as const, stats: {}
        });
        await addGearToInventory(ctx, "user123", {
          name: "Steel Helm", emoji: "⛑️", slot: "helm" as const,
          itemLevel: 12, combatRating: 12, rarity: "Magic" as const, stats: {}
        });

        const clearedCount = await clearAllGearFromInventory(ctx, "user123");
        expect(clearedCount).toBe(2);

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.gear).toHaveLength(0);
      });
    });
  });

  describe("Material Management", () => {
    test("should add material to inventory", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const materialData = {
          name: "Iron Ore",
          emoji: "⛏️",
          materialType: "ore" as const,
          quantity: 5
        };

        const material = await addMaterialToInventory(ctx, "user123", materialData);

        expect(material.id).toBeTypeOf("string");
        expect(material.name).toBe("Iron Ore");
        expect(material.quantity).toBe(5);
        expect(material.createdAt).toBeTypeOf("number");

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.materials).toHaveLength(1);
      });
    });

    test("should stack materials of same type", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const materialData = {
          name: "Iron Ore",
          emoji: "⛏️",
          materialType: "ore" as const,
          quantity: 3
        };

        await addMaterialToInventory(ctx, "user123", materialData);
        await addMaterialToInventory(ctx, "user123", { ...materialData, quantity: 2 });

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.materials).toHaveLength(1);
        expect(inventory.materials[0].quantity).toBe(5);
      });
    });

    test("should not stack materials of different types", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        await addMaterialToInventory(ctx, "user123", {
          name: "Iron Ore", emoji: "⛏️", materialType: "ore" as const, quantity: 3
        });
        await addMaterialToInventory(ctx, "user123", {
          name: "Magic Essence", emoji: "✨", materialType: "essence" as const, quantity: 2
        });

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.materials).toHaveLength(2);
      });
    });
  });

  describe("Item Management", () => {
    test("should add item to inventory", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const itemData = {
          name: "Ancient Key",
          emoji: "🗝️",
          category: "key" as const,
          quantity: 1
        };

        const item = await addItemToInventory(ctx, "user123", itemData);

        expect(item.id).toBeTypeOf("string");
        expect(item.name).toBe("Ancient Key");
        expect(item.category).toBe("key");
        expect(item.createdAt).toBeTypeOf("number");

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.items).toHaveLength(1);
      });
    });

    test("should stack items of same type and category", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const itemData = {
          name: "Health Potion",
          emoji: "🧪",
          category: "consumable" as const,
          quantity: 2
        };

        await addItemToInventory(ctx, "user123", itemData);
        await addItemToInventory(ctx, "user123", { ...itemData, quantity: 3 });

        const inventory = await getPlayerInventory(ctx, "user123");
        expect(inventory.items).toHaveLength(1);
        expect(inventory.items[0].quantity).toBe(5);
      });
    });
  });

  describe("Inventory Summary", () => {
    test("should return correct summary counts", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        // Add various items
        await addGearToInventory(ctx, "user123", {
          name: "Iron Sword", emoji: "⚔️", slot: "mainHand" as const,
          itemLevel: 10, combatRating: 10, rarity: "Common" as const, stats: {}
        });
        await addGearToInventory(ctx, "user123", {
          name: "Steel Helm", emoji: "⛑️", slot: "helm" as const,
          itemLevel: 12, combatRating: 12, rarity: "Magic" as const, stats: {}
        });

        await addMaterialToInventory(ctx, "user123", {
          name: "Iron Ore", emoji: "⛏️", materialType: "ore" as const, quantity: 5
        });

        await addItemToInventory(ctx, "user123", {
          name: "Ancient Key", emoji: "🗝️", category: "key" as const, quantity: 1
        });

        const summary = await getInventorySummary(ctx, "user123");

        expect(summary.gearCount).toBe(2);
        expect(summary.materialsCount).toBe(1);
        expect(summary.itemsCount).toBe(1);
      });
    });

    test("should return zero counts for empty inventory", async () => {
      const t = createTestInstance();
      await t.run(async (ctx) => {
        const summary = await getInventorySummary(ctx, "user123");

        expect(summary.gearCount).toBe(0);
        expect(summary.materialsCount).toBe(0);
        expect(summary.itemsCount).toBe(0);
      });
    });
  });
});