import { QueryCtx, MutationCtx } from "../_generated/server";
import { Inventory, GearItem, MaterialItem, Item } from "../features/inventory/schema";

// Generate unique ID for items
export function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get player inventory by userId
export async function getPlayerInventory(ctx: QueryCtx | MutationCtx, userId: string) {
  const inventory = await ctx.db
    .query("inventory")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!inventory) {
    // Return empty inventory structure if none exists
    return null;
  }

  return inventory;
}

// Ensure inventory exists for player
export async function ensureInventoryExists(ctx: MutationCtx, userId: string) {
  const existing = await getPlayerInventory(ctx, userId);

  if (existing) {
    return existing;
  }

  // Create new inventory
  const inventoryData = {
    userId,
    gear: [],
    materials: [],
    items: [],
    createdAt: Date.now(),
    lastModified: Date.now()
  };

  const inventoryId = await ctx.db.insert("inventory", inventoryData);
  return await ctx.db.get(inventoryId);
}

// Add gear to inventory (unequipped)
export async function addGearToInventory(ctx: MutationCtx, userId: string, gearData: Omit<GearItem, 'id' | 'createdAt'>) {
  const inventory = await ensureInventoryExists(ctx, userId);
  if (!inventory) throw new Error("Failed to create inventory");

  const gear: GearItem = {
    ...gearData,
    stats: gearData.stats || {},
    id: generateItemId(),
    createdAt: Date.now()
  };

  if (!inventory.gear) inventory.gear = [];
  inventory.gear.push(gear);

  await ctx.db.patch(inventory._id, {
    gear: inventory.gear,
    lastModified: Date.now()
  });

  return gear;
}

// Add material to inventory with stacking
export async function addMaterialToInventory(ctx: MutationCtx, userId: string, materialData: Omit<MaterialItem, 'id' | 'createdAt'>) {
  const inventory = await ensureInventoryExists(ctx, userId);
  if (!inventory) throw new Error("Failed to create inventory");

  // Initialize materials array if needed
  if (!inventory.materials) inventory.materials = [];

  // Try to stack with existing material of same type
  const existingIndex = inventory.materials.findIndex(m =>
    m.name === materialData.name && m.materialType === materialData.materialType
  );

  if (existingIndex >= 0) {
    // Stack with existing
    const existingMaterial = inventory.materials[existingIndex];
    if (existingMaterial) {
      existingMaterial.quantity = (existingMaterial.quantity || 0) + materialData.quantity;
    }
  } else {
    // Create new material
    const material: MaterialItem = {
      ...materialData,
      id: generateItemId(),
      createdAt: Date.now()
    };
    inventory.materials.push(material);
  }

  await ctx.db.patch(inventory._id, {
    materials: inventory.materials,
    lastModified: Date.now()
  });

  const targetIndex = existingIndex >= 0 ? existingIndex : inventory.materials.length - 1;
  return inventory.materials[targetIndex];
}

// Add item to inventory with stacking
export async function addItemToInventory(ctx: MutationCtx, userId: string, itemData: Omit<Item, 'id' | 'createdAt'>) {
  const inventory = await ensureInventoryExists(ctx, userId);
  if (!inventory) throw new Error("Failed to create inventory");

  // Initialize items array if needed
  if (!inventory.items) inventory.items = [];

  // Try to stack with existing item of same type
  const existingIndex = inventory.items.findIndex(i =>
    i.name === itemData.name && i.category === itemData.category
  );

  if (existingIndex >= 0) {
    // Stack with existing
    const existingItem = inventory.items[existingIndex];
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + itemData.quantity;
    }
  } else {
    // Create new item
    const item: Item = {
      ...itemData,
      id: generateItemId(),
      createdAt: Date.now()
    };
    inventory.items.push(item);
  }

  await ctx.db.patch(inventory._id, {
    items: inventory.items,
    lastModified: Date.now()
  });

  const targetIndex = existingIndex >= 0 ? existingIndex : inventory.items.length - 1;
  const targetItem = inventory.items[targetIndex];
  if (!targetItem) {
    throw new Error("Failed to retrieve item after adding to inventory");
  }
  return targetItem;
}

// Remove gear from inventory by ID
export async function removeGearFromInventory(ctx: MutationCtx, userId: string, gearId: string): Promise<GearItem | null> {
  const inventory = await getPlayerInventory(ctx, userId);
  if (!inventory) return null;

  if (!inventory.gear) return null;

  const gearIndex = inventory.gear.findIndex(g => g.id === gearId);
  if (gearIndex === -1) return null;

  const [removedGear] = inventory.gear.splice(gearIndex, 1);

  await ctx.db.patch(inventory._id, {
    gear: inventory.gear,
    lastModified: Date.now()
  });

  // Ensure stats field is present
  const gearWithStats: GearItem = {
    ...removedGear,
    stats: removedGear.stats || {}
  };

  return gearWithStats;
}

// Clear all gear from inventory (for salvage)
export async function clearAllGearFromInventory(ctx: MutationCtx, userId: string): Promise<number> {
  const inventory = await getPlayerInventory(ctx, userId);
  if (!inventory || !inventory.gear) return 0;

  const gearCount = inventory.gear.length;

  if (gearCount === 0) return 0;

  await ctx.db.patch(inventory._id, {
    gear: [],
    lastModified: Date.now()
  });

  return gearCount;
}

// Get inventory summary counts
export async function getInventorySummary(ctx: QueryCtx | MutationCtx, userId: string) {
  const inventory = await getPlayerInventory(ctx, userId);

  if (!inventory) {
    return {
      gearCount: 0,
      materialsCount: 0,
      itemsCount: 0
    };
  }

  return {
    gearCount: inventory.gear?.length || 0,
    materialsCount: inventory.materials?.length || 0,
    itemsCount: inventory.items?.length || 0
  };
}