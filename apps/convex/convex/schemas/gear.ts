import { z } from "zod";

// Core stat system - 6 stats total (Zod schemas as single source of truth)
export const StatTypeSchema = z.enum(['Might', 'Focus', 'Sage', 'Armor', 'Evasion', 'Aegis']);

// Equipment slot definitions
export const GearSlotSchema = z.enum(['Helm', 'Chest', 'Gloves', 'Legs', 'MainHand', 'Offhand']);

// Rarity tiers affect stat slot count
export const GearRaritySchema = z.enum(['Common', 'Magic', 'Rare']);

// Stat values on gear pieces
export const GearStatsSchema = z.object({
  Might: z.number().optional(),
  Focus: z.number().optional(),
  Sage: z.number().optional(),
  Armor: z.number().optional(),
  Evasion: z.number().optional(),
  Aegis: z.number().optional(),
});

// Individual gear piece - the core building block
export const GearItemSchema = z.object({
  id: z.string(),                    // Unique identifier for this specific item
  slot: GearSlotSchema,              // Which equipment slot this fits
  itemLevel: z.number(),             // Base item level (determines stat ranges)
  combatRating: z.number(),          // CR contribution (defaults to itemLevel, modifiable by crafting)
  rarity: GearRaritySchema,          // Determines how many stats this item has
  stats: GearStatsSchema,            // The actual rolled stat values
  createdAt: z.number(),             // When this item was generated
});

// Inferred TypeScript types from Zod schemas
export type StatType = z.infer<typeof StatTypeSchema>;
export type GearSlot = z.infer<typeof GearSlotSchema>;
export type GearRarity = z.infer<typeof GearRaritySchema>;
export type GearStats = z.infer<typeof GearStatsSchema>;
export type GearItem = z.infer<typeof GearItemSchema>;