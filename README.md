# Thunderclap Quest

A Discord RPG bot that delivers lightweight, choice-driven adventures through interactive encounters.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development (all apps)
pnpm dev

# Run tests
pnpm test
```

## Monorepo Structure

```
apps/
├── convex/          # Convex backend (database, functions & schemas)
├── discord-bot/     # Discord.js bot application
└── web/            # Next.js web interface
```

## Project Overview

Thunderclap Quest is a Discord-native RPG experience focused on:
- **Meaningful player choices** in every encounter
- **Immediate engagement** with rich flavor text and contextual options
- **Cross-platform progression** between Discord bot and web interface
- **Type-safe encounter system** using advanced template frameworks

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