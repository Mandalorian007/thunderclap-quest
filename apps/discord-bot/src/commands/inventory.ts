import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('View and manage your inventory, gear, and items');

export async function execute(interaction: CommandInteraction) {
  // Import inside function to avoid deployment issues
  const { executeDiscordTemplate } = await import('../core/templateExecutor');

  const userId = interaction.user.id;
  const convex = (interaction.client as any).convex;

  try {
    await interaction.deferReply();

    const response = await executeDiscordTemplate(
      'INVENTORY_OVERVIEW',
      userId,
      convex,
      interaction
    );

    await interaction.editReply(response);

  } catch (error) {
    console.error('Inventory command error:', error);

    const errorMessage = 'Failed to load your inventory. Please try again.';

    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}