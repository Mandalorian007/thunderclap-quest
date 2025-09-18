# Authentication System - Discord ID Unity

## Core Principle: Discord ID as Universal Identity

**Discord ID is the foundational identifier** that enables seamless cross-platform user experiences in Thunderclap Quest. This single identifier connects Discord bot interactions, web authentication, and database operations into a unified system.

### Why Discord ID Matters

- **Cross-Platform Continuity**: Players can switch between Discord commands and web interface without losing progress
- **Simplified Database Design**: One user identifier across all systems eliminates complex identity mapping
- **Discord-Native Experience**: Users don't need separate accounts - their Discord identity IS their game identity

## Getting Discord ID: Two Platforms, Same Result

### Discord.js Bot - Getting Discord ID

```typescript
import { ChatInputCommandInteraction, ButtonInteraction } from 'discord.js'

// From slash command interactions
function handleSlashCommand(interaction: ChatInputCommandInteraction) {
  const discordId = interaction.user.id

  // Use this Discord ID for all database operations
  console.log('Discord ID from bot:', discordId)
}

// From button interactions
function handleButtonClick(interaction: ButtonInteraction) {
  const discordId = interaction.user.id

  // Same Discord ID, same database operations
  console.log('Discord ID from button:', discordId)
}
```

### Next.js + Clerk - Getting Discord ID

```typescript
import { currentUser } from '@clerk/nextjs'

// Server-side (API routes, server components, server actions)
export async function getDiscordId() {
  const user = await currentUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Find the Discord account in external accounts
  const discordAccount = user.externalAccounts.find(
    account => account.provider === 'oauth_discord'
  )

  if (!discordAccount) {
    throw new Error('Discord account not connected')
  }

  const discordId = discordAccount.externalId

  // This is the SAME Discord ID as the bot gets
  console.log('Discord ID from web:', discordId)

  return discordId
}
```

## Key Points

1. **Discord.js**: `interaction.user.id` gives you the Discord ID directly
2. **Clerk**: `user.externalAccounts.find(account => account.provider === 'oauth_discord').externalId` gives you the same Discord ID
3. **Result**: Both platforms provide the identical Discord ID for the same user

This simple pattern ensures perfect identity unity across your Discord bot and web application.