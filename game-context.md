# Thunderclap Quest - Game Context

## Core Game Vision
**Discord-native Action RPG** inspired by Path of Exile progression with whimsical storytelling. Players build characters through gear optimization, strategic stat allocation, and social progression while experiencing humorous encounters.

## Player Progression Systems

### Character Advancement
- **Experience Points** drive level progression with exponential scaling
- **Game Level** acts as server-wide progression benchmark, updated bi-weekly
- **Catch-up Mechanics** provide massive XP bonuses to players below game level
- **Prestige System** allows advancement beyond game level for status/competition
- **Achievement Titles** unlock through specific actions and choices, displayable as social status

### Stat & Combat System
- **6-Stat Framework**: Might, Focus, Sage (offensive) vs Armor, Evasion, Aegis (defensive)
- **Combat Triangle**: Each attack type targets specific defense (Might→Armor, Focus→Evasion, Sage→Aegis)
- **Build Variety**: Players specialize or balance across combat styles for different encounter effectiveness

### Combat Rating System
- **Formula**: `Player CR = Average of all equipped gear item levels`
- **Empty Slots**: Count as current game level (protects new players from huge penalties)
- **Calculation**: `(Sum of equipped gear CRs + (empty slots × game level)) ÷ 6 total slots`
- **Examples**:
  - All gear level 30 → Player CR = 30
  - 5 pieces level 30 + 1 empty (game level 25) → Player CR = (150 + 25) ÷ 6 = 29.2
  - New player: 1 level 10 weapon + 5 empty slots → Player CR = (10 + 125) ÷ 6 = 22.5
- **Encounter Scaling**: All encounters scale to game level, not player combat rating
- **Power Differential**: Player CR vs Game Level determines damage multipliers

## Gear & Equipment Economy

### Equipment System
- **6 Gear Slots**: Helm, Chest, Gloves, Legs, Main Hand, Offhand
- **Item Levels**: Determine base power and stat ranges
- **Rarity Tiers**: Common (1 stat), Magic (2 stats), Rare (3 stats)
- **6-Stat System**: Might/Focus/Sage (offensive) vs Armor/Evasion/Aegis (defensive)
- **Stat Rolling**: Random stats within level-appropriate ranges using formulas:
  - Max stat value = Item Level ÷ 2 (rounded down)
  - Gap percentage = 25% - (15% × √(Max) ÷ 32)
  - Min stat value = Max × (1 - Gap percentage)
  - Examples: Level 10 = +4 to +5, Level 100 = +40 to +50
- **Combat Rating**: Each item's itemLevel contributes to player CR calculation

### Item Economy
- **Gear** (equipable): Direct character power via stats and combat rating
- **Materials** (stackable): Ore, Essence, Components, Reagents for crafting systems
- **Items** (utility): Keys, Consumables, Currency, Trophies, Lore pieces
- **Salvage System**: Convert unwanted gear into materials for progression

### Salvage System
- **Gear Cleanup**: Convert unwanted equipment into materials via `/inventory` → Gear → Salvage All
- **Material Collection**: Ore, Essence, Components, Reagents for future crafting systems
- **Inventory Management**: Prevents gear hoarding through easy one-click disposal
- **Template Integration**: Uses existing engine for UI - salvage action stays on gear tab with inline rewards
- **Multi-Type Support**: Hybrid inventory system (equipped gear on player, unequipped in separate inventory table)

## Social & Community Systems

### Global Progression
- **Single Game Level**: One global game level affects all players across all servers
- **Community Milestones**: Game level increases create shared progression events
- **Social Recognition**: High-level players visible through profile display
- **Universal Identity**: Player data tied to Discord ID, works across all servers

### Achievement & Status
- **Title Collection**: Earned through encounter choices, combat victories, discovery actions
- **Public Display**: Current title shows in profile and occasionally in encounter text
- **Social Currency**: Titles and levels provide recognition and conversation starters
- **Completionist Goals**: Collecting all titles in each category drives long-term engagement

## Content & Encounter Framework

### Encounter Variety
- **Social**: Character interactions with dialogue trees and reputation consequences
- **Discovery**: Environmental exploration with magical/whimsical outcomes
- **Puzzle**: Logic challenges with multiple solution paths and graceful failure
- **Combat**: Strategic battles showcasing build effectiveness and tactical choice

**Design Goal**: Each type rewards different player preferences - social players, explorers, puzzle-solvers, and combat optimizers all find engaging content.

### Narrative Philosophy
- **Choice-Driven Stories**: Player decisions create unique narrative paths
- **Consequence Chains**: Actions affect future encounter availability and outcomes
- **Humorous Tone**: Entertainment and wonder prioritized over challenge or realism
- **Emergent Storytelling**: Combinations of choices create personalized adventure narratives

## Game Level & Pacing Control

### Bi-Weekly Progression Cycle
- **Automatic Increases**: Game level rises +10 every two weeks globally via Convex cron jobs
- **Cron Schedule**: `"0 0 */14 * *"` (every 14 days at midnight UTC)
- **Safety Checks**: Time validation prevents early increases, admin can disable auto-increases
- **Difficulty Scaling**: All encounters scale to game level baseline
- **Community Synchronization**: Ensures players share similar progression experiences

### Player Relationship to Game Level
- **Below Game Level**: Massive catch-up XP bonuses (up to 500%) for quick advancement
- **At Game Level**: Standard progression rates for current content participation
- **Above Game Level**: Reduced XP but prestigious status and early access to advanced builds

### Economic Implications
- **Gear Degradation Over Time**: As game level rises, fixed-level gear becomes relatively weaker
- **Power Loss Without Upgrades**: Old gear deals less damage and provides less protection over time
- **Forced Replacement Cycle**: Must find higher-level gear to maintain combat effectiveness
- **No Hard Obsolescence**: Old gear still functions, just becomes less effective
- **Material Value**: Salvage system provides value for replaced gear through material conversion

## Reward System & Visual Design

### Universal Reward Types
- **Experience** ✨ - Character progression with catch-up multipliers
- **Titles** 🏆 - Social status and achievement recognition
- **Gold** 🪙 - Currency for future economic systems
- **Items** 📦 - Gear, materials, and quest objects
- **Unlocks** 🗺️ - New areas, encounters, or story branches

### Reward Aesthetic
- **Emoji-Rich Display**: Visual celebration of every achievement
- **Smart Logic**: No duplicate rewards, scaled appropriate to player progression
- **Immediate Feedback**: Instant gratification for every player action
- **Always Positive**: Every encounter choice leads to meaningful rewards

## Discord-Native Design

### Core Interface
- **Slash Commands**: Primary gameplay through `/explore`, `/profile`, `/inventory`
- **Button Interactions**: All choices made via Discord button clicks
- **Embed Display**: Rich information through Discord embeds with emojis
- **Social Integration**: Adventures visible to server members, encouraging participation

## Design Philosophy

### Experience-Focused RPG Design
- **Player Fantasy**: Character optimization and social recognition drive engagement
- **Whimsical Wonder**: Studio Ghibli-inspired tone prioritizes delight over challenge
- **No Wrong Choices**: All paths lead to positive outcomes and meaningful progression
- **Social Currency**: Achievements and titles create conversation and community status
- **Accessibility**: Complex systems presented through intuitive Discord interactions

**Core Principle**: The game celebrates the joy of RPG character building and progression within a safe, welcoming, and entertaining environment.

## Core Design Principles

### Progression Philosophy
- **Always Rewarding**: Every encounter provides XP, often titles/items
- **No Wrong Choices**: All encounter options lead to positive outcomes
- **Catch-up Friendly**: XP bonuses help new players reach current content quickly
- **Social Recognition**: Titles and levels provide visible achievement status

### Player Engagement
- **Immediate Feedback**: Instant results from button clicks
- **Meaningful Choices**: Different options lead to genuinely different outcomes
- **Collection Goals**: Title gathering provides long-term objectives
- **Build Variety**: Multiple combat approaches for different encounter types

This framework defines a progression-focused RPG with accessible Discord interface, driven by character optimization and achievement collection.