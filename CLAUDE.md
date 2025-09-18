# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Thunderclap Quest is a Discord RPG bot delivering lightweight, choice-driven adventures through interactive encounters. Built as a Turborepo monorepo with three main applications:

- **`apps/convex/`** - Convex backend with database functions, schemas, and business logic
- **`apps/discord-bot/`** - Discord.js bot application for slash commands and interactions
- **`apps/web/`** - Next.js web interface for enhanced features and management

## Essential Commands

### Development Environment
```bash
# Install dependencies (uses pnpm@10.14.0)
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific apps
pnpm --filter convex-backend dev    # Convex backend only
pnpm --filter discord-bot dev       # Discord bot only
pnpm --filter web dev               # Web app only
```

### Testing & Quality
```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter convex-backend test

# Type checking
pnpm type-check

# Lint (depends on build)
pnpm lint

# Build all apps
pnpm build

# Clean build artifacts
pnpm clean
```

### Convex Backend Operations
```bash
# Deploy to Convex (from apps/convex/)
cd apps/convex && npx convex deploy

# Run Convex dev server
cd apps/convex && npx convex dev
```

### Discord Bot Operations
```bash
# Deploy Discord commands to test server (from apps/discord-bot/)
cd apps/discord-bot && npm run deploy-commands

# Start Discord bot in development
cd apps/discord-bot && npm run dev
```

## Core Architecture Patterns

### Engine Template Framework
The project uses a sophisticated template-based encounter system with these key patterns:

**Vertical Slice Organization**: Each feature is self-contained in `apps/convex/convex/features/{feature}/`:
```
features/profile/
├── types.ts        # Template/action ID enums (prevents circular imports)
├── schema.ts       # Data models using Zod
├── functions.ts    # Convex queries/mutations (imports from ./types)
├── templates.ts    # Template definitions (imports from ./types)
└── index.ts        # Feature exports
```

**Template Engine Pattern**:
- **Template IDs** and **Action IDs** are defined as enums in `types.ts`
- **Functions** import enums from `./types` to prevent circular dependencies
- **Templates** import enums from `./types` and define encounter flows
- **Actions** can return enum values (for routing) or null (for completion)

### Discord Integration
Discord bot acts as a thin client layer:
- Commands in `apps/discord-bot/src/commands/`
- Universal template executor in `apps/discord-bot/src/core/templateExecutor.ts`
- Content rendering in `apps/discord-bot/src/core/contentRenderers.ts`
- Structure-based content detection (profile vs character vs environment)

### Data Layer
- **Unified Identity**: Discord ID as primary key across all platforms
- **Convex Functions**: All business logic in backend functions
- **Zod Validation**: Type-safe data with runtime validation using convex-helpers
- **Feature-Based Schema**: Each feature manages its own data models

## Available MCP Servers

The repository is configured with several MCP servers available for development:
- **convex**: Direct Convex backend integration for data/function operations
- **playwright**: Browser automation for testing web interfaces
- **perplexity-ask**: AI-powered research and question answering
- **firecrawl-mcp**: Web scraping and content extraction
- **youtube-data**: YouTube API integration for content analysis
- **reddit**: Reddit API integration for community data

Access these via MCP tools when working with external APIs or testing.

## Testing Architecture

Comprehensive test suite using Vitest with convex-test:
- **Unit Tests**: Individual function testing in `tests/features/{feature}/functions.test.ts`
- **Integration Tests**: Complete workflows in `tests/features/{feature}/integration.test.ts`
- **Engine Tests**: Core template system in `tests/engine/core.test.ts`
- **Test Utilities**: Shared helpers in `tests/helpers/test-utils.ts`

Run `pnpm test` from `apps/convex/` for backend tests.

## Key Implementation Notes

### Circular Import Prevention
The `types.ts` pattern is critical - always import enums from `./types` in both `functions.ts` and `templates.ts` to avoid circular dependencies that cause action execution failures.

### Content Structure Detection
Discord rendering automatically detects content structure:
- **Profile content**: Has `displayName` and `level` fields
- **Character encounters**: Has `character` and `dialogue` fields
- **Discovery encounters**: Has `environment` field
- **Outcomes**: Uses appropriate terminal templates

### Testing Framework Rules
**CRITICAL**: Never use `ctx.runMutation()` or `ctx.runQuery()` inside `t.run()` callbacks - convex-test prohibits Convex functions calling other Convex functions.

**✅ CORRECT**:
```typescript
await t.run(async (ctx) => {
  // Use helper functions directly
  await equipGearHelper(ctx, userId, gearId);
});

// OR call from outside the context
await t.mutation(api.inventory.functions.equipGear, { ... });
```

**❌ WRONG**:
```typescript
await t.run(async (ctx) => {
  // This ALWAYS fails
  await ctx.runMutation(api.inventory.functions.equipGear, { ... });
});
```

### Custom Commands
Use the `/load-context` command to systematically review complete project documentation when starting work on new features.

## Documentation Structure

**Essential Context**:
- **`docs/01-game-context.md`** - Complete game design, mechanics, and progression systems
- **`docs/02-developer-guide.md`** - Technical implementation guide and architecture patterns
- **`docs/03-roadmap.md`** - Development progress tracker and implementation priorities

Refer to these files when implementing features or understanding existing systems. These contain all the core information needed to work effectively with this codebase.