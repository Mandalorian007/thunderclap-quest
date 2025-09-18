import { MutationCtx } from "../_generated/server";
import { getPlayerByUserId } from "../models/playerModel";
import { getPlayerInventory, removeGearFromInventory, addGearToInventory, clearAllGearFromInventory } from "../models/inventoryModel";
import { GearItem, GearSlot, GEAR_SLOTS } from "../features/inventory/schema";
import { getCurrentGameLevelHelper } from "./gameLevelHelpers";

// Calculate player combat rating from equipped gear (fast - no queries needed)
export function calculatePlayerCombatRating(player: any, gameLevel: number): number {
  const gearCRs = Object.values(player.equippedGear)
    .filter(gear => gear !== undefined)
    .map((gear: any) => gear.combatRating);

  // Average of equipped gear, with game level filling empty slots
  const totalSlots = 6;
  const emptySlots = totalSlots - gearCRs.length;
  const totalCR = gearCRs.reduce((sum, cr) => sum + cr, 0) + (emptySlots * gameLevel);

  return Math.floor(totalCR / totalSlots);
}

// Get player with combat rating (single query)
export async function getPlayerWithCombatRating(ctx: any, userId: string) {
  const [player, gameLevel] = await Promise.all([
    getPlayerByUserId(ctx, userId),
    getCurrentGameLevelHelper(ctx)
  ]);

  return {
    ...player,
    gameLevel,
    combatRating: calculatePlayerCombatRating(player, gameLevel)
  };
}

// Equip gear - moves from inventory to player.equippedGear
export async function equipGearHelper(ctx: MutationCtx, userId: string, gearId: string) {
  const [player, inventory] = await Promise.all([
    getPlayerByUserId(ctx, userId),
    getPlayerInventory(ctx, userId)
  ]);

  if (!inventory) {
    throw new Error("Player has no inventory");
  }

  // Find gear in inventory
  if (!inventory.gear) {
    throw new Error("Inventory has no gear array");
  }

  const gearIndex = inventory.gear.findIndex(g => g.id === gearId);
  if (gearIndex === -1) {
    throw new Error('Gear not found in inventory');
  }

  const gear = inventory.gear[gearIndex];
  const slot = gear.slot as GearSlot;

  // Move currently equipped item back to inventory (if any)
  if (player.equippedGear && player.equippedGear[slot]) {
    const equippedItem = player.equippedGear[slot];
    const gearToMove = {
      ...equippedItem,
      stats: equippedItem.stats || {}
    };
    await addGearToInventory(ctx, userId, gearToMove);
  }

  // Remove gear from inventory first
  await removeGearFromInventory(ctx, userId, gearId);

  // Equip new item on player
  const newEquippedGear = {
    ...(player.equippedGear || {}),
    [slot]: gear
  };

  await ctx.db.patch(player._id, {
    equippedGear: newEquippedGear,
    lastActive: Date.now()
  });

  return {
    equippedGear: gear,
    previousGear: (player.equippedGear && player.equippedGear[slot]) || null
  };
}

// Unequip gear - moves from player.equippedGear to inventory
export async function unequipGearHelper(ctx: MutationCtx, userId: string, slot: GearSlot) {
  const player = await getPlayerByUserId(ctx, userId);

  if (!player.equippedGear || !player.equippedGear[slot]) {
    throw new Error(`NO_GEAR_EQUIPPED:${slot}`);
  }

  const gear = player.equippedGear[slot];

  // Add gear back to inventory with proper stats
  const gearToMove = {
    ...gear,
    stats: gear.stats || {}
  };
  await addGearToInventory(ctx, userId, gearToMove);

  // Remove from equipped gear
  const newEquippedGear = {
    ...(player.equippedGear || {}),
    [slot]: undefined
  };

  await ctx.db.patch(player._id, {
    equippedGear: newEquippedGear,
    lastActive: Date.now()
  });

  return gear;
}

// Salvage all gear from inventory
export async function salvageAllGearHelper(ctx: MutationCtx, userId: string): Promise<number> {
  const gearCount = await clearAllGearFromInventory(ctx, userId);
  return gearCount;
}

// Award gear to inventory
export async function awardGearHelper(ctx: MutationCtx, userId: string, gearData: Omit<GearItem, 'id' | 'createdAt'>) {
  return await addGearToInventory(ctx, userId, gearData);
}

// Format equipped gear for display
export function formatEquippedGear(equippedGear: any) {
  const formatted: Record<string, any> = {};

  for (const slot of GEAR_SLOTS) {
    const gear = equippedGear[slot];
    formatted[slot] = gear ? {
      name: gear.name,
      emoji: gear.emoji,
      itemLevel: gear.itemLevel,
      combatRating: gear.combatRating,
      rarity: gear.rarity,
      stats: gear.stats
    } : null;
  }

  return formatted;
}

// Get all equipped gear items as array
export function getEquippedGearArray(equippedGear: any): GearItem[] {
  return GEAR_SLOTS
    .map(slot => equippedGear[slot])
    .filter(gear => gear !== undefined);
}

// Check if player has gear equipped in specific slot
export function hasGearEquipped(equippedGear: any, slot: GearSlot): boolean {
  return equippedGear[slot] !== undefined;
}

// Get total stat bonus from equipped gear
export function calculateTotalStats(equippedGear: any) {
  const totalStats = {
    Might: 0,
    Focus: 0,
    Sage: 0,
    Armor: 0,
    Evasion: 0,
    Aegis: 0
  };

  const equippedItems = getEquippedGearArray(equippedGear);

  for (const gear of equippedItems) {
    for (const [stat, value] of Object.entries(gear.stats)) {
      if (value && totalStats.hasOwnProperty(stat)) {
        (totalStats as any)[stat] += value;
      }
    }
  }

  return totalStats;
}