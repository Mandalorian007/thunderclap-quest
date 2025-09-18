import { EmbedBuilder } from 'discord.js';

// Import reward formatting
import type { RewardBundle } from '../../../convex/convex/shared/rewards';

/**
 * Content renderers convert template content into Discord embeds
 * based on template type
 */

type ContentRenderer = (content: any) => EmbedBuilder;

// Helper function to get progression status message
function getProgressionStatus(content: any): string {
  if (content.isBehindGameLevel) {
    const levelsBehind = content.gameLevel - content.level;
    return `Catch-up (+${levelsBehind} behind)`;
  } else if (content.isAheadOfGameLevel) {
    const levelsAhead = content.level - content.gameLevel;
    return `Prestige (-${levelsAhead} ahead)`;
  } else {
    return 'On track';
  }
}

// Helper function to format reward bundle for display
function formatRewardBundle(bundle: RewardBundle): string {
  return bundle.rewards
    .map(reward => `${reward.icon} +${reward.amount} ${reward.name}`)
    .join('\n');
}

// Helper function to format gear for inventory display
function formatGearList(gear: any[]): string {
  if (!gear || gear.length === 0) {
    return 'No gear in inventory';
  }

  // Group gear by slot for better organization
  const gearBySlot: Record<string, any[]> = {};
  const slotEmojis = {
    helm: "⛑️",
    chest: "🦺",
    gloves: "🧤",
    legs: "👖",
    mainHand: "⚔️",
    offhand: "🛡️"
  };

  const rarityEmojis = {
    'Common': '⚪',
    'Magic': '🔵',
    'Rare': '🟣'
  };

  gear.forEach(item => {
    if (!gearBySlot[item.slot]) {
      gearBySlot[item.slot] = [];
    }
    gearBySlot[item.slot].push(item);
  });

  // Order slots consistently
  const slotOrder = ['helm', 'chest', 'gloves', 'legs', 'mainHand', 'offhand'];
  const formattedSlots = slotOrder
    .filter(slot => gearBySlot[slot] && gearBySlot[slot].length > 0)
    .map(slot => {
      const slotEmoji = slotEmojis[slot as keyof typeof slotEmojis] || "📦";
      const items = gearBySlot[slot]
        .map(item => {
          const rarityEmoji = rarityEmojis[item.rarity as keyof typeof rarityEmojis] || '⚪';
          return `${item.emoji} ${item.name} ${rarityEmoji}`;
        })
        .join('\n    '); // Indent items under slot
      return `${slotEmoji} **${slot.charAt(0).toUpperCase() + slot.slice(1)}**\n    ${items}`;
    });

  return formattedSlots.join('\n\n');
}

// Helper function to format materials for display
function formatMaterialsList(materials: any[]): string {
  if (!materials || materials.length === 0) {
    return 'No materials in inventory';
  }

  return materials
    .map(material => `${material.emoji} ${material.name} x${material.quantity}`)
    .join('\n');
}

// Helper function to format items for display
function formatItemsList(items: any[]): string {
  if (!items || items.length === 0) {
    return 'No items in inventory';
  }

  return items
    .map(item => `${item.emoji} ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`)
    .join('\n');
}

// Helper function to format equipped gear for profile display
function formatEquippedGear(equippedGear: any): string {
  if (!equippedGear || Object.keys(equippedGear).length === 0) {
    return 'No gear equipped';
  }

  const slotEmojis = {
    helm: "⛑️",
    chest: "🦺",
    gloves: "🧤",
    legs: "👖",
    mainHand: "⚔️",
    offhand: "🛡️"
  };

  const rarityEmojis = {
    'Common': '⚪',
    'Magic': '🔵',
    'Rare': '🟣'
  };

  const slotOrder = ['helm', 'chest', 'gloves', 'legs', 'mainHand', 'offhand'];

  const equippedItems = slotOrder
    .filter(slot => equippedGear[slot])
    .map(slot => {
      const gear = equippedGear[slot];
      const slotEmoji = slotEmojis[slot as keyof typeof slotEmojis];
      const rarityEmoji = rarityEmojis[gear.rarity as keyof typeof rarityEmojis] || '⚪';
      return `${slotEmoji} ${gear.emoji} ${gear.name} ${rarityEmoji}`;
    });

  return equippedItems.length > 0 ? equippedItems.join('\n') : 'No gear equipped';
}

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

    // Add game level and XP multiplier info if available
    if (content.gameLevel !== undefined) {
      embed.addFields(
        { name: '🌍 Game Level', value: `${content.gameLevel}`, inline: true },
        { name: '🔥 XP Multiplier', value: `${Math.round(content.xpMultiplier * 100)}%`, inline: true },
        { name: '📈 Status', value: getProgressionStatus(content), inline: true }
      );
    }

    // Add equipped gear section
    if (content.equippedGear) {
      const gearDisplay = formatEquippedGear(content.equippedGear);
      embed.addFields({
        name: '⚔️ Equipped Gear',
        value: gearDisplay,
        inline: false
      });
    }

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

  // Add rewards section if present
  if (content.rewards && content.rewards.rewards && content.rewards.rewards.length > 0) {
    embed.addFields({
      name: '🎁 Rewards Earned',
      value: formatRewardBundle(content.rewards),
      inline: false
    });
  }

  return embed;
}

// Custom inventory renderers
function renderInventoryOverview(content: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(content.title)
    .setDescription(content.description)
    .setColor(0x8E44AD)
    .setTimestamp();

  // Add inventory summary fields
  embed.addFields(
    { name: '⚔️ Gear', value: `${content.gearCount} pieces`, inline: true },
    { name: '⛏️ Materials', value: `${content.materialsCount} types`, inline: true },
    { name: '📦 Items', value: `${content.itemsCount} types`, inline: true }
  );

  return embed;
}

function renderGearInventory(content: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(content.title)
    .setColor(0xE74C3C)
    .setTimestamp();

  if (content.isEmpty) {
    embed.setDescription(content.description);
  } else {
    embed.setDescription(content.description);

    // Format gear list with better organization
    const gearDisplay = formatGearList(content.gear);
    embed.addFields({
      name: '🎒 Your Gear',
      value: gearDisplay,
      inline: false
    });
  }

  return embed;
}

function renderMaterialsInventory(content: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(content.title)
    .setColor(0xF39C12)
    .setTimestamp();

  if (content.isEmpty) {
    embed.setDescription(content.description);
  } else {
    embed.setDescription(content.description);

    const materialsDisplay = formatMaterialsList(content.materials);
    embed.addFields({
      name: '📦 Your Materials',
      value: materialsDisplay,
      inline: false
    });
  }

  return embed;
}

function renderItemsInventory(content: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(content.title)
    .setColor(0x3498DB)
    .setTimestamp();

  if (content.isEmpty) {
    embed.setDescription(content.description);
  } else {
    embed.setDescription(content.description);

    const itemsDisplay = formatItemsList(content.items);
    embed.addFields({
      name: '🎁 Your Items',
      value: itemsDisplay,
      inline: false
    });
  }

  return embed;
}

const contentRenderers: Record<string, ContentRenderer> = {
  // Inventory-specific renderers
  INVENTORY_OVERVIEW: renderInventoryOverview,
  INVENTORY_GEAR: renderGearInventory,
  INVENTORY_MATERIALS: renderMaterialsInventory,
  INVENTORY_ITEMS: renderItemsInventory,

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