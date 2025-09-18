# Thunderclap Quest - AI Developer Context

## Technology Stack

**Backend**: Convex (serverless database + functions) with Zod validation
**Frontend**: Discord.js bot + Next.js web app
**Monorepo**: Turborepo with PNPM workspaces
**Testing**: Vitest + convex-test
**Types**: TypeScript with Zod as single source of truth (schemas define database tables)

## Repository Structure

```
apps/
├── convex/              # Backend (database, functions, game logic)
│   ├── convex/
│   │   ├── features/    # Vertical slice features
│   │   ├── engine/      # Template engine core
│   │   ├── helpers/     # Shared business logic
│   │   ├── models/      # Data access layer
│   │   └── schema.ts    # Database schema aggregation
│   └── tests/           # Backend tests
├── discord-bot/         # Discord.js application (thin UI layer)
└── web/                # Next.js web interface
```

## Essential Commands

```bash
# Development
pnpm install                    # Install all dependencies
pnpm dev                       # Start all apps in development
pnpm --filter convex-backend dev    # Convex backend only
pnpm --filter discord-bot dev       # Discord bot only

# Testing & Quality
pnpm test                      # Run all tests
pnpm --filter convex-backend test   # Backend tests only
pnpm type-check                # TypeScript validation
pnpm build                     # Build all apps
pnpm clean                     # Clean build artifacts

# Convex Specific
cd apps/convex && npx convex dev      # Convex dev server
cd apps/convex && npx convex deploy   # Deploy to Convex
```

## Core Architecture Patterns

### Schema-First Database Design
Zod schemas define database tables and provide type safety:
```typescript
// features/profile/schema.ts
export const PlayerSchema = z.object({
  userId: z.string(),           // Discord ID (primary key)
  displayName: z.string(),      // Cached Discord username
  xp: z.number().default(0),    // Experience points
  level: z.number().default(1), // Current level
  titles: z.array(z.string()).default([]),
  createdAt: z.number(),
  lastActive: z.number(),
});

// Root schema.ts aggregates all feature schemas
export default defineSchema({
  players: defineTable(zodOutputToConvex(PlayerSchema))
    .index("userId", ["userId"]),
  // ... other tables
});
```

### Vertical Slice Features
Each feature is self-contained with all related code:
```
features/{feature}/
├── types.ts       # Template/Action ID enums (NO IMPORTS)
├── schema.ts      # Zod data models
├── functions.ts   # Convex functions + helpers (imports from ./types)
├── templates.ts   # Engine templates (imports from ./types)
└── index.ts       # Public exports
```

### Template Engine Pattern
**Core Concept**: Universal encounter system that works across platforms.

```typescript
// 1. Define IDs in types.ts (prevents circular imports)
export enum SocialTemplateId {
  JOKESTER_ENCOUNTER = "JOKESTER_ENCOUNTER"
}
export enum SocialActionId {
  LAUGH_AT_JOKE = "LAUGH_AT_JOKE"
}

// 2. Create template in templates.ts
[SocialTemplateId.JOKESTER_ENCOUNTER]: {
  content: { title: "🎭 A Jokester", description: "..." },
  actions: [
    {
      id: SocialActionId.LAUGH_AT_JOKE,
      label: "Laugh Heartily",
      execute: laughAtJokeHelper
    }
  ]
}

// 3. Implement helper in functions.ts
export async function laughAtJokeHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 15, "social.laugh");
  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards: [{ icon: "✨", amount: xpResult.xpAwarded, name: "Experience" }] }
  };
}
```

### Helper Function Pattern
**Critical**: Use helper functions to avoid Convex function-calling-function warnings.

```typescript
// ✅ CORRECT: Helper functions (no ctx.runMutation calls)
export async function awardXPHelper(ctx: any, userId: string, amount: number, source: string) {
  // Direct database operations only
  const player = await ctx.db.query("players").filter(q => q.eq("userId", userId)).first();
  // ... business logic
}

// ❌ WRONG: Don't call Convex functions from within Convex functions
export const badFunction = mutation({
  handler: async (ctx, args) => {
    await ctx.runMutation(api.other.function, {}); // This fails
  }
});
```

### Smart Reward System
Award system uses smart helpers that prevent duplicates and apply game mechanics:

```typescript
// Smart helpers return actual results (not requested amounts)
const xpResult = await awardXPHelper(ctx, userId, 15, "source");
// Returns: { xpAwarded: 27, newLevel: 5, levelUp: true } (includes catch-up multipliers)

const titleAwarded = await awardTitleHelper(ctx, userId, "Good Sport");
// Returns: true (newly awarded) or false (already had title)

// Build rewards array - only show what was actually earned
const rewards = [
  { icon: "✨", amount: xpResult.xpAwarded, name: "Experience" }
];

// Only include title if it was newly awarded (no duplicates in UI)
if (titleAwarded) {
  rewards.push({ icon: "🏆", amount: 1, name: "Good Sport" });
}

return {
  nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
  rewards: { rewards }
};
```

### Action Result Pattern
All action helpers return standardized result:
```typescript
interface ActionResult {
  nextTemplateId: string | null;  // Where to go next (null = complete)
  rewards?: RewardBundle;         // What player earned (auto-displayed in Discord)
}
```

## Testing Framework

### Setup Pattern
```typescript
import { convexTest } from "convex-test";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";

const t = convexTest(schema);
```

### Test Pattern
```typescript
test("action awards XP correctly", async () => {
  // Setup
  await t.mutation(api.profile.functions.createPlayer, {
    userId: "test-user",
    displayName: "Test Player"
  });

  // Execute
  const result = await t.mutation(api.social.functions.laughAtJoke, {
    userId: "test-user"
  });

  // Verify
  expect(result.nextTemplateId).toBe("SOCIAL_SUCCESS");
  expect(result.rewards.rewards).toHaveLength(1);
  expect(result.rewards.rewards[0].icon).toBe("✨");
});
```

### Testing Rules
1. **Never use `ctx.runMutation()` inside `t.run()` callbacks** - Use helpers directly
2. **Always create test players first** - Most functions require existing player
3. **Test both success and failure paths** - Ensure error handling works
4. **Use helper functions in tests** - Same pattern as production code

## Key Development Flows

### Adding New Feature
1. Create `features/{name}/` directory
2. Define enums in `types.ts` (no imports)
3. Create Zod schemas in `schema.ts`
4. Implement helpers in `functions.ts` (import from `./types`)
5. Create templates in `templates.ts` (import from `./types`)
6. Export in `index.ts`
7. Add to root `schema.ts`
8. Write tests

### Adding New Encounter
1. Add template ID to `features/{type}/types.ts`
2. Add action IDs to same file
3. Create template in `features/{type}/templates.ts`
4. Implement action helpers in `features/{type}/functions.ts`
5. Test the actions

### Debugging Issues
1. Check TypeScript errors first (`pnpm type-check`)
2. Run tests (`pnpm test`)
3. Check Convex dev server logs
4. Verify imports follow circular import prevention rules

## Critical Rules

### Circular Import Prevention
- **ALWAYS** import enums from `./types` in both `functions.ts` and `templates.ts`
- **NEVER** import functions into templates or vice versa
- Types file should have NO imports from other feature files

### Convex Best Practices
- Use helper functions for business logic
- Never call Convex functions from within Convex functions
- All mutations should be idempotent when possible
- Use Zod validation for all function arguments

### File Organization
- Keep related code together in vertical slices
- Schema aggregation in root `schema.ts`
- Shared utilities in `helpers/` directory
- Tests mirror source structure

### Discord Integration
**Core Concept**: Templates automatically render as Discord embeds + buttons. Bot acts as thin UI layer.

#### Content Rendering
Templates automatically become Discord embeds via content renderers:
```typescript
// apps/discord-bot/src/core/contentRenderers.ts
const contentRenderers = {
  PROFILE_DISPLAY: (content) => new EmbedBuilder()
    .setTitle(`${content.displayName}'s Profile`)
    .addFields(
      { name: '⚡ Level', value: `${content.level}`, inline: true },
      { name: '✨ XP', value: `${content.xp}`, inline: true }
    ),

  SOCIAL_ENCOUNTER: (content) => new EmbedBuilder()
    .setTitle(content.title)
    .setDescription(content.description)
    .addFields({ name: content.character.name, value: content.dialogue })
};
```

#### Button Actions
Template actions become Discord buttons automatically:
```typescript
// Actions array in template → Discord buttons
actions: [
  { id: "LAUGH", label: "Laugh Heartily", execute: helper }
]
// Becomes: Button with customId "TEMPLATE_ID:LAUGH:USER_ID"
```

#### Adding New Commands
1. **Create command file**: `apps/discord-bot/src/commands/{command}.ts`
```typescript
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your character profile');

export async function execute(interaction) {
  const userId = interaction.user.id;
  // Call template engine
  const response = await executeDiscordTemplate('PROFILE_DISPLAY', userId, interaction);
  await interaction.reply(response);
}
```

2. **Register command**: Add to `apps/discord-bot/src/commands/index.ts`
3. **Deploy commands**: `cd apps/discord-bot && npm run deploy-commands`

#### Universal Template Executor
All commands use the same executor:
```typescript
// apps/discord-bot/src/core/templateExecutor.ts
export async function executeDiscordTemplate(templateId: string, userId: string, interaction) {
  // 1. Execute template via Convex
  const result = await convex.query(api.engine.core.executeTemplate, { templateId, userId });

  // 2. Render content as Discord embed
  const embed = await renderTemplateContent(result.content, templateId);

  // 3. Convert actions to Discord buttons
  const components = renderTemplateActions(result.actions, templateId, userId);

  return { embeds: [embed], components: components.length > 0 ? [components] : [] };
}
```

#### UI Control Rules
- **Embed structure**: Controlled by content renderers, not templates
- **Button layout**: Automatic from template actions array
- **Error handling**: Graceful fallbacks for missing renderers
- **User validation**: Button interactions validate user ownership

This context provides everything needed to understand the architecture, contribute effectively, and maintain consistency with existing patterns.