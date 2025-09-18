import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unequip')
  .setDescription('Unequip gear from a specific slot')
  .addStringOption(option =>
    option.setName('slot')
      .setDescription('Gear slot to unequip')
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

    // Execute unequip operation
    const unequippedGear = await convex.mutation(api.features.inventory.functions.unequipGear, {
      userId,
      slot
    });

    // Format stats for display
    const statsText = Object.entries(unequippedGear.stats)
      .filter(([_, value]) => value && value > 0)
      .map(([stat, value]) => `${stat}: +${value}`)
      .join(', ') || 'No bonus stats';

    const rarityEmojis = {
      'Common': '⚪',
      'Magic': '🔵',
      'Rare': '🟣'
    };

    const slotDisplayNames = {
      'helm': 'Helm',
      'chest': 'Chest',
      'gloves': 'Gloves',
      'legs': 'Legs',
      'mainHand': 'Main Hand',
      'offhand': 'Off Hand'
    };

    const replyMessage = [
      `**${unequippedGear.emoji} ${unequippedGear.name}** unequipped from ${slotDisplayNames[slot as keyof typeof slotDisplayNames]}!`,
      ``,
      `**Rarity:** ${rarityEmojis[unequippedGear.rarity]} ${unequippedGear.rarity}`,
      `**Item Level:** ${unequippedGear.itemLevel}`,
      `**Combat Rating:** ${unequippedGear.combatRating}`,
      `**Stats:** ${statsText}`,
      ``,
      `Gear moved to inventory. Use \`/inventory\` to view your unequipped gear.`
    ].join('\n');

    await interaction.editReply({ content: replyMessage });

  } catch (error) {
    console.error('Unequip command error:', error);

    let errorMessage = 'Failed to unequip gear. ';

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('No gear equipped in') && error.message.includes('slot')) {
        const slotDisplayNames = {
          'helm': 'helm',
          'chest': 'chest',
          'gloves': 'gloves',
          'legs': 'legs',
          'mainHand': 'main hand',
          'offhand': 'off hand'
        };
        errorMessage = `❌ No gear equipped in ${slotDisplayNames[slot as keyof typeof slotDisplayNames]} slot. Use \`/inventory\` to see your gear!`;
      } else if (error.message.includes('inventory')) {
        errorMessage += 'Could not access inventory.';
      } else if (error.message.includes('Player not found')) {
        errorMessage = '❌ Player profile not found. Try using `/profile` first!';
      } else {
        errorMessage += 'Please try again.';
      }
    } else {
      errorMessage += 'Please try again.';
    }

    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}