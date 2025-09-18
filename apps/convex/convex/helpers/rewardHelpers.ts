import { MutationCtx } from "../_generated/server";
import { addGearToInventory, addMaterialToInventory, addItemToInventory } from "../models/inventoryModel";
import { GearItem, MaterialItem, Item } from "../features/inventory/schema";
import { RewardEntry, GEAR_REWARD, MATERIAL_REWARD, ITEM_REWARD } from "../shared/rewards";

// Award gear and return reward entry
export async function awardGearReward(
  ctx: MutationCtx,
  userId: string,
  gearData: Omit<GearItem, 'id' | 'createdAt'>
): Promise<RewardEntry> {
  await addGearToInventory(ctx, userId, gearData);

  return {
    icon: gearData.emoji,
    amount: 1,
    name: gearData.name
  };
}

// Award material and return reward entry
export async function awardMaterialReward(
  ctx: MutationCtx,
  userId: string,
  materialData: Omit<MaterialItem, 'id' | 'createdAt'>
): Promise<RewardEntry> {
  await addMaterialToInventory(ctx, userId, materialData);

  return {
    icon: materialData.emoji,
    amount: materialData.quantity,
    name: materialData.name
  };
}

// Award item and return reward entry
export async function awardItemReward(
  ctx: MutationCtx,
  userId: string,
  itemData: Omit<Item, 'id' | 'createdAt'>
): Promise<RewardEntry> {
  await addItemToInventory(ctx, userId, itemData);

  return {
    icon: itemData.emoji,
    amount: itemData.quantity,
    name: itemData.name
  };
}

// Award multiple gear pieces
export async function awardMultipleGear(
  ctx: MutationCtx,
  userId: string,
  gearList: Array<Omit<GearItem, 'id' | 'createdAt'>>
): Promise<RewardEntry[]> {
  const rewards: RewardEntry[] = [];

  for (const gearData of gearList) {
    const reward = await awardGearReward(ctx, userId, gearData);
    rewards.push(reward);
  }

  return rewards;
}

// Award multiple materials
export async function awardMultipleMaterials(
  ctx: MutationCtx,
  userId: string,
  materialList: Array<Omit<MaterialItem, 'id' | 'createdAt'>>
): Promise<RewardEntry[]> {
  const rewards: RewardEntry[] = [];

  for (const materialData of materialList) {
    const reward = await awardMaterialReward(ctx, userId, materialData);
    rewards.push(reward);
  }

  return rewards;
}

// Award multiple items
export async function awardMultipleItems(
  ctx: MutationCtx,
  userId: string,
  itemList: Array<Omit<Item, 'id' | 'createdAt'>>
): Promise<RewardEntry[]> {
  const rewards: RewardEntry[] = [];

  for (const itemData of itemList) {
    const reward = await awardItemReward(ctx, userId, itemData);
    rewards.push(reward);
  }

  return rewards;
}

// Generate sample gear for testing/encounters
export function generateSampleGear(playerLevel: number, slot: GearItem['slot']): Omit<GearItem, 'id' | 'createdAt'> {
  const rarities: GearItem['rarity'][] = ['Common', 'Magic', 'Rare'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];

  const baseStats = Math.floor(playerLevel / 2);
  const statVariation = Math.floor(baseStats * 0.25);

  // Generate random stats based on rarity
  const stats: any = {};
  const numStats = rarity === 'Common' ? 1 : rarity === 'Magic' ? 2 : 3;
  const availableStats = ['Might', 'Focus', 'Sage', 'Armor', 'Evasion', 'Aegis'];

  for (let i = 0; i < numStats; i++) {
    const statName = availableStats.splice(Math.floor(Math.random() * availableStats.length), 1)[0];
    stats[statName] = baseStats + Math.floor(Math.random() * statVariation * 2) - statVariation;
  }

  const gearNames: Record<GearItem['slot'], string[]> = {
    helm: ['Iron Helm', 'Steel Helmet', 'Warrior\'s Crown'],
    chest: ['Leather Armor', 'Chain Mail', 'Plate Chestpiece'],
    gloves: ['Leather Gloves', 'Iron Gauntlets', 'Mystic Handwraps'],
    legs: ['Cloth Pants', 'Chain Leggings', 'Battle Greaves'],
    mainHand: ['Iron Sword', 'Steel Blade', 'Mystic Staff'],
    offhand: ['Wooden Shield', 'Iron Shield', 'Spell Focus']
  };

  const gearEmojis: Record<GearItem['slot'], string> = {
    helm: '⛑️',
    chest: '🦺',
    gloves: '🧤',
    legs: '👖',
    mainHand: '⚔️',
    offhand: '🛡️'
  };

  const nameOptions = gearNames[slot];
  const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];

  return {
    name,
    emoji: gearEmojis[slot],
    slot,
    itemLevel: playerLevel,
    combatRating: playerLevel,
    rarity,
    stats
  };
}

// Generate sample materials for testing/encounters
export function generateSampleMaterial(): Omit<MaterialItem, 'id' | 'createdAt'> {
  const materials = [
    { name: 'Iron Ore', emoji: '⛏️', materialType: 'ore' as const, quantity: Math.floor(Math.random() * 5) + 1 },
    { name: 'Magic Essence', emoji: '✨', materialType: 'essence' as const, quantity: Math.floor(Math.random() * 3) + 1 },
    { name: 'Clockwork Gears', emoji: '⚙️', materialType: 'component' as const, quantity: Math.floor(Math.random() * 2) + 1 },
    { name: 'Alchemical Reagent', emoji: '🧪', materialType: 'reagent' as const, quantity: Math.floor(Math.random() * 4) + 1 }
  ];

  return materials[Math.floor(Math.random() * materials.length)];
}

// Generate sample items for testing/encounters
export function generateSampleItem(): Omit<Item, 'id' | 'createdAt'> {
  const items = [
    { name: 'Ancient Key', emoji: '🗝️', category: 'key' as const, quantity: 1 },
    { name: 'Health Potion', emoji: '🧪', category: 'consumable' as const, quantity: Math.floor(Math.random() * 3) + 1 },
    { name: 'Temple Token', emoji: '🪙', category: 'currency' as const, quantity: Math.floor(Math.random() * 10) + 1 },
    { name: 'Victory Medal', emoji: '🏅', category: 'trophy' as const, quantity: 1 },
    { name: 'Ancient Scroll', emoji: '📜', category: 'lore' as const, quantity: 1, description: 'A scroll containing ancient wisdom' }
  ];

  return items[Math.floor(Math.random() * items.length)];
}