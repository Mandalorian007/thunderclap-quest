import { Client, Collection } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Load all slash commands from the commands directory
 */
export function loadCommands(client: Client) {
  // Initialize commands collection
  (client as any).commands = new Collection();

  const commandsPath = path.join(__dirname, '../commands');

  if (!fs.existsSync(commandsPath)) {
    console.warn('Commands directory not found:', commandsPath);
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file =>
    file.endsWith('.ts') || file.endsWith('.js')
  );

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);

      // Check if command has required properties
      if ('data' in command && 'execute' in command) {
        (client as any).commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`⚠️ Command at ${filePath} is missing required "data" or "execute" property.`);
      }
    } catch (error) {
      console.error(`❌ Error loading command ${file}:`, error);
    }
  }

  console.log(`📦 Loaded ${(client as any).commands.size} command(s)`);
}