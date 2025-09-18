import { z } from "zod";

// Core item type schemas following the hybrid storage design

export const GearItemSchema = z.object({
  id: z.string(),                    // Unique instance ID
  name: z.string(),                  // "Iron Sword", "Steel Helm"
  emoji: z.string(),                 // "⚔️", "🛡️"
  slot: z.enum(['helm', 'chest', 'gloves', 'legs', 'mainHand', 'offhand']),
  itemLevel: z.number(),             // Determines base power
  combatRating: z.number(),          // Used for encounter scaling
  rarity: z.enum(['Common', 'Magic', 'Rare']),
  stats: z.object({                  // Combat bonuses
    Might: z.number().optional(),
    Focus: z.number().optional(),
    Sage: z.number().optional(),
    Armor: z.number().optional(),
    Evasion: z.number().optional(),
    Aegis: z.number().optional(),
  }).default({}),
  createdAt: z.number()
  // Note: Equipped state tracked by location (player.equippedGear vs inventory.gear)
});

export const MaterialItemSchema = z.object({
  id: z.string(),
  name: z.string(),                  // "Iron Ore", "Magic Essence"
  emoji: z.string(),                 // "⛏️", "✨"
  materialType: z.enum(['ore', 'essence', 'component', 'reagent']),
  quantity: z.number().default(1),   // Stackable materials
  createdAt: z.number()
});

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),                  // "Ancient Key", "Health Potion"
  emoji: z.string(),                 // "🗝️", "🧪"
  category: z.enum(['key', 'consumable', 'currency', 'trophy', 'lore']),
  description: z.string().optional(), // Flavor text for quest items
  quantity: z.number().default(1),
  createdAt: z.number()
});

// Inventory storage schema - separate table for unequipped items
export const InventorySchema = z.object({
  userId: z.string(),                // Owner (Discord ID) - primary key

  // Inventory arrays - unequipped items only
  gear: z.array(GearItemSchema).default([]),        // Unequipped gear
  materials: z.array(MaterialItemSchema).default([]), // All materials
  items: z.array(ItemSchema).default([]),            // All general items

  // Metadata
  createdAt: z.number(),
  lastModified: z.number()
});

// Equipped gear schema - embedded in player
export const EquippedGearSchema = z.object({
  helm: GearItemSchema.optional(),
  chest: GearItemSchema.optional(),
  gloves: GearItemSchema.optional(),
  legs: GearItemSchema.optional(),
  mainHand: GearItemSchema.optional(),
  offhand: GearItemSchema.optional()
}).default({});

// TypeScript type exports
export type GearItem = z.infer<typeof GearItemSchema>;
export type MaterialItem = z.infer<typeof MaterialItemSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Inventory = z.infer<typeof InventorySchema>;
export type EquippedGear = z.infer<typeof EquippedGearSchema>;

// Gear slot constants
export const GEAR_SLOTS = ['helm', 'chest', 'gloves', 'legs', 'mainHand', 'offhand'] as const;
export type GearSlot = typeof GEAR_SLOTS[number];

// Gear slot default emojis
export const GEAR_SLOT_EMOJIS = {
  helm: "⛑️",
  chest: "🦺",
  gloves: "🧤",
  legs: "👖",
  mainHand: "⚔️",
  offhand: "🛡️"
} as const;