# Zod with Convex - Design Decision

## Problem Statement

We want to define our data models (Player, GearItem, etc.) once and use them everywhere:
- TypeScript types for the application
- Runtime validation for functions
- Database schema for Convex tables

## Solution: Zod + convex-helpers

The `convex-helpers` package provides `zodOutputToConvex()` which converts Zod schemas to Convex table schemas automatically.

## Implementation Approach

### 1. Define Schemas in Zod

```typescript
// schemas/player.ts
import { z } from "zod";

export const GearItemSchema = z.object({
  id: z.string(),
  slot: z.enum(["Helm", "Chest", "Gloves", "Legs", "MainHand", "Offhand"]),
  itemLevel: z.number(),
  combatRating: z.number(),
  rarity: z.enum(["Common", "Magic", "Rare"]),
  stats: z.object({
    Might: z.number().optional(),
    Focus: z.number().optional(),
    Sage: z.number().optional(),
    Armor: z.number().optional(),
    Evasion: z.number().optional(),
    Aegis: z.number().optional(),
  }),
  createdAt: z.number(),
});

export const PlayerSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  createdAt: z.number(),
  lastActive: z.number(),
  xp: z.number(),
  level: z.number(),
  titles: z.array(z.string()),
  currentTitle: z.string().optional(),
  equippedGear: z.object({
    helm: GearItemSchema.optional(),
    chest: GearItemSchema.optional(),
    gloves: GearItemSchema.optional(),
    legs: GearItemSchema.optional(),
    mainHand: GearItemSchema.optional(),
    offhand: GearItemSchema.optional(),
  }),
  inventory: z.array(GearItemSchema),
});

export type Player = z.infer<typeof PlayerSchema>;
export type GearItem = z.infer<typeof GearItemSchema>;
```

### 2. Generate Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { zodOutputToConvex } from "convex-helpers/server/zod";
import { PlayerSchema } from "../schemas/player";

export default defineSchema({
  players: defineTable(zodOutputToConvex(PlayerSchema))
    .index("userId", ["userId"])
    .index("level", ["level"]),
});
```

### 3. Use Zod-Validated Functions

```typescript
// convex/players.ts
import { zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { PlayerSchema } from "../schemas/player";

const zMutation = zCustomMutation(mutation, NoOp);

export const createPlayer = zMutation({
  args: {
    playerData: PlayerSchema.omit({ createdAt: true, lastActive: true }),
  },
  handler: async (ctx, { playerData }) => {
    // playerData is fully typed and validated
    const player = {
      ...playerData,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    return await ctx.db.insert("players", player);
  },
});
```

## Benefits

1. **DRY**: Define data models once in Zod
2. **Type Safety**: Consistent types across frontend/backend
3. **Runtime Validation**: Automatic validation at function boundaries
4. **No Manual Work**: Database schemas generated automatically

## Key Capabilities Verified

- ✅ Complex nested objects (equippedGear with optional slots)
- ✅ Arrays of complex objects (inventory)
- ✅ Optional fields and enums
- ✅ Full TypeScript inference
- ✅ No performance issues

## Dependencies

```json
{
  "convex-helpers": "^0.1.104",
  "zod": "^3.x"
}
```

## Decision

**Recommended**: Use Zod as single source of truth for all data models in Thunderclap Quest. The tooling is mature and handles our complex gear system without issues.