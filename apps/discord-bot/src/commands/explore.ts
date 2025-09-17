import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('explore')
  .setDescription('Embark on a random adventure and discover new encounters');

export async function execute(interaction: CommandInteraction) {
  // Import inside function to avoid deployment issues
  const { executeDiscordTemplate } = await import('../core/templateExecutor');

  const userId = interaction.user.id;
  const convex = (interaction.client as any).convex;

  try {
    await interaction.deferReply();

    // First, get a random encounter template ID
    const templateId = await convex.query('features/explore/functions:startRandomEncounter', {
      userId
    });

    // Then execute that template
    const response = await executeDiscordTemplate(
      templateId,
      userId,
      convex,
      interaction
    );

    await interaction.editReply(response);

  } catch (error) {
    console.error('Explore command error:', error);

    const errorMessage = 'Failed to start your adventure. Please try again.';

    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}