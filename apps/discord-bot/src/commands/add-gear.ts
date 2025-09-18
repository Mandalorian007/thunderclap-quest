import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

// Simplified gear generation for testing
function generateSampleGear(playerLevel: number, slot: string) {
  const rarities = ['Common', 'Magic', 'Rare'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const baseStats = Math.floor(playerLevel / 2) + 1;

  const gearNames: Record<string, string[]> = {
    helm: ['Iron Helm', 'Steel Helmet', 'Warrior\'s Crown'],
    chest: ['Leather Armor', 'Chain Mail', 'Plate Chestpiece'],
    gloves: ['Leather Gloves', 'Iron Gauntlets', 'Mystic Handwraps'],
    legs: ['Cloth Pants', 'Chain Leggings', 'Plate Greaves'],
    mainHand: ['Iron Sword', 'Steel Blade', 'Mystic Staff'],
    offhand: ['Wooden Shield', 'Iron Shield', 'Tome of Power']
  };

  const slotEmojis: Record<string, string> = {
    helm: "⛑️", chest: "🦺", gloves: "🧤",
    legs: "👖", mainHand: "⚔️", offhand: "🛡️"
  };

  const stats: any = {};
  const numStats = rarity === 'Common' ? 1 : rarity === 'Magic' ? 2 : 3;
  const availableStats = ['Might', 'Focus', 'Sage', 'Armor', 'Evasion', 'Aegis'];

  for (let i = 0; i < numStats; i++) {
    const statName = availableStats.splice(Math.floor(Math.random() * availableStats.length), 1)[0];
    stats[statName] = baseStats + Math.floor(Math.random() * 3);
  }

  const names = gearNames[slot] || ['Test Item'];
  const name = names[Math.floor(Math.random() * names.length)];

  return {
    name,
    emoji: slotEmojis[slot] || "📦",
    slot,
    rarity,
    itemLevel: playerLevel + Math.floor(Math.random() * 5),
    combatRating: baseStats * 10 + Math.floor(Math.random() * 20),
    stats
  };
}

export const data = new SlashCommandBuilder()
  .setName('add-gear')
  .setDescription('Add test gear to your inventory')
  .addStringOption(option =>
    option.setName('slot')
      .setDescription('Gear slot to generate')
      .setRequired(true)
      .addChoices(
        { name: 'Helm ⛑️', value: 'helm' },
        { name: 'Chest 🦺', value: 'chest' },
        { name: 'Gloves 🧤', value: 'gloves' },
        { name: 'Legs 👖', value: 'legs' },
        { name: 'Main Hand ⚔️', value: 'mainHand' },
        { name: 'Off Hand 🛡️', value: 'offhand' }
      ));

export async function execute(interaction: CommandInteraction) {
  const userId = interaction.user.id;
  const slot = interaction.options.get('slot')?.value as string;
  const convex = (interaction.client as any).convex;

  try {
    await interaction.deferReply();

    // Import APIs inside function to avoid deployment issues
    const { api } = await import('../types/convex-api');

    // Ensure player exists first
    const discordUserInfo = {
      username: interaction.user.username,
      displayName: interaction.user.displayName,
      globalName: interaction.user.globalName,
      avatar: interaction.user.avatar
    };

    await convex.mutation(api.features.profile.functions.ensurePlayerExists, {
      userId,
      discordUserInfo
    });

    // Get player to determine appropriate gear level
    const player = await convex.query(api.features.profile.functions.getPlayerProfileContent, { userId });

    if (!player) {
      throw new Error('Failed to get player data');
    }

    // Generate sample gear (simplified for testing)
    const gearData = generateSampleGear(player.level, slot as any);

    // Award gear to inventory
    const gear = await convex.mutation(api.features.inventory.functions.awardGear, {
      userId,
      gearData
    });

    // Format stats for display
    const statsText = Object.entries(gear.stats)
      .filter(([_, value]) => value && value > 0)
      .map(([stat, value]) => `${stat}: +${value}`)
      .join(', ') || 'No bonus stats';

    const rarityEmojis = {
      'Common': '⚪',
      'Magic': '🔵',
      'Rare': '🟣'
    };

    const replyMessage = [
      `**${gear.emoji} ${gear.name}** added to inventory!`,
      ``,
      `**Rarity:** ${rarityEmojis[gear.rarity]} ${gear.rarity}`,
      `**Slot:** ${gear.slot}`,
      `**Item Level:** ${gear.itemLevel}`,
      `**Combat Rating:** ${gear.combatRating}`,
      `**Stats:** ${statsText}`,
      ``,
      `Use \`/inventory\` to view your gear, or \`/equip\` to equip this item!`
    ].join('\n');

    await interaction.editReply({ content: replyMessage });

  } catch (error) {
    console.error('Add-gear command error:', error);

    const errorMessage = `Failed to generate gear for ${slot} slot. Please try again.`;

    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}