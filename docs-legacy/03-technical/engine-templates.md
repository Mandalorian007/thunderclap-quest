# Engine Template Framework

## Core Concept

**Feature Template Sets are typed encounter flows** that define complete backend features with enum-based ID validation. Each feature template set defines:
- **Enum-based IDs**: Explicit enums for all template and action IDs
- **Direct object access**: No fragile lookups, compile-time validation
- **Typed routing**: Template and action references use enum values
- **Mixed execution**: Actions can be enum routes, helper functions, or null for completion

This creates a **100% backend-supported framework** where feature flows are completely type-safe and automatically validated.

## Architecture Update: Action Registry & Helper Functions

Following Convex best practices, the template engine now uses an **Action Registry + Helper Functions** approach to completely eliminate function-calling-function warnings:

- **Action Registry**: Global registry mapping action keys to helper functions
- **Helper Functions**: Pure business logic for all action execution
- **Model Layer**: Data access patterns with computed fields and validations
- **Template Helpers**: Specialized functions for template execution and content resolution
- **Engine Core**: Routes through action registry before falling back to direct calls

## Vertical Slice Organization

Each feature is organized as a complete vertical slice containing all related code:

```
convex/
├── features/               # Feature-based vertical slices
│   ├── profile/           # Player profile feature
│   │   ├── types.ts       # Template/action ID enums
│   │   ├── schema.ts      # Player data schemas
│   │   ├── functions.ts   # Profile queries/mutations (delegates to helpers)
│   │   ├── templates.ts   # Profile template definitions
│   │   └── index.ts       # Feature exports
│   └── social/            # Social encounter feature
│       ├── types.ts       # Template/action ID enums
│       ├── schema.ts      # Social data schemas
│       ├── functions.ts   # Social logic (delegates to helpers)
│       ├── templates.ts   # Social templates
│       └── index.ts
├── models/                # Model layer - data access + business logic
│   ├── playerModel.ts     # Player data access, computed fields, operations
│   └── gameModel.ts       # Game state data access and operations
├── helpers/               # Helper functions - pure business logic
│   ├── actionRegistry.ts      # Action helper registration and lookup
│   ├── progressionHelpers.ts  # XP calculations, level math
│   ├── gameLevelHelpers.ts    # Game level management
│   └── templateHelpers.ts     # Template execution logic
├── engine/                # Core template framework
│   ├── types.ts           # Core template type definitions
│   └── core.ts            # Engine functions (delegates to helpers)
└── shared/                # Shared utilities and types
    └── rewards.ts         # Reward system types and helpers
```

**Benefits of the New Architecture:**
- **Cohesion**: Related code lives together in logical groupings
- **Independence**: Features can evolve without affecting others
- **No Function-Calling-Function**: Eliminates Convex warnings by using helper functions
- **Testability**: Pure helper functions are easy to unit test
- **Maintainability**: Clear separation between data access, business logic, and API layer
- **Scalability**: Add new features without structural overhead

## Action Registry Pattern

The Action Registry completely eliminates Convex function-calling-function warnings by routing all template actions through registered helper functions.

### Action Registry (`helpers/actionRegistry.ts`)
Global registry for mapping action keys to helper functions:

```typescript
// Global action registry
const actionRegistry = new Map<string, ActionHelperFunction>();

// Register an action helper function
export function registerActionHelper(actionId: string, helperFunction: ActionHelperFunction): void {
  actionRegistry.set(actionId, helperFunction);
}

// Get an action helper function
export function getActionHelper(actionId: string): ActionHelperFunction {
  const helper = actionRegistry.get(actionId);
  if (!helper) {
    throw new Error(`Action helper not found for: ${actionId}`);
  }
  return helper;
}

// Check if action exists
export function hasActionHelper(actionId: string): boolean {
  return actionRegistry.has(actionId);
}
```

### Feature Action Registration
Each feature registers its action helpers using template.action naming:

```typescript
// features/puzzle/functions.ts
import { registerActionHelper } from "../../helpers/actionRegistry";

// Helper function for action execution
export async function answerWormHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 25, "puzzle.answerWorm");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Clever");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Clever" });
  }

  return {
    nextTemplateId: PuzzleTemplateId.PUZZLE_SUCCESS,
    rewards: { rewards }
  };
}

// Register action helper with template.action key
registerActionHelper("PICKY_MAGIC_DOOR.ANSWER_WORM", answerWormHelper);
```

### Template Action Execution
Templates reference helper functions directly, and the engine routes through the registry:

```typescript
// features/puzzle/templates.ts
export const puzzleFeatureTemplateSet: FeatureTemplateSet<PuzzleTemplateId, PuzzleActionId> = {
  startTemplate: PuzzleTemplateId.PICKY_MAGIC_DOOR,
  templates: {
    [PuzzleTemplateId.PICKY_MAGIC_DOOR]: {
      content: { /* template content */ },
      actions: [
        {
          id: PuzzleActionId.ANSWER_WORM,
          label: "Answer: Worm",
          execute: answerWormHelper  // Direct helper function reference
        }
      ]
    }
  }
};
```

### Engine Core Routing
The template engine checks the action registry first, then falls back to direct calls:

```typescript
// helpers/templateHelpers.ts
export async function executeTemplateAction(
  ctx: MutationCtx,
  templateId: string,
  actionId: string,
  userId: string
): Promise<ActionExecutionResult> {
  const template = getTemplateFromRegistry(templateId);
  const action = template.actions.find(a => a.id === actionId);

  if (typeof action.execute === 'string') {
    // Static routing - return the template ID
    return { nextTemplateId: action.execute };
  } else if (action.execute === null) {
    // Explicit completion
    return { isComplete: true };
  } else {
    // Check action registry first
    const actionKey = `${templateId}.${actionId}`;
    if (hasActionHelper(actionKey)) {
      const helperFunction = getActionHelper(actionKey);
      const result = await helperFunction(ctx, { userId });

      return {
        nextTemplateId: result.nextTemplateId || undefined,
        isComplete: !result.nextTemplateId,
        rewards: result.rewards
      };
    }

    // Fallback to direct function call (for migration support)
    const result = await action.execute(ctx, { userId });
    // ... handle result
  }
}
```

## Helper Functions & Model Layer Pattern

### Model Layer (`models/`)
Contains data access patterns with computed fields and business logic:

```typescript
// models/playerModel.ts
import { QueryCtx, MutationCtx } from "../_generated/server";

// Data access with computed fields
export async function getPlayerWithStats(ctx: QueryCtx | MutationCtx, userId: string) {
  const player = await getPlayerByUserId(ctx, userId);
  const gameLevel = await getCurrentGameLevelHelper(ctx);

  return {
    ...player,
    calculatedLevel: calculatePlayerLevel(player.xp),
    xpMultiplier: getXPMultiplier(calculatedLevel, gameLevel),
    // ... other computed fields
  };
}

// Business operations
export async function updatePlayerXP(ctx: MutationCtx, userId: string, xpAmount: number) {
  // Business logic here using helper functions
  return result;
}
```

### Helper Functions (`helpers/`)
Pure functions with no database context dependencies:

```typescript
// helpers/progressionHelpers.ts
export function calculatePlayerLevel(totalXP: number): number {
  // Pure calculation logic
}

export function getXPMultiplier(playerLevel: number, gameLevel: number): number {
  // Pure business logic
}
```

### Template Helpers (`helpers/templateHelpers.ts`)
Specialized helpers for template execution:

```typescript
export async function executeTemplateAction(
  ctx: MutationCtx,
  templateId: string,
  actionId: string,
  userId: string
): Promise<ActionExecutionResult> {
  // Template execution logic using model layer
}
```

### Convex Functions (Thin API Layer)
Feature functions delegate to helpers and model layer:

```typescript
// features/profile/functions.ts
export const getPlayerProfileContent = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    const playerWithStats = await getPlayerWithStats(ctx, userId);
    return formatProfileContent(playerWithStats);
  }
});
```

## Feature Template Set Definition

```typescript
import type { FunctionReference, RegisteredMutation } from "convex/server";
import type { ActionResult } from "../../shared/rewards";

export type TemplateActionFunction = RegisteredMutation<"public", { userId: string }, Promise<string | null | ActionResult>>;

export type EngineAction<TTemplateIds, TActionIds> = {
  id: TActionIds;
  label: string;
  execute: TTemplateIds | string | null | ActionHelperFunction; // Now supports: template routing, action ID routing, completion, or helper function
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
          execute: examineChestHelper
        },
        {
          id: ChestActionId.FORCE_OPEN,
          label: "Force Open",
          execute: forceOpenChestHelper
        },
        {
          id: ChestActionId.LEAVE,
          label: "Walk Away",
          execute: null // null = encounter complete
        }
      ]
    },

    [ChestTemplateId.CHEST_EXAMINED]: {
      content: getExamineResultsHelper,
      actions: [
        {
          id: ChestActionId.DISARM,
          label: "Disarm Trap",
          execute: disarmTrapHelper
        },
        {
          id: ChestActionId.TRIGGER,
          label: "Trigger Trap",
          execute: triggerTrapHelper
        },
        {
          id: ChestActionId.STEP_BACK,
          label: "Step Back",
          execute: ChestTemplateId.MYSTERIOUS_CHEST // Direct enum reference
        }
      ]
    },

    [ChestTemplateId.LOOT_SELECTION]: {
      content: getLootOptionsHelper,
      actions: [
        {
          id: ChestActionId.TAKE_ITEM,
          label: "Take Item",
          execute: takeSpecificItemHelper
        },
        {
          id: ChestActionId.TAKE_COINS,
          label: "Take Coins",
          execute: takeCoinsHelper
        },
        {
          id: ChestActionId.TAKE_ALL,
          label: "Take Everything",
          execute: takeAllItemsHelper
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

## Reward System Integration

**Global Reward Structure** (`shared/rewards.ts`):
```typescript
// Core reward interfaces
export interface RewardEntry {
  icon: string;      // Emoji for visual display
  amount: number;    // Quantity earned (always positive)
  name: string;      // Human-readable name
}

export interface RewardBundle {
  rewards: RewardEntry[];
}

export interface ActionResult {
  nextTemplateId: string | null;
  rewards?: RewardBundle;
}

// Reward type constants - referenceable like XP_REWARD.icon
export const XP_REWARD = { icon: "✨", name: "Experience" } as const;
export const TITLE_REWARD = { icon: "🏆", name: "Title" } as const;
export const GOLD_REWARD = { icon: "🪙", name: "Gold" } as const;
export const ITEM_REWARD = { icon: "📦", name: "Item" } as const;

// Universal reward formatter
export function formatRewardBundle(bundle: RewardBundle): string {
  return bundle.rewards
    .map(reward => `${reward.icon} +${reward.amount} ${reward.name}`)
    .join('\n');
}
```

**Smart Helper Functions** (progression system):
```typescript
// Smart XP helper - returns actual XP awarded (with multipliers applied)
export async function awardXPHelper(ctx: any, userId: string, xpAmount: number, source: string): Promise<{ xpAwarded: number; /* ... */ }>

// Smart title helper - returns true only if title was newly awarded, false if already had it
export async function awardTitleHelper(ctx: any, userId: string, title: string): Promise<boolean>
```

**Action Functions with Rewards**:
```typescript
import { ActionResult, XP_REWARD, TITLE_REWARD } from "../../shared/rewards";

export const examineChest = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    // Award XP and check for new title
    const xpResult = await awardXPHelper(ctx, userId, 10, "chest.examine");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Keen Observer");

    // Build rewards array
    const rewards = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    // Only include title if it was actually newly awarded
    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Keen Observer" });
    }

    return {
      nextTemplateId: ChestTemplateId.CHEST_EXAMINED,
      rewards: { rewards }
    };
  }
});
```

**Player Experience**:
```
First time examining chest:
🎁 Rewards Earned
✨ +18 Experience
🏆 +1 Keen Observer

Second time examining (same action):
🎁 Rewards Earned
✨ +18 Experience
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
2. **Implement Helper Functions**: Create helper functions for all actions in `features/{feature}/functions.ts` (imports from `./types`)
3. **Register Action Helpers**: Register all helpers with `template.action` keys using `registerActionHelper()`
4. **Create Feature Template Set**: Use enums as object keys and reference helper functions in `features/{feature}/templates.ts` (imports from `./types`)
5. **Add to Engine**: Import feature template set in `engine/core.ts` and register it
6. **Import Functions**: Add import for functions file in `engine/core.ts` to trigger action registrations

**Important**: The `types.ts` file prevents circular imports by keeping enums separate from both `functions.ts` and `templates.ts`.

**Result**: A bulletproof feature framework where all navigation is type-safe, references are validated at compile-time, and new features are trivial to build.