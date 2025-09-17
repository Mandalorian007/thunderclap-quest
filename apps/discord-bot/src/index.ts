import { Client, GatewayIntentBits } from 'discord.js';
import { ConvexHttpClient } from 'convex/browser';
import dotenv from 'dotenv';
import path from 'path';
import { loadCommands } from './handlers/commandHandler';
import { setupInteractionHandlers } from './handlers/interactionHandler';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CONVEX_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

// Attach Convex client to Discord client for command access
(client as any).convex = convex;

// Load commands and setup interaction handlers
loadCommands(client);
setupInteractionHandlers(client);

// Bot ready event
client.once('clientReady', () => {
  console.log(`🚀 Thunderclap Quest bot logged in as ${client.user?.tag}`);
  console.log(`🎮 Template engine integration active`);
  console.log(`🔗 Connected to Convex: ${process.env.CONVEX_URL}`);
});

// Enhanced error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});