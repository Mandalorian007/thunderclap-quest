import { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('equip')
  .setDescription('Equip gear from your inventory')
  .addStringOption(option =>
    option.setName('gear')
      .setDescription('Choose gear to equip')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction: AutocompleteInteraction) {
  const userId = interaction.user.id;
  const focusedValue = interaction.options.getFocused().toLowerCase();
  const convex = (interaction.client as any).convex;

  try {
    // Import minimal Convex API stub
    const { api } = await import('../lib/convex-api');

    // Get unequipped gear for autocomplete
    const availableGear = await convex.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId,
      searchTerm: focusedValue
    });

    // Format choices for Discord autocomplete
    const choices = availableGear.map((gear: any) => ({
      name: gear.displayName,
      value: gear.id
    }));

    await interaction.respond(choices);

  } catch (error) {
    console.error('Equip autocomplete error:', error);
    // Return empty array on error
    await interaction.respond([]);
  }
}

export async function execute(interaction: CommandInteraction) {
  const userId = interaction.user.id;
  const gearId = interaction.options.get('gear')?.value as string;
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

    // Execute equip operation
    const result = await convex.mutation(api.features.inventory.functions.equipGear, {
      userId,
      gearId
    });

    const equippedGear = result.equippedGear;
    const previousGear = result.previousGear;

    // Format stats for display
    const statsText = Object.entries(equippedGear.stats)
      .filter(([_, value]) => value && value > 0)
      .map(([stat, value]) => `${stat}: +${value}`)
      .join(', ') || 'No bonus stats';

    const rarityEmojis = {
      'Common': '⚪',
      'Magic': '🔵',
      'Rare': '🟣'
    };

    let replyMessage = [
      `**${equippedGear.emoji} ${equippedGear.name}** equipped successfully!`,
      ``,
      `**Slot:** ${equippedGear.slot}`,
      `**Rarity:** ${rarityEmojis[equippedGear.rarity]} ${equippedGear.rarity}`,
      `**Item Level:** ${equippedGear.itemLevel}`,
      `**Combat Rating:** ${equippedGear.combatRating}`,
      `**Stats:** ${statsText}`
    ];

    // If gear was swapped, mention the previous gear
    if (previousGear) {
      replyMessage.push(``, `**Previous gear unequipped:** ${previousGear.emoji} ${previousGear.name}`);
    }

    replyMessage.push(``, `Use \`/profile\` to see your equipped gear and total stats!`);

    await interaction.editReply({ content: replyMessage.join('\n') });

  } catch (error) {
    console.error('Equip command error:', error);

    let errorMessage = 'Failed to equip gear. ';

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        errorMessage += 'Gear not found in inventory.';
      } else if (error.message.includes('inventory')) {
        errorMessage += 'Could not access inventory.';
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