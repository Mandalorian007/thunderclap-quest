import { EmbedBuilder } from 'discord.js';

/**
 * Content renderers convert template content into Discord embeds
 * based on template type
 */

type ContentRenderer = (content: any) => EmbedBuilder;

// Color scheme for different encounter types
const colors = {
  profile: 0x3498db,
  social: 0xFF6B35,
  discovery: 0x00BCD4,
  puzzle: 0x9C27B0,
  success: 0x4CAF50,
  failure: 0xFF5722,
  neutral: 0x9E9E9E,
  creative: 0xFF9800
};

function renderContentByType(content: any): EmbedBuilder {
  const embed = new EmbedBuilder().setTimestamp();

  // Handle different content types based on structure
  if (content.displayName && content.level !== undefined) {
    // Profile content
    embed.setColor(colors.profile)
      .setTitle(`${content.displayName}'s Profile`)
      .addFields(
        { name: '⚡ Level', value: `${content.level}`, inline: true },
        { name: '✨ XP', value: `${content.xp}`, inline: true },
        { name: '📊 Progress', value: `${content.xpProgress}/${content.xpRequired} XP`, inline: true }
      );

    if (content.currentTitle) {
      embed.addFields({ name: '🏆 Current Title', value: content.currentTitle, inline: false });
    }

    if (content.titles && content.titles.length > 0) {
      embed.addFields({ name: '🎖️ Earned Titles', value: content.titles.join(', '), inline: false });
    }

    if (content.createdAt) {
      embed.setFooter({ text: `Member since ${new Date(content.createdAt).toDateString()}` });
    }

  } else {
    // All other content types (encounters, outcomes, etc.)
    // Set title if available
    if (content.title) {
      embed.setTitle(content.title);
    }

    // Add description if available
    if (content.description) {
      embed.setDescription(content.description);
    }

    if (content.character && content.dialogue) {
      // Character encounter (social/puzzle)
      embed.addFields({
        name: `${content.character.emoji} ${content.character.name}`,
        value: content.dialogue,
        inline: false
      });

      // Add puzzle info if available
      if (content.puzzle) {
        embed.addFields({
          name: `🧩 ${content.puzzle.type} puzzle`,
          value: content.puzzle.question,
          inline: false
        });
        embed.setColor(colors.puzzle);
      } else {
        embed.setColor(colors.social);
      }

    } else if (content.environment) {
      // Discovery encounter
      embed.addFields({
        name: `🌟 ${content.environment.type}`,
        value: `${content.environment.oddity}`,
        inline: false
      });
      embed.setColor(colors.discovery);

    } else {
      // Outcome templates - determine color by title content
      if (content.title?.includes('Success') || content.title?.includes('Solved') || content.title?.includes('Complete')) {
        embed.setColor(colors.success);
      } else if (content.title?.includes('Creative') || content.title?.includes('Innovation')) {
        embed.setColor(colors.creative);
      } else if (content.title?.includes('Fail') || content.title?.includes('Awry') || content.title?.includes('Experience')) {
        embed.setColor(colors.failure);
      } else {
        embed.setColor(colors.neutral);
      }
    }
  }

  return embed;
}

const contentRenderers: Record<string, ContentRenderer> = {
  // Use the standardized renderer for most templates
  default: renderContentByType
};

/**
 * Render template content into a Discord embed
 */
export async function renderTemplateContent(
  content: any,
  templateId: string
): Promise<EmbedBuilder> {
  // Check for specific template renderer first
  const renderer = contentRenderers[templateId];

  if (renderer) {
    return renderer(content);
  }

  // Use the default standardized renderer
  return renderContentByType(content);
}

/**
 * Add a new content renderer for a template
 */
export function registerContentRenderer(
  templateId: string,
  renderer: ContentRenderer
): void {
  contentRenderers[templateId] = renderer;
}