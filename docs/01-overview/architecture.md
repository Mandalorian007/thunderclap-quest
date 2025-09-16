# Discord RPG Bot - Technical Architecture

## Tech Stack Overview

### Monorepo Structure (Turborepo)
- **`apps/web`** - Next.js 14+ web application (Vercel hosted with webhook endpoints)
- **`apps/discord-bot`** - Discord.js bot application (command-focused, no event handling)
- **`apps/convex`** - Convex backend functions, schema, and shared logic

### Core Technologies
- **Turborepo** - Monorepo build system and task orchestration
- **Next.js 14+** - Full-stack React framework for web interface
- **Clerk** - Authentication with Discord OAuth integration
- **Convex** - Real-time database and serverless functions
- **Discord.js** - Bot framework for Discord interactions

## Architecture Philosophy

**Unified Identity System**: Discord ID serves as the primary user identifier across all platforms (bot, web), enabling seamless cross-platform experiences.

**Dual Interface Strategy**:
- Discord bot for core gameplay and immediate engagement
- Web application for enhanced features and management

## System Components

### 1. Discord Bot Layer (Discord.js Frontend)
**Purpose**: Primary gameplay interface - thin client layer
- Slash commands (`/explore`, `/profile`, `/inventory`, `/quests`)
- Interactive buttons and embeds
- UI presentation and user interaction handling
- All business logic delegated to Convex functions via Discord ID

### 2. Web Application (Next.js)
**Purpose**: Extended features and management
- **Player Dashboard**: Enhanced profile, detailed stats, achievement galleries
- **Leaderboards**: Server and global rankings, seasonal competitions  
- **Guild Management**: Server admin tools
- **Social Features**: Adventure sharing, friend systems, guild coordination

### 3. Authentication Flow (Clerk + Discord)
**Purpose**: Unified identity across platforms

```
Discord User → Clerk Auth → Discord OAuth → Unified User Profile
    ↓
Discord ID becomes primary key for all data operations
    ↓
Same user data accessible via bot commands AND web interface
```

### 4. Database & Backend (Convex)
**Purpose**: Real-time data management and game logic

**Key Collections**:
- `players` - User profiles, progress, inventory
- `encounters` - Dynamic encounter definitions and outcomes
- `guilds` - Server-specific settings

**Convex Functions** (Core Business Logic):
- `explore()` - Generate random encounters for players
- `getPlayerData()` - Unified player data retrieval
- All game mechanics, data validation, and state management handled here


## Data Flow Architecture

### Core Command Flow
```
User `/explore` → Generate Random Encounter → Present Choices → Execute Action → Update Player Data
```

## Technical Benefits

### Development Advantages
- **Turborepo**: Unified codebase with independent deployments
- **Convex**: Real-time database with serverless functions handles all business logic
- **Command-Only Bot**: Simplified Discord.js frontend focused purely on UI interactions
- **Cross-Platform Identity**: Discord ID unifies user experience across bot and web

---

*This architecture enables rapid development of the MVP while providing a foundation for advanced features like leaderboards and cross-platform progression.*
