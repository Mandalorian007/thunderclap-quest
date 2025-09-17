# Engine Template Framework

## Core Concept

**Feature Template Sets are typed encounter flows** that define complete backend features with enum-based ID validation. Each feature template set defines:
- **Enum-based IDs**: Explicit enums for all template and action IDs
- **Direct object access**: No fragile lookups, compile-time validation
- **Typed routing**: Template and action references use enum values
- **Mixed execution**: Actions can be enum routes, Convex functions, or null for completion

This creates a **100% backend-supported framework** where feature flows are completely type-safe and automatically validated.

## Vertical Slice Organization

Each feature is organized as a complete vertical slice containing all related code:

```
features/
├── chest/                  # Chest encounter feature
│   ├── types.ts           # Chest template/action ID enums
│   ├── schema.ts          # Chest/loot data schemas
│   ├── functions.ts       # Chest-related queries/mutations
│   ├── templates.ts       # Chest template definitions
│   └── index.ts           # Feature exports
├── combat/                # Combat encounter feature
│   ├── types.ts           # Combat template/action ID enums
│   ├── schema.ts          # Combat/equipment schemas
│   ├── functions.ts       # Combat logic
│   ├── templates.ts       # Combat templates
│   └── index.ts
└── profile/               # Player profile feature
    ├── types.ts           # Profile template/action ID enums
    ├── schema.ts          # Player data schema
    ├── functions.ts       # Profile queries/mutations
    ├── templates.ts       # Profile templates
    └── index.ts
```

**Benefits of Vertical Slices:**
- **Cohesion**: All chest-related code lives in `features/chest/`
- **Independence**: Features can evolve without affecting others
- **Clarity**: Easy to find and modify feature-specific logic
- **Scalability**: Add new features without file sprawl

## Feature Template Set Definition

```typescript
import type { FunctionReference, RegisteredMutation } from "convex/server";

export type TemplateActionFunction = RegisteredMutation<"public", { userId: string }, Promise<string | null>>;

export type EngineAction<TTemplateIds, TActionIds> = {
  id: TActionIds;
  label: string;
  execute: TTemplateIds | TemplateActionFunction | FunctionReference<"mutation", "public", { userId: string }, TTemplateIds | null> | null;
};

export type EngineTemplate<TContent, TTemplateIds, TActionIds> = {
  content: TContent | FunctionReference<"query", "public", { userId: string }, TContent>;
  actions: EngineAction<TTemplateIds, TActionIds>[];
};

export type FeatureTemplateSet<TTemplateIds, TActionIds> = {
  startTemplate: TTemplateIds;
  templates: Record<TTemplateIds, EngineTemplate<any, TTemplateIds, TActionIds>>;
};
```

## Example: Chest Feature Template Set

**Feature Types Definition** (`features/chest/types.ts`):
```typescript
// Define all template IDs as enum
export enum ChestTemplateId {
  MYSTERIOUS_CHEST = "MYSTERIOUS_CHEST",
  CHEST_EXAMINED = "CHEST_EXAMINED",
  LOOT_SELECTION = "LOOT_SELECTION",
  ENCOUNTER_COMPLETE = "ENCOUNTER_COMPLETE"
}

// Define all action IDs as enum
export enum ChestActionId {
  EXAMINE = "EXAMINE",
  FORCE_OPEN = "FORCE_OPEN",
  DISARM = "DISARM",
  TRIGGER = "TRIGGER",
  STEP_BACK = "STEP_BACK",
  TAKE_ITEM = "TAKE_ITEM",
  TAKE_COINS = "TAKE_COINS",
  TAKE_ALL = "TAKE_ALL",
  DONE = "DONE",
  LEAVE = "LEAVE"
}
```

**Feature Template Set Definition** (`features/chest/templates.ts`):
```typescript
import { api } from "../../_generated/api";
import { ChestTemplateId, ChestActionId } from "./types";

// Re-export types for external use
export { ChestTemplateId, ChestActionId };

// Complete chest encounter flow with enum-based IDs
export const chestFeatureTemplateSet: FeatureTemplateSet<ChestTemplateId, ChestActionId> = {
  startTemplate: ChestTemplateId.MYSTERIOUS_CHEST,

  templates: {
    [ChestTemplateId.MYSTERIOUS_CHEST]: {
      content: {
        title: "A Mysterious Chest",
        description: "An ornate wooden chest sits before you, slightly ajar.",
        chestType: "wooden",
        isLocked: false,
        trapSuspected: true
      },
      actions: [
        {
          id: ChestActionId.EXAMINE,
          label: "Examine Closely",
          execute: api.chest.functions.examineChest
        },
        {
          id: ChestActionId.FORCE_OPEN,
          label: "Force Open",
          execute: api.chest.functions.forceOpenChest
        },
        {
          id: ChestActionId.LEAVE,
          label: "Walk Away",
          execute: null // null = encounter complete
        }
      ]
    },

    [ChestTemplateId.CHEST_EXAMINED]: {
      content: api.chest.functions.getExamineResults,
      actions: [
        {
          id: ChestActionId.DISARM,
          label: "Disarm Trap",
          execute: api.chest.functions.disarmTrap
        },
        {
          id: ChestActionId.TRIGGER,
          label: "Trigger Trap",
          execute: api.chest.functions.triggerTrap
        },
        {
          id: ChestActionId.STEP_BACK,
          label: "Step Back",
          execute: ChestTemplateId.MYSTERIOUS_CHEST // Direct enum reference
        }
      ]
    },

    [ChestTemplateId.LOOT_SELECTION]: {
      content: api.chest.functions.getLootOptions,
      actions: [
        {
          id: ChestActionId.TAKE_ITEM,
          label: "Take Item",
          execute: api.chest.functions.takeSpecificItem
        },
        {
          id: ChestActionId.TAKE_COINS,
          label: "Take Coins",
          execute: api.chest.functions.takeCoins
        },
        {
          id: ChestActionId.TAKE_ALL,
          label: "Take Everything",
          execute: api.chest.functions.takeAllItems
        },
        {
          id: ChestActionId.DONE,
          label: "Done",
          execute: null // completion
        }
      ]
    },

    [ChestTemplateId.ENCOUNTER_COMPLETE]: {
      content: {
        title: "Encounter Complete",
        description: "You continue on your journey..."
      },
      actions: [] // Empty array = terminal state
    }
  }
};
```

## Convex Functions (Backend Logic)

**Convex Implementation** (`features/chest/functions.ts`):
```typescript
import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { ChestTemplateId } from "./types";

// Action functions return enum values or null for completion
export const examineChest = mutation({
  args: {
    userId: v.string(),
    actionData: v.optional(v.any())
  },
  handler: async (ctx, { userId }): Promise<ChestTemplateId | null> => {
    // Award XP for examination
    const player = await ctx.db.query("players").filter(q => q.eq("userId", userId)).first();
    await ctx.db.patch(player._id, {
      xp: player.xp + 10
    });

    // Return enum value for type safety
    return ChestTemplateId.CHEST_EXAMINED;
  }
});

export const forceOpenChest = mutation({
  args: {
    userId: v.string(),
    actionData: v.optional(v.any())
  },
  handler: async (ctx, { userId }): Promise<ChestTemplateId | null> => {
    const success = Math.random() > 0.3; // 70% success rate

    if (success) {
      // Award loot
      await ctx.db.insert("inventory", {
        userId,
        itemId: "ancient_scroll",
        quantity: 1
      });
      return ChestTemplateId.LOOT_SELECTION;
    } else {
      // Take damage, but allow retry
      return ChestTemplateId.CHEST_EXAMINED;
    }
  }
});

// Dynamic content functions
export const getExamineResults = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const player = await ctx.db.query("players").filter(q => q.eq("userId", userId)).first();

    return {
      title: "Trap Detected!",
      description: "Your keen eyes spot a pressure plate mechanism.",
      trapType: "pressure plate",
      trapDifficulty: player.skillLevel > 5 ? "easy" : "medium",
      playerSkillLevel: player.skillLevel
    };
  }
});

export const getLootOptions = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const player = await ctx.db.query("players").filter(q => q.eq("userId", userId)).first();

    return {
      title: "Treasure Found!",
      description: "The chest opens to reveal valuable items.",
      availableItems: [
        { id: "scroll_1", name: "Ancient Scroll", value: 100, rarity: "rare" },
        { id: "potion_1", name: "Health Potion", value: 25, rarity: "common" }
      ],
      coinsAvailable: 75,
      playerCoins: player.coins
    };
  }
});
```

## Core Engine (Framework)

**Simplified Template Engine** (`convex/features/engine.ts`):
```typescript
import { mutation, query } from "convex/_generated/server";
import { v } from "convex/values";
import { chestFeatureTemplateSet, ChestTemplateId } from "./chest-feature";
// import { combatFeatureTemplateSet, CombatTemplateId } from "./combat-feature";

// Helper to resolve template content (static or dynamic)
export const resolveTemplateContent = query({
  args: {
    content: v.any(), // Template content (object or function reference)
    userId: v.string()
  },
  handler: async (ctx, { content, userId }) => {
    // If content is a function reference, call it. Otherwise return as-is
    return typeof content === 'function'
      ? await content(ctx, { userId })
      : content;
  }
});

// Execute a template action
export const executeAction = mutation({
  args: {
    action: v.any(), // Action object with execute property
    userId: v.string()
  },
  handler: async (ctx, { action, userId }) => {
    if (typeof action.execute === 'string') {
      // Static routing - return the template ID
      return { nextTemplateId: action.execute };
    } else if (action.execute === null) {
      // Explicit completion
      return { isComplete: true };
    } else {
      // Dynamic routing - call the function
      const nextTemplateId = await action.execute(ctx, { userId });
      return nextTemplateId
        ? { nextTemplateId }
        : { isComplete: true };
    }
  }
});

// Start a random encounter - returns starting template
export const startRandomEncounter = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Pick random starting template
    const startingTemplates = [
      chestFeatureTemplateSet.templates[ChestTemplateId.MYSTERIOUS_CHEST]
      // Add more: combatFeatureTemplateSet.templates[CombatTemplateId.BANDIT_ENCOUNTER]
    ];

    return startingTemplates[Math.floor(Math.random() * startingTemplates.length)];
  }
});
```

## Validation & Safety

**Enum-Based Validation** (Optional):
```typescript
export function validateFeatureTemplateSet<TTemplateIds, TActionIds>(
  featureTemplateSet: FeatureTemplateSet<TTemplateIds, TActionIds>
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const templateIds = new Set(Object.keys(featureTemplateSet.templates));
  const reachableIds = new Set([featureTemplateSet.startTemplate]);

  // Check all routing targets exist and mark reachable templates
  for (const [templateId, template] of Object.entries(featureTemplateSet.templates)) {
    for (const action of template.actions) {
      if (typeof action.execute === 'string') {
        // Static routing - enum values should always be valid due to TypeScript
        reachableIds.add(action.execute);
      } else if (action.execute === null) {
        // Explicit completion - valid
      } else {
        // Dynamic routing - TypeScript + enum return types provide compile-time safety
        warnings.push(`Template ${templateId}, action ${action.id} uses dynamic routing - runtime validation enabled`);
      }
    }
  }

  return { errors, warnings };
}

// Validation is now mostly optional due to enum-based type safety
const chestValidation = validateFeatureTemplateSet(chestFeatureTemplateSet);
if (chestValidation.warnings.length > 0) {
  console.warn("Chest feature validation warnings:", chestValidation.warnings);
}
```

## Frontend Usage (Platform Agnostic)

**Discord Bot Implementation**:
```typescript
import { api } from "../convex/_generated/api";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } from "discord.js";
import { chestFeatureTemplateSet, ChestTemplateId, ChestActionId } from "../convex/features/chest-feature";

// Start a random encounter
async function startRandomEncounter(userId: string) {
  const template = await convex.query(api.features.startRandomEncounter, { userId });
  const content = await convex.query(api.features.resolveTemplateContent, {
    content: template.content,
    userId
  });

  return { template, content };
}

// Handle action button clicks
async function handleActionClick(userId: string, buttonId: string) {
  const [templateId, actionId] = buttonId.split(':');

  // Get the template and action directly
  const template = chestFeatureTemplateSet.templates[templateId as ChestTemplateId];
  const action = template.actions.find(a => a.id === actionId as ChestActionId);

  // Execute the action
  const result = await convex.mutation(api.features.executeAction, { action, userId });

  if (result.isComplete) {
    return {
      embed: new EmbedBuilder()
        .setTitle("Adventure Complete!")
        .setDescription("You continue on your journey..."),
      components: []
    };
  }

  // Get next template and resolve its content
  const nextTemplate = getTemplateById(result.nextTemplateId);
  const nextContent = await convex.query(api.features.resolveTemplateContent, {
    content: nextTemplate.content,
    userId
  });

  return createDiscordEmbed(nextTemplate, nextContent);
}

// Helper to get template by ID (could be made more generic)
function getTemplateById(templateId: string) {
  if (Object.values(ChestTemplateId).includes(templateId as ChestTemplateId)) {
    return chestFeatureTemplateSet.templates[templateId as ChestTemplateId];
  }
  // Add more features here
  throw new Error(`Template ${templateId} not found`);
}

// Render template as Discord embed
function createDiscordEmbed(template: any, content: any) {
  const embed = new EmbedBuilder()
    .setTitle(content.title)
    .setDescription(content.description);

  // Add any additional fields from content
  Object.entries(content).forEach(([key, value]) => {
    if (key !== 'title' && key !== 'description' && value) {
      embed.addFields({ name: key, value: value.toString() });
    }
  });

  // Create buttons from template actions
  const buttons = template.actions.map((action: any) =>
    new ButtonBuilder()
      .setCustomId(`${template.id || 'unknown'}:${action.id}`)
      .setLabel(action.label)
      .setStyle(ButtonStyle.Primary)
  );

  return {
    embed,
    components: buttons.length > 0 ? [new ActionRowBuilder().addComponents(buttons)] : []
  };
}

// Complete Discord flow
async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
  if (interaction.commandName === 'explore') {
    const userId = interaction.user.id;
    const { template, content } = await startRandomEncounter(userId);
    const discordMessage = createDiscordEmbed(template, content);

    await interaction.reply(discordMessage);
  }
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const buttonId = interaction.customId;

  const discordMessage = await handleActionClick(userId, buttonId);
  await interaction.update(discordMessage);
}
```

## Key Framework Benefits

 **Typed Navigation** - Compile-time validation of all routing paths
 **Mixed Execution** - Actions can be direct routes OR Convex functions
 **Array-Based Actions** - Simple arrays instead of complex Record types eliminate `Partial` complexity
 **Required Labels** - TypeScript enforces that every action has a label (no defensive fallbacks needed)
 **Clear Intent** - Empty array `[]` clearly indicates terminal templates
 **Simple Operations** - `.map()` and `.find()` instead of `Object.entries()` complexity
 **Platform Agnostic** - Same template sets work on Discord, web, mobile
 **Zero State Management** - Templates are stateless, data loads fresh
 **Encounter Isolation** - Each template set is completely self-contained
 **Developer Experience** - Full TypeScript safety with simple validation
 **Rapid Development** - New encounters are just template set definitions

## Building New Features

1. **Create Types File**: Define enums for all template and action IDs in `features/{feature}/types.ts`
2. **Implement Functions**: Backend logic with typed enum return values in `features/{feature}/functions.ts` (imports from `./types`)
3. **Create Feature Template Set**: Use enums as object keys for direct access in `features/{feature}/templates.ts` (imports from `./types`)
4. **Add to Engine**: Import feature and add template ID check to `getTemplateFromFeature`

**Important**: The `types.ts` file prevents circular imports by keeping enums separate from both `functions.ts` and `templates.ts`.

**Result**: A bulletproof feature framework where all navigation is type-safe, references are validated at compile-time, and new features are trivial to build.