import { ConvexHttpClient } from 'convex/browser';
import {
  CommandInteraction,
  ButtonInteraction,
  InteractionReplyOptions,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder
} from 'discord.js';
import { renderTemplateContent } from './contentRenderers';
import { renderTemplateActions } from './actionRouter';

/**
 * Universal template executor that converts any engine template
 * into interactive Discord experiences
 */
export async function executeDiscordTemplate(
  templateId: string,
  userId: string,
  convex: ConvexHttpClient,
  interaction?: CommandInteraction | ButtonInteraction
): Promise<InteractionReplyOptions> {
  try {
    // Import Convex API inside function to avoid deployment issues
    const { api } = await import('../../../convex/convex/_generated/api');

    // Ensure player exists first (auto-create if needed)
    await convex.mutation(api.features.profile.functions.ensurePlayerExists, { userId });

    // Execute template via engine
    const result = await convex.query(api.engine.core.executeTemplate, {
      templateId,
      userId
    });

    // Convert template content to Discord embed
    const embed = await renderTemplateContent(result.content, templateId);

    // Convert template actions to Discord buttons
    const components = result.actions.length > 0
      ? [renderTemplateActions(result.actions, templateId, userId)]
      : [];

    return {
      embeds: [embed],
      components: components.length > 0 ? components : undefined,
      ephemeral: false
    };

  } catch (error) {
    console.error(`Template execution error for ${templateId}:`, error);

    // Create error embed
    const errorEmbed = new EmbedBuilder()
      .setTitle('⚠️ Something went wrong')
      .setDescription(
        error.message?.includes('not found')
          ? 'Could not load your game data. Please try again.'
          : 'An unexpected error occurred. Please try again later.'
      )
      .setColor(0xFF6B6B)
      .setTimestamp();

    return {
      embeds: [errorEmbed],
      ephemeral: true
    };
  }
}

/**
 * Execute a template action and return the next template state
 */
export async function executeTemplateAction(
  templateId: string,
  actionId: string,
  userId: string,
  convex: ConvexHttpClient,
  interaction: ButtonInteraction
): Promise<InteractionReplyOptions> {
  try {
    // Import Convex API inside function to avoid deployment issues
    const { api } = await import('../../../convex/convex/_generated/api');

    // Execute action via engine
    const result = await convex.mutation(api.engine.core.executeAction, {
      templateId,
      actionId,
      userId
    });

    // Render the next template state
    return await executeDiscordTemplate(
      result.nextTemplateId,
      userId,
      convex,
      interaction
    );

  } catch (error) {
    console.error(`Action execution error for ${templateId}:${actionId}:`, error);

    const errorEmbed = new EmbedBuilder()
      .setTitle('⚠️ Action failed')
      .setDescription('That action couldn\'t be completed. Please try again.')
      .setColor(0xFF6B6B)
      .setTimestamp();

    return {
      embeds: [errorEmbed],
      ephemeral: true
    };
  }
}