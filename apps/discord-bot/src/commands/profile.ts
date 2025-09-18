import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your RPG character profile');

export async function execute(interaction: ChatInputCommandInteraction) {
  // Import inside function to avoid deployment issues
  const { executeDiscordTemplate } = await import('../core/templateExecutor');

  const userId = interaction.user.id;
  const convex = (interaction.client as any).convex;

  try {
    await interaction.deferReply();

    const response = await executeDiscordTemplate(
      'PROFILE_DISPLAY',
      userId,
      convex,
      interaction
    );

    await interaction.editReply(response);

  } catch (error) {
    console.error('Profile command error:', error);

    const errorMessage = 'Failed to load your profile. Please try again.';

    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
    }
  }
}