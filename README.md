# ⚔️✨ Thunderclap Quest

A Discord RPG blending Path of Exile-style progression with whimsical encounters. Level up by debating butterflies, solving magic door riddles, and trading gossip with mysterious merchants!

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development (all apps)
pnpm dev

# Run tests
pnpm test

# Build all apps
pnpm build

# Type check all apps
pnpm type-check
```

## Turborepo Commands

This project uses Turborepo for efficient monorepo management:

```bash
# Run a specific app in development
pnpm --filter convex-backend dev
pnpm --filter discord-bot dev
pnpm --filter web dev

# Build specific apps
pnpm --filter convex-backend build
pnpm --filter discord-bot build
pnpm --filter web build

# Run tests for specific apps
pnpm --filter convex-backend test

# Clean all build artifacts
pnpm clean
```

## Monorepo Structure

```
apps/
├── convex/          # Convex backend (database, functions & schemas)
├── discord-bot/     # Discord.js bot application
└── web/            # Next.js web interface
```

## Project Overview

Thunderclap Quest is a Discord-native action RPG experience featuring:
- **Progressive leveling** with exponential XP curves and catch-up mechanics
- **Loot systems** inspired by Path of Exile and Diablo
- **Strategic combat encounters** with meaningful character progression
- **Whimsical storytelling** that blends humor with traditional RPG mechanics
- **Cross-platform progression** between Discord bot and web interface

## Architecture

- **Turborepo monorepo** with Discord bot, web app, and Convex backend
- **Discord ID as universal identity** across all platforms
- **Template-based encounter engine** for rapid content development
- **Paragon-style progression** with catch-up mechanics

## Documentation

📖 **[Complete Design Documentation](docs/01-overview/README.md)**

### Quick Navigation
- [Architecture Overview](docs/01-overview/architecture.md)
- [Player & Progression System](docs/02-game-design/player-system.md)
- [Combat & Gear System](docs/02-game-design/gear-and-stats.md)
- [Template Engine Framework](docs/03-technical/engine-templates.md)

## Development Status

🚧 **Implementation Phase** - Turborepo structure complete, building core engine

## Core Game Loop

```
/explore → Interactive Encounter → Player Choice → Consequence → Reward/Story
```

Players engage through Discord slash commands, make meaningful choices via interactive buttons, and experience immediate consequences that drive natural curiosity for the next encounter.