import { EmbedBuilder } from 'discord.js';

/**
 * Content renderers convert template content into Discord embeds
 * based on template type
 */

type ContentRenderer = (content: any) => EmbedBuilder;

const contentRenderers: Record<string, ContentRenderer> = {
  PROFILE_DISPLAY: (content) => {
    const embed = new EmbedBuilder()
      .setTitle(`${content.displayName}'s Profile`)
      .setColor(0x3498db)
      .addFields(
        { name: '⚡ Level', value: `${content.level}`, inline: true },
        { name: '✨ XP', value: `${content.xp}`, inline: true },
        { name: '📊 Progress', value: `${content.xpProgress}/${content.xpRequired} XP`, inline: true }
      )
      .setTimestamp();

    // Add current title if available
    if (content.currentTitle) {
      embed.addFields({
        name: '🏆 Current Title',
        value: content.currentTitle,
        inline: false
      });
    }

    // Add titles list if available
    if (content.titles && content.titles.length > 0) {
      embed.addFields({
        name: '🎖️ Earned Titles',
        value: content.titles.join(', '),
        inline: false
      });
    }

    // Add member since footer
    if (content.createdAt) {
      embed.setFooter({
        text: `Member since ${new Date(content.createdAt).toDateString()}`
      });
    }

    return embed;
  },

  // Future template renderers can be added here
  // COMBAT_ENCOUNTER: (content) => { ... },
  // LOOT_DISCOVERY: (content) => { ... },
  // STORY_BRANCH: (content) => { ... },
};

/**
 * Render template content into a Discord embed
 */
export async function renderTemplateContent(
  content: any,
  templateId: string
): Promise<EmbedBuilder> {
  const renderer = contentRenderers[templateId];

  if (!renderer) {
    // Fallback renderer for unknown templates
    console.warn(`No content renderer found for template: ${templateId}`);

    return new EmbedBuilder()
      .setTitle('🎮 Game Content')
      .setDescription('Template content loaded successfully')
      .addFields({
        name: 'Template ID',
        value: templateId,
        inline: true
      })
      .setColor(0x95a5a6)
      .setTimestamp();
  }

  return renderer(content);
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