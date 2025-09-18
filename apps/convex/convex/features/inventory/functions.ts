import { mutation, query } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { InventoryTemplateId, InventoryActionId } from "./types";
import { GearItemSchema, MaterialItemSchema, ItemSchema, GEAR_SLOTS } from "./schema";
import { getPlayerInventory, getInventorySummary, addGearToInventory, addMaterialToInventory, addItemToInventory } from "../../models/inventoryModel";
import { getPlayerByUserId } from "../../models/playerModel";
import { equipGearHelper, unequipGearHelper, salvageAllGearHelper, formatEquippedGear, calculateTotalStats } from "../../helpers/inventoryHelpers";
import { ActionResult, createReward, ITEM_REWARD } from "../../shared/rewards";
import { registerActionHelper } from "../../helpers/actionRegistry";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Content helper functions for templates

export async function getInventoryOverviewHelper(ctx: any, { userId }: { userId: string }) {
  const summary = await getInventorySummary(ctx, userId);

  return {
    title: "📦 Your Inventory",
    description: `${summary.gearCount} Gear, ${summary.materialsCount} Materials, ${summary.itemsCount} Items`,
    gearCount: summary.gearCount,
    materialsCount: summary.materialsCount,
    itemsCount: summary.itemsCount
  };
}

export async function getGearInventoryHelper(ctx: any, { userId }: { userId: string }) {
  const inventory = await getPlayerInventory(ctx, userId);

  if (!inventory || !inventory.gear || inventory.gear.length === 0) {
    return {
      title: "⚔️ Gear Inventory",
      description: "Your gear inventory is empty.",
      gear: [],
      isEmpty: true
    };
  }

  return {
    title: "⚔️ Gear Inventory",
    description: `${inventory.gear.length} pieces of equipment`,
    gear: inventory.gear.map(g => ({
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      slot: g.slot,
      itemLevel: g.itemLevel,
      rarity: g.rarity
    })),
    isEmpty: false
  };
}

export async function getMaterialsInventoryHelper(ctx: any, { userId }: { userId: string }) {
  const inventory = await getPlayerInventory(ctx, userId);

  if (!inventory || !inventory.materials || inventory.materials.length === 0) {
    return {
      title: "⛏️ Materials",
      description: "No materials in your inventory.",
      materials: [],
      isEmpty: true
    };
  }

  return {
    title: "⛏️ Materials",
    description: `${inventory.materials.length} types of materials`,
    materials: inventory.materials.map(m => ({
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      materialType: m.materialType,
      quantity: m.quantity
    })),
    isEmpty: false
  };
}

export async function getItemsInventoryHelper(ctx: any, { userId }: { userId: string }) {
  const inventory = await getPlayerInventory(ctx, userId);

  if (!inventory || !inventory.items || inventory.items.length === 0) {
    return {
      title: "📦 Items",
      description: "No items in your inventory.",
      items: [],
      isEmpty: true
    };
  }

  return {
    title: "📦 Items",
    description: `${inventory.items.length} types of items`,
    items: inventory.items.map(i => ({
      id: i.id,
      name: i.name,
      emoji: i.emoji,
      category: i.category,
      quantity: i.quantity,
      description: i.description
    })),
    isEmpty: false
  };
}

// Action helper function for salvage
export async function salvageAllGearActionHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const gearCount = await salvageAllGearHelper(ctx, userId);

  if (gearCount === 0) {
    // Stay on same screen, no rewards section
    return {
      nextTemplateId: InventoryTemplateId.INVENTORY_GEAR,
      rewards: undefined
    };
  }

  // Stay on gear tab, but show rewards
  return {
    nextTemplateId: InventoryTemplateId.INVENTORY_GEAR,
    rewards: {
      rewards: [
        createReward(ITEM_REWARD, gearCount, "Items Salvaged")
      ]
    }
  };
}

// Register action helpers
registerActionHelper(`${InventoryTemplateId.INVENTORY_GEAR}.${InventoryActionId.SALVAGE_ALL_GEAR}`, salvageAllGearActionHelper);

// Convex functions

export const getPlayerInventoryQuery = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    return await getPlayerInventory(ctx, userId);
  }
});

export const getInventorySummaryQuery = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    return await getInventorySummary(ctx, userId);
  }
});

export const getPlayerWithGear = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    const player = await getPlayerByUserId(ctx, userId);

    return {
      ...player,
      equippedGearFormatted: formatEquippedGear(player.equippedGear),
      totalStats: calculateTotalStats(player.equippedGear)
    };
  }
});

export const awardGear = zMutation({
  args: {
    userId: z.string(),
    gearData: GearItemSchema.omit({ id: true, createdAt: true })
  },
  handler: async (ctx, { userId, gearData }) => {
    return await addGearToInventory(ctx, userId, gearData);
  }
});

export const awardMaterial = zMutation({
  args: {
    userId: z.string(),
    materialData: MaterialItemSchema.omit({ id: true, createdAt: true })
  },
  handler: async (ctx, { userId, materialData }) => {
    return await addMaterialToInventory(ctx, userId, materialData);
  }
});

export const awardItem = zMutation({
  args: {
    userId: z.string(),
    itemData: ItemSchema.omit({ id: true, createdAt: true })
  },
  handler: async (ctx, { userId, itemData }) => {
    return await addItemToInventory(ctx, userId, itemData);
  }
});

export const equipGear = zMutation({
  args: {
    userId: z.string(),
    gearId: z.string()
  },
  handler: async (ctx, { userId, gearId }) => {
    return await equipGearHelper(ctx, userId, gearId);
  }
});

export const unequipGear = zMutation({
  args: {
    userId: z.string(),
    slot: z.enum(GEAR_SLOTS)
  },
  handler: async (ctx, { userId, slot }) => {
    return await unequipGearHelper(ctx, userId, slot);
  }
});

export const salvageAllGear = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    return await salvageAllGearHelper(ctx, userId);
  }
});