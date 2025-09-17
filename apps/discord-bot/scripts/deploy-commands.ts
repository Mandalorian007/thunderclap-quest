import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const commands = [];
const commandsPath = path.join(__dirname, '../src/commands');

// Check if commands directory exists
if (!fs.existsSync(commandsPath)) {
  console.error('❌ Commands directory not found:', commandsPath);
  process.exit(1);
}

// Load all command files
const commandFiles = fs.readdirSync(commandsPath).filter(file =>
  file.endsWith('.ts') || file.endsWith('.js')
);

console.log(`📦 Loading ${commandFiles.length} command file(s)...`);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Command at ${filePath} is missing required "data" or "execute" property.`);
    }
  } catch (error) {
    console.error(`❌ Error loading command ${file}:`, error);
  }
}

// Create REST instance and deploy commands
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    let data: any;

    // Deploy to guild (development) or globally (production)
    if (process.env.DISCORD_GUILD_ID) {
      console.log(`🎯 Deploying to guild: ${process.env.DISCORD_GUILD_ID}`);
      data = await rest.put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID!,
          process.env.DISCORD_GUILD_ID!
        ),
        { body: commands }
      );
    } else {
      console.log('🌍 Deploying globally (may take up to 1 hour)');
      data = await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: commands }
      );
    }

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);

    // List deployed commands
    console.log('\n📋 Deployed commands:');
    for (const command of commands) {
      console.log(`  • /${command.name} - ${command.description}`);
    }

  } catch (error) {
    console.error('❌ Command deployment error:', error);
    process.exit(1);
  }
})();