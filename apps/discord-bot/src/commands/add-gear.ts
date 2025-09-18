import { SlashCommandBuilder, CommandInteraction } from 'discord.js';


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

    // Import minimal Convex API stub
    const { api } = await import('../lib/convex-api');

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

    // Generate simple test gear locally to avoid backend imports
    const rarities = ['Common', 'Magic', 'Rare'] as const;
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const gearData = {
      name: `Test ${slot} Item`,
      emoji: slot === 'helm' ? '⛑️' : slot === 'chest' ? '🦺' : slot === 'gloves' ? '🧤' : slot === 'legs' ? '👖' : slot === 'mainHand' ? '⚔️' : '🛡️',
      slot,
      rarity,
      itemLevel: player.level,
      combatRating: player.level * 10,
      stats: { Might: player.level + Math.floor(Math.random() * 5) }
    };

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