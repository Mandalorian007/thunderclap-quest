# Gear and Combat Rating System

## Core Philosophy

**Combat Rating System**: Simple averaging prevents gear "wipes" while creating upgrade pressure
**Dual-Level Pressure**: Player level determines gear drops, Game level determines encounter difficulty

## GearItem Schema Definition

```typescript
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
```

### Key Design Features
- **Direct CR Property**: `combatRating` defaults to `itemLevel` but allows crafting modifications
- **Flexible Stats**: Only contains stats that actually rolled based on rarity
- **Capitalized Types**: System-level consistency for all enum values
- **Future-Proof**: Supports both MVP simplicity and advanced crafting systems

## Combat Rating (CR) System

### Simple Formula
**Player CR = Average of all equipped gear slot item levels**

### How It Works
- **Gear CR = Item Level**: A level 30 sword provides 30 CR
- **Empty Slots = Game Level**: Unequipped slots count as current game level CR
- **Equal Weighting**: All gear slots contribute equally to the average

### Example Calculations
```
Example Gear Setup (Current Game Level: 25):

Full Gear Example:
All equipped pieces at item level 30 → Player CR = 30

Missing Gear Example:
Most pieces at level 30 + 1 empty slot (counts as 25) → Player CR drops slightly

New Player Example:
One level 10 weapon + remaining empty slots (count as 25 each) → Player CR heavily influenced by game level
```

### Benefits
- **Maximum Simplicity**: Higher item level always = higher CR
- **New Player Friendly**: Empty slots don't cripple early progression
- **No Gear Wipes**: Old gear stays useful, just becomes less optimal
- **Clear Upgrade Paths**: Easy to identify which pieces need replacing

## Gear Drop System

### Player Level Drops
- **Drop Rule**: All gear drops at player's current level
- **Catch-Up Friendly**: New players get relevant gear immediately
- **Consistent Power**: Gear level determines base effectiveness

### Game Level Pressure
- **Encounter Scaling**: All encounters scale with game level
- **Performance Gap**: Game level typically ahead of average player level
- **Upgrade Motivation**: Old gear becomes insufficient for current content, but not useless

## Stat System

### **6-Stat System**

**Offensive Stats:**
- **Might**: Melee damage scaling
- **Focus**: Ranged damage scaling
- **Sage**: Spell damage scaling

**Defensive Stats:**
- **Armor**: Physical damage reduction
- **Evasion**: Ranged damage avoidance
- **Aegis**: Magic damage resistance

### **Stat Integration**
- **Combat Rating**: Determined solely by item level averaging
- **Stats**: Affect encounter success rates and available options
- **Build Variety**: Players can specialize or balance across combat styles
- **Gear Choices**: Each piece can contribute to multiple playstyles

## Gear Slots

### **Core Equipment Slots (6 Total)**
- **Helm**: Head protection and enhancement
- **Chest**: Torso armor and core defense
- **Gloves**: Hand equipment and dexterity
- **Legs**: Lower body protection and mobility
- **Main Hand**: Primary weapon
- **Offhand**: Secondary weapon or shield

**Note**: Players start with no equipment - all empty slots count as game level CR

## Gear Rarity System

### **Rarity Tiers**
- **Common**: 1 stat slot
- **Magic**: 2 stat slots
- **Rare**: 3 stat slots

### **Stat Slot System**
- Each stat slot can roll any of the 6 stats (Might, Focus, Sage, Armor, Evasion, Aegis)
- Higher rarity = more stats = more build flexibility

### **Stat Scaling by Item Level**
- **Max Formula**: Max stat value = Item Level ÷ 2 (rounded down)
- **Gap Formula**: Gap Percentage = 25% - (15% × √(Max) ÷ 32)
- **Min Formula**: Min = Max × (1 - Gap Percentage)

### **Stat Range Examples**
```
Level 10: Max +5, Gap 24% = +4 (Gap: 1 point)
Level 100: Max +50, Gap 21% = +40 (Gap: 10 points)
Level 1,000: Max +500, Gap 15% = +425 (Gap: 75 points)
Level 10,000: Max +5,000, Gap 10% = +4,500 (Gap: 500 points)
```

### **Benefits**
- **Meaningful early variance**: 25% gap makes low-level rolls exciting
- **Smooth transition**: Square root decay from 25% to 10% gap
- **Stable late game**: Settles at 10% variance for predictability
- **Future-proof**: Natural curve scales infinitely without maintenance

## Future Systems (Post-MVP)

### **Crafting & Currency System**
- PoE-style orb system for stat rerolling and gear modification
- Functional currency where crafting materials replace traditional gold
- Gear upgrade and enhancement mechanics

### **Secondary Stat Properties**
- Additional gear properties beyond the core 6 stats
- Special effects, set bonuses, or unique modifiers
- Enhanced build variety and specialization options

### **Accessory Slots**
- Additional equipment slots (rings, amulets, etc.)
- Specialized gear for fine-tuning builds
- Enhanced customization options


