import { Client, Interaction } from 'discord.js';
import { parseButtonCustomId, validateButtonUser } from '../core/actionRouter';
import { executeTemplateAction } from '../core/templateExecutor';

/**
 * Handle all Discord interactions (commands, buttons, etc.)
 */
export function setupInteractionHandlers(client: Client) {
  client.on('interactionCreate', async (interaction: Interaction) => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    }

    // Handle button interactions (template actions)
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  });
}

/**
 * Handle slash command interactions
 */
async function handleSlashCommand(interaction: any) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Slash command execution error:', error);

    const errorMessage = 'There was an error executing this command!';

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
}

/**
 * Handle button interactions (template actions)
 */
async function handleButtonInteraction(interaction: any) {
  try {
    // Parse button custom ID
    const { templateId, actionId, userId } = parseButtonCustomId(interaction.customId);

    // Validate that the user clicking is the intended user
    if (!validateButtonUser(interaction.user.id, userId)) {
      await interaction.reply({
        content: '🚫 This is not your adventure! Use your own commands.',
        ephemeral: true
      });
      return;
    }

    // Defer the interaction to prevent timeout
    await interaction.deferReply();

    // Execute the template action
    const convex = interaction.client.convex;
    const response = await executeTemplateAction(
      templateId,
      actionId,
      userId,
      convex,
      interaction
    );

    // Send new message with the response
    await interaction.editReply(response);

    // Update the original message to remove action buttons to prevent farming
    try {
      await interaction.message.edit({
        embeds: interaction.message.embeds,
        components: [] // Remove all action buttons
      });
    } catch (editError) {
      console.error('Failed to update original message:', editError);
      // Non-critical error, continue execution
    }

  } catch (error) {
    console.error('Button interaction error:', error);

    const errorMessage = 'Something went wrong with that action!';

    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      console.error('Error sending button error message:', replyError);
    }
  }
}