import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';

/**
 * Action routing system that converts template actions
 * into Discord buttons and handles interactions
 */

interface TemplateAction {
  id: string;
  label: string;
  style?: 'primary' | 'secondary' | 'success' | 'danger';
  emoji?: string;
  disabled?: boolean;
}

/**
 * Convert template action style to Discord button style
 */
function getButtonStyle(style?: string): ButtonStyle {
  switch (style) {
    case 'primary':
      return ButtonStyle.Primary;
    case 'secondary':
      return ButtonStyle.Secondary;
    case 'success':
      return ButtonStyle.Success;
    case 'danger':
      return ButtonStyle.Danger;
    default:
      return ButtonStyle.Secondary;
  }
}

/**
 * Render template actions as Discord button components
 */
export function renderTemplateActions(
  actions: TemplateAction[],
  templateId: string,
  userId: string
): ActionRowBuilder<ButtonBuilder> {
  const buttons = actions.map(action => {
    const button = new ButtonBuilder()
      .setCustomId(`${templateId}:${action.id}:${userId}`)
      .setLabel(action.label)
      .setStyle(getButtonStyle(action.style))
      .setDisabled(action.disabled || false);

    // Add emoji if provided
    if (action.emoji) {
      button.setEmoji(action.emoji);
    }

    return button;
  });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}

/**
 * Parse button custom ID to extract components
 */
export function parseButtonCustomId(customId: string): {
  templateId: string;
  actionId: string;
  userId: string;
} {
  const parts = customId.split(':');

  if (parts.length !== 3) {
    throw new Error(`Invalid button custom ID format: ${customId}`);
  }

  return {
    templateId: parts[0],
    actionId: parts[1],
    userId: parts[2]
  };
}

/**
 * Validate that the interaction user matches the button's intended user
 */
export function validateButtonUser(
  interactionUserId: string,
  buttonUserId: string
): boolean {
  return interactionUserId === buttonUserId;
}