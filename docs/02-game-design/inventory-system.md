# Multi-Type Inventory System Design Document

## Overview

This document outlines the design for a multi-type inventory system for Thunderclap Quest, supporting three distinct item categories: **Gear** (equipable items), **Materials** (crafting components), and **Items** (quest items, consumables, collectibles, etc.).

## Design Principles

- **Simplicity**: Minimal schema complexity, maximum flexibility in code
- **Type Safety**: Clear TypeScript types for each item category
- **Array Operations**: Items stored in arrays with familiar JavaScript operations
- **Scalable Storage**: Separate tables prevent document size limits while maintaining clean APIs
- **Hybrid Architecture**: Equipped gear on player (fast access), inventory separate (unlimited growth)
- **Separated Concerns**: Clear distinction between "wearing" (equipped) and "owning" (inventory)

## Database Schema

### Core Item Types

```typescript
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
```

### Hybrid Storage Schema

```typescript
// Inventory schema - unequipped items only
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

// Player schema includes equipped gear for fast access
export const PlayerSchema = z.object({
  // Identity & Progression
  userId: z.string(),
  displayName: z.string(),
  createdAt: z.number(),
  lastActive: z.number(),
  xp: z.number(),
  level: z.number(),
  titles: z.array(z.string()),
  currentTitle: z.string().optional(),

  // Equipped gear - stored on player for fast profile/combat access
  equippedGear: z.object({
    helm: GearItemSchema.optional(),
    chest: GearItemSchema.optional(),
    gloves: GearItemSchema.optional(),
    legs: GearItemSchema.optional(),
    mainHand: GearItemSchema.optional(),
    offhand: GearItemSchema.optional()
  }).default({})
});
```

### Database Tables

```typescript
// schema.ts
export default defineSchema({
  // Profile feature - includes equipped gear for performance
  players: defineTable(zodOutputToConvex(PlayerSchema))
    .index("userId", ["userId"]),

  // Inventory feature - separate table for unequipped items
  inventory: defineTable(zodOutputToConvex(InventorySchema))
    .index("userId", ["userId"]),

  // Progression feature
  gameLevels: defineTable(zodOutputToConvex(GameLevelSchema)),
});
```

## Core Operations

### Item Award System

```typescript
// Award gear to inventory (unequipped)
export async function awardGear(ctx: any, userId: string, gear: Omit<GearItem, 'id' | 'createdAt'>) {
  const inventory = await getPlayerInventory(ctx, userId);

  const gearItem = {
    ...gear,
    id: generateId(),
    createdAt: Date.now()
  };

  inventory.gear.push(gearItem);

  await ctx.db.patch(inventory._id, {
    gear: inventory.gear,
    lastModified: Date.now()
  });
}

// Award materials with stacking
export async function awardMaterial(ctx: any, userId: string, material: Omit<MaterialItem, 'id' | 'createdAt'>) {
  const inventory = await getPlayerInventory(ctx, userId);

  // Try to stack with existing material of same type
  const existing = inventory.materials.find(m =>
    m.name === material.name && m.materialType === material.materialType
  );

  if (existing) {
    existing.quantity += material.quantity;
  } else {
    inventory.materials.push({
      ...material,
      id: generateId(),
      createdAt: Date.now()
    });
  }

  await ctx.db.patch(inventory._id, {
    materials: inventory.materials,
    lastModified: Date.now()
  });
}

// Award general items with stacking
export async function awardItem(ctx: any, userId: string, item: Omit<Item, 'id' | 'createdAt'>) {
  const inventory = await getPlayerInventory(ctx, userId);

  // Try to stack with existing item of same type
  const existing = inventory.items.find(i =>
    i.name === item.name && i.category === item.category
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    inventory.items.push({
      ...item,
      id: generateId(),
      createdAt: Date.now()
    });
  }

  await ctx.db.patch(inventory._id, {
    items: inventory.items,
    lastModified: Date.now()
  });
}
```

### Equipment Management

```typescript
// Equip gear - moves from inventory to player.equippedGear
export async function equipGear(ctx: any, userId: string, gearId: string) {
  const [player, inventory] = await Promise.all([
    getPlayerByUserId(ctx, userId),
    getPlayerInventory(ctx, userId)
  ]);

  // Find gear in inventory
  const gearIndex = inventory.gear.findIndex(g => g.id === gearId);
  if (gearIndex === -1) throw new Error('Gear not found in inventory');

  const gear = inventory.gear[gearIndex];
  const slot = gear.slot;

  // Move currently equipped item back to inventory (if any)
  if (player.equippedGear[slot]) {
    inventory.gear.push(player.equippedGear[slot]);
  }

  // Equip new item (move from inventory to player)
  player.equippedGear[slot] = gear;
  inventory.gear.splice(gearIndex, 1);

  // Update both documents
  await Promise.all([
    ctx.db.patch(player._id, { equippedGear: player.equippedGear }),
    ctx.db.patch(inventory._id, {
      gear: inventory.gear,
      lastModified: Date.now()
    })
  ]);
}

// Unequip gear - moves from player.equippedGear to inventory
export async function unequipGear(ctx: any, userId: string, slot: string) {
  const [player, inventory] = await Promise.all([
    getPlayerByUserId(ctx, userId),
    getPlayerInventory(ctx, userId)
  ]);

  if (!player.equippedGear[slot]) {
    throw new Error(`No gear equipped in ${slot} slot`);
  }

  // Move equipped item to inventory
  inventory.gear.push(player.equippedGear[slot]);
  player.equippedGear[slot] = undefined;

  // Update both documents
  await Promise.all([
    ctx.db.patch(player._id, { equippedGear: player.equippedGear }),
    ctx.db.patch(inventory._id, {
      gear: inventory.gear,
      lastModified: Date.now()
    })
  ]);
}
```

## Item Category Details

### Gear Items
- **Purpose**: Equipable items that provide combat bonuses
- **Slots**: 6 equipment slots (helm, chest, gloves, legs, mainHand, offhand)
- **Stats**: Based on existing 6-stat system (Might/Focus/Sage vs Armor/Evasion/Aegis)
- **Rarity**: Affects stat distribution and power level
- **Examples**: "Iron Sword" ⚔️, "Steel Helm" ⛑️, "Leather Gloves" 🧤

### Material Items
- **Purpose**: Crafting components for future systems
- **Types**:
  - **Ore**: Weapon/armor crafting materials
  - **Essence**: Magical enhancement components
  - **Component**: Mechanical/technical parts
  - **Reagent**: Consumable creation materials
- **Stacking**: Automatic stacking of identical materials for inventory management
- **Examples**: "Iron Ore" ⛏️, "Magic Essence" ✨, "Clockwork Gears" ⚙️

### Items (General Category)
- **Purpose**: Quest progression, consumables, collectibles
- **Categories**:
  - **Key**: Access items for encounters
  - **Consumable**: Usable items with effects
  - **Currency**: Special tokens and currencies
  - **Trophy**: Achievement and victory items
  - **Lore**: Story items with flavor text
- **Stacking**: Automatic stacking of identical items for inventory management
- **Examples**: "Ancient Key" 🗝️, "Health Potion" 🧪, "Temple Tokens" 🪙

## Integration Points

### Reward System Integration

```typescript
// Encounter rewards support all item types
const rewards = [
  { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name },
  { icon: "⚔️", amount: 1, name: "Iron Sword" },        // Gear
  { icon: "⛏️", amount: 5, name: "Iron Ore" },          // Material
  { icon: "🗝️", amount: 1, name: "Ancient Key" }        // Item
];
```

### Combat Rating System

```typescript
// Calculate player combat rating from equipped gear (fast - no queries needed)
export function calculatePlayerCombatRating(player: Player, gameLevel: number): number {
  const gearCRs = Object.values(player.equippedGear)
    .filter(gear => gear !== undefined)
    .map(gear => gear.combatRating);

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
    getCurrentGameLevel()
  ]);

  return {
    ...player,
    combatRating: calculatePlayerCombatRating(player, gameLevel)
  };
}
```

### Discord Integration

#### Single Inventory Command with Template Engine

```typescript
/inventory           // Single command that opens inventory hub
```

#### Navigation Structure (Hub-and-Spoke)
- **Overview Hub** → Can navigate to any sub-inventory (Gear, Materials, Items)
- **Sub-Inventories** → Can only return to Overview Hub (cleaner button layout)

#### Template-Based Inventory System

```typescript
export enum InventoryTemplateId {
  INVENTORY_OVERVIEW = "INVENTORY_OVERVIEW",    // Main summary view
  INVENTORY_GEAR = "INVENTORY_GEAR",           // Gear management tab
  INVENTORY_MATERIALS = "INVENTORY_MATERIALS", // Materials tab
  INVENTORY_ITEMS = "INVENTORY_ITEMS"          // General items tab
}

export enum InventoryActionId {
  // Navigation
  VIEW_GEAR = "VIEW_GEAR",
  VIEW_MATERIALS = "VIEW_MATERIALS",
  VIEW_ITEMS = "VIEW_ITEMS",
  BACK_TO_OVERVIEW = "BACK_TO_OVERVIEW",

  // Inventory management
  SALVAGE_ALL_GEAR = "SALVAGE_ALL_GEAR"
}
```

#### Template Structure

```typescript
export const inventoryFeatureTemplateSet = {
  startTemplate: InventoryTemplateId.INVENTORY_OVERVIEW,

  templates: {
    // MAIN HUB - navigate to sub-inventories
    [InventoryTemplateId.INVENTORY_OVERVIEW]: {
      content: getInventoryOverviewHelper, // Shows counts and summary
      actions: [
        { id: InventoryActionId.VIEW_GEAR, label: "⚔️ Gear", execute: InventoryTemplateId.INVENTORY_GEAR },
        { id: InventoryActionId.VIEW_MATERIALS, label: "⛏️ Materials", execute: InventoryTemplateId.INVENTORY_MATERIALS },
        { id: InventoryActionId.VIEW_ITEMS, label: "📦 Items", execute: InventoryTemplateId.INVENTORY_ITEMS }
      ]
    },

    // GEAR TAB - view + cleanup
    [InventoryTemplateId.INVENTORY_GEAR]: {
      content: getGearInventoryHelper,
      actions: [
        { id: InventoryActionId.BACK_TO_OVERVIEW, label: "← Back", execute: InventoryTemplateId.INVENTORY_OVERVIEW },
        { id: InventoryActionId.SALVAGE_ALL_GEAR, label: "🔨 Salvage All", execute: salvageAllGearHelper }
      ]
    },

    // MATERIALS TAB - view only (for now)
    [InventoryTemplateId.INVENTORY_MATERIALS]: {
      content: getMaterialsInventoryHelper,
      actions: [
        { id: InventoryActionId.BACK_TO_OVERVIEW, label: "← Back", execute: InventoryTemplateId.INVENTORY_OVERVIEW }
      ]
    },

    // ITEMS TAB - view only (for now)
    [InventoryTemplateId.INVENTORY_ITEMS]: {
      content: getItemsInventoryHelper,
      actions: [
        { id: InventoryActionId.BACK_TO_OVERVIEW, label: "← Back", execute: InventoryTemplateId.INVENTORY_OVERVIEW }
      ]
    }
  }
};
```

#### Salvage System

```typescript
// Salvage all gear - clears inventory with inline rewards
export async function salvageAllGearHelper(ctx: any, { userId }: { userId: string }) {
  const player = await getPlayerByUserId(ctx, userId);

  if (player.gear.length === 0) {
    // Stay on same screen, no rewards section
    return {
      nextTemplateId: InventoryTemplateId.INVENTORY_GEAR,
      rewards: null
    };
  }

  const gearCount = player.gear.length;

  // Clear all gear
  player.gear = [];
  await ctx.db.patch(player._id, { gear: [] });

  // Stay on gear tab, but show rewards
  return {
    nextTemplateId: InventoryTemplateId.INVENTORY_GEAR,
    rewards: {
      rewards: [
        { icon: "🔨", amount: gearCount, name: "Items Salvaged" }
      ]
    }
  };
}
```

#### User Flow Example

```
User: /inventory
Bot: "📦 Your Inventory - 5 Gear, 12 Materials, 3 Items"
     [⚔️ Gear] [⛏️ Materials] [📦 Items]

User: Clicks [⚔️ Gear]
Bot: "⚔️ Gear Inventory
     🗡️ Iron Sword
     ⛑️ Steel Helm
     👢 Leather Boots"
     [← Back] [🔨 Salvage All]

User: Clicks [🔨 Salvage All]
Bot: "⚔️ Gear Inventory
     (empty - no gear items)

     🎁 Rewards Earned
     🔨 +3 Items Salvaged"
     [← Back] [🔨 Salvage All]
```

### Gear Slot Default Emojis

```typescript
export const GEAR_SLOT_EMOJIS = {
  helm: "⛑️",
  chest: "🦺",
  gloves: "🧤",
  legs: "👖",
  mainHand: "⚔️",
  offhand: "🛡️"
} as const;
```

## Future Considerations

### Tier System Replacement
Instead of tier fields, higher-tier items are distinct items with better stats:
- "Iron Sword" (itemLevel: 15, stats: {Might: 10})
- "Mythril Sword" (itemLevel: 30, stats: {Might: 25})
- "Dragon Sword" (itemLevel: 50, stats: {Might: 45})

### Effect System
Item effects handled in code rather than stored data:
- Consumable usage logic in dedicated functions
- Key unlock mechanics in encounter templates
- Buff/debuff systems as separate game mechanics

### Crafting Integration
Materials prepare for future crafting system:
- Recipe definitions in code, not database
- Crafting functions consume materials from inventory
- Crafted items added as new gear/items with generated stats

## Implementation Priority

1. **Phase 1**: Core schema implementation in profile feature
2. **Phase 2**: Basic inventory template system with navigation
3. **Phase 3**: Item award integration with encounter reward system
4. **Phase 4**: Salvage system for inventory cleanup
5. **Phase 5**: Future features (equip/unequip, crafting, item locking)

## Benefits

### **Hybrid Architecture Advantages**
- **Fast Profile Display**: Equipped gear loads immediately with player data
- **Fast Combat Rating**: No additional queries needed for encounter scaling
- **Unlimited Inventory Growth**: Separate table prevents document size limits
- **Clean Separation**: "Wearing" vs "Owning" distinction is architecturally clear
- **Optimal Query Patterns**: Each use case gets exactly the data it needs

### **Development Benefits**
- **Array Operations**: Familiar JavaScript array methods throughout
- **Type Safety**: Clear TypeScript types prevent errors
- **Template-Powered**: Uses existing engine for all UI interactions
- **Hub-and-Spoke Navigation**: Clean, focused interfaces per inventory type
- **Inline Rewards**: Immediate feedback without template switching
- **Reward Integration**: Seamless integration with existing template reward system

### **Performance Benefits**
- **Single Query Profile**: Player + equipped gear in one query
- **Selective Inventory Loading**: Load only needed inventory sections
- **Concurrent Operations**: Equipment and inventory operations are independent
- **Efficient Combat**: Combat rating calculation requires no database calls

This hybrid design provides the optimal foundation for item progression, combining the performance benefits of separate storage with the simplicity of equipped gear on the player record.