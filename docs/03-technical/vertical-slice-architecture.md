# Vertical Slice Architecture

## Overview

Thunderclap Quest uses **vertical slice architecture** to organize features. Each feature contains all related code (schema, functions, templates, tests) in a single directory, creating cohesive, independent modules.

## Directory Structure

```
apps/convex/convex/
├── features/                   # Feature-based vertical slices
│   ├── profile/               # Player profile feature
│   │   ├── types.ts           # Template/action ID enums
│   │   ├── schema.ts          # Player data models
│   │   ├── functions.ts       # Profile queries/mutations
│   │   ├── templates.ts       # Profile engine templates
│   │   └── index.ts           # Feature exports
│   ├── combat/                # Combat system feature
│   │   ├── types.ts           # Template/action ID enums
│   │   ├── schema.ts          # Combat/equipment schemas
│   │   ├── functions.ts       # Combat logic
│   │   ├── templates.ts       # Combat encounter templates
│   │   └── index.ts
│   ├── quests/                # Quest system feature
│   │   ├── types.ts           # Template/action ID enums
│   │   ├── schema.ts          # Quest/objective schemas
│   │   ├── functions.ts       # Quest logic
│   │   ├── templates.ts       # Quest encounter templates
│   │   └── index.ts
│   └── guilds/                # Guild management feature
│       ├── types.ts           # Template/action ID enums
│       ├── schema.ts          # Guild/member schemas
│       ├── functions.ts       # Guild management
│       ├── templates.ts       # Guild-related templates
│       └── index.ts
├── engine/                    # Cross-cutting template framework
│   ├── types.ts               # Core template types
│   └── core.ts                # Template execution engine
├── schema.ts                  # Aggregates all feature schemas
└── _generated/                # Convex generated files

tests/
├── features/                  # Feature-specific tests
│   ├── profile.test.ts        # Profile feature tests
│   ├── combat.test.ts         # Combat feature tests
│   └── quests.test.ts         # Quest feature tests
├── engine/                    # Engine framework tests
│   ├── core.test.ts           # Core engine tests
│   └── integration.test.ts    # End-to-end tests
└── helpers/                   # Test utilities
    └── test-utils.ts          # Shared test helpers
```

## Feature Slice Components

### 1. Types (`types.ts`)
Defines template and action ID enums for the feature to prevent circular imports.

```typescript
// features/profile/types.ts
export enum ProfileTemplateId {
  PROFILE_DISPLAY = "PROFILE_DISPLAY"
}

export enum ProfileActionId {
  // Profile has no actions - terminal template
}
```

### 2. Schema (`schema.ts`)
Defines all data models for the feature using Zod schemas.

```typescript
// features/profile/schema.ts
import { z } from "zod";

export const PlayerSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  xp: z.number().default(0),
  level: z.number().default(1),
  titles: z.array(z.string()).default([]),
  currentTitle: z.string().optional(),
  createdAt: z.number(),
  lastActive: z.number(),
});

export type Player = z.infer<typeof PlayerSchema>;
```

### 3. Functions (`functions.ts`)
Contains all Convex queries, mutations, and helper functions for the feature.

```typescript
// features/profile/functions.ts
import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { PlayerSchema } from "./schema";
import { ProfileTemplateId } from "./types";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Convex functions
export const getPlayer = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    // Implementation
  }
});

// Helper functions (for engine use)
export async function getPlayerProfileContentHelper(ctx: any, { userId }: { userId: string }) {
  // Implementation
}
```

### 4. Templates (`templates.ts`)
Defines engine templates and template sets for the feature.

```typescript
// features/profile/templates.ts
import type { FeatureTemplateSet } from "../../engine/types";
import { getPlayerProfileContentHelper } from "./functions";
import { ProfileTemplateId, ProfileActionId } from "./types";

// Re-export types for external use
export { ProfileTemplateId, ProfileActionId };

export const profileFeatureTemplateSet: FeatureTemplateSet<ProfileTemplateId, ProfileActionId> = {
  startTemplate: ProfileTemplateId.PROFILE_DISPLAY,
  templates: {
    [ProfileTemplateId.PROFILE_DISPLAY]: {
      content: getPlayerProfileContentHelper,
      actions: [] // Empty array = terminal template
    }
  }
};
```

### 5. Index (`index.ts`)
Exports all public components of the feature.

```typescript
// features/profile/index.ts
export * from "./types";
export * from "./schema";
export * from "./functions";
export * from "./templates";
```

## Schema Aggregation

The root `schema.ts` file aggregates all feature schemas:

```typescript
// schema.ts
import { defineSchema } from "convex/server";
import { PlayerSchema } from "./features/profile/schema";
import { GuildSchema } from "./features/guilds/schema";
import { QuestSchema } from "./features/quests/schema";

export default defineSchema({
  // Profile feature tables
  players: PlayerSchema,

  // Guild feature tables
  guilds: GuildSchema,
  guildMembers: GuildMemberSchema,

  // Quest feature tables
  quests: QuestSchema,
  questObjectives: QuestObjectiveSchema,
});
```

## API Generation

Convex generates APIs that reflect the feature structure:

```typescript
// Usage in Discord bot
import { api } from "../convex/_generated/api";

// Access profile functions
await convex.query(api.profile.functions.getPlayer, { userId });

// Access combat functions
await convex.mutation(api.combat.functions.dealDamage, { userId, damage });

// Access quest functions
await convex.query(api.quests.functions.getActiveQuests, { userId });
```

## Benefits

### 1. **Cohesion**
All related code lives together. Want to modify profile functionality? Everything is in `features/profile/`.

### 2. **Independence**
Features can evolve without affecting others. Combat changes don't impact quest logic.

### 3. **Clarity**
Easy navigation. No hunting across multiple directories for related files.

### 4. **Scalability**
Add new features without file sprawl. Each feature is self-contained.

### 5. **Testing**
Feature tests are colocated. Easy to test complete feature functionality.

### 6. **Onboarding**
New developers can understand a feature by exploring a single directory.

## Migration Guide

### From Current Structure
```
# Old structure
convex/
├── players.ts          # Mixed concerns
├── profile.ts          # Mixed concerns
├── schemas/player.ts   # Scattered schemas
└── features/profile-feature.ts  # Partial feature

# New structure
convex/features/profile/
├── types.ts           # Template/action ID enums
├── schema.ts          # All profile schemas
├── functions.ts       # All profile logic
├── templates.ts       # All profile templates
└── index.ts           # Clean exports
```

### Migration Steps
1. **Create feature directory**: `mkdir features/profile`
2. **Move and consolidate**: Combine related files into feature slice
3. **Update imports**: Fix import paths to use new structure
4. **Update schema aggregation**: Import schemas in root `schema.ts`
5. **Update tests**: Move tests to `tests/features/`

## Best Practices

### 1. **Keep Features Independent**
Avoid importing across features. Use engine layer for shared functionality.

### 2. **Use Clear Naming**
- `types.ts` - Always contains template/action ID enums (prevents circular imports)
- `schema.ts` - Always contains feature schemas
- `functions.ts` - Always contains Convex functions and helpers (imports from `./types`)
- `templates.ts` - Always contains engine templates (imports from `./types`)
- `index.ts` - Always exports public interface

### 3. **Test Boundaries**
Test each feature as a complete unit. Integration tests verify feature interactions.

### 4. **Start Small**
Begin with core features (profile, basic combat) before adding complex features.

### 5. **Document Dependencies**
If features must interact, document the interaction patterns clearly.

## Example: Adding a New Feature

To add a new "inventory" feature:

1. **Create directory**: `features/inventory/`
2. **Define types**: `types.ts` with template/action ID enums
3. **Define schema**: `schema.ts` with item and inventory schemas
4. **Implement functions**: `functions.ts` with inventory management logic (imports from `./types`)
5. **Create templates**: `templates.ts` with inventory display templates (imports from `./types`)
6. **Export interface**: `index.ts` with public exports
7. **Add to root schema**: Import schemas in root `schema.ts`
8. **Write tests**: `tests/features/inventory.test.ts`

Result: Complete inventory feature contained in single directory, ready for independent development and testing.