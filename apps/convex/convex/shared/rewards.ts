// Global reward system for consistent UI display across all features

// Core reward interfaces
export interface RewardEntry {
  icon: string;      // Emoji for visual display
  amount: number;    // Quantity earned (always positive)
  name: string;      // Human-readable name
}

export interface RewardBundle {
  rewards: RewardEntry[];
}

export interface ActionResult {
  nextTemplateId: string | null;
  rewards?: RewardBundle;
}

// Reward type constants - referenceable like XP_REWARD.icon
export const XP_REWARD = {
  icon: "✨",
  name: "Experience"
} as const;

export const TITLE_REWARD = {
  icon: "🏆",
  name: "Title"
} as const;

export const GOLD_REWARD = {
  icon: "🪙",
  name: "Gold"
} as const;

export const ITEM_REWARD = {
  icon: "📦",
  name: "Item"
} as const;

export const GEAR_REWARD = {
  icon: "⚔️",
  name: "Gear"
} as const;

export const MATERIAL_REWARD = {
  icon: "⛏️",
  name: "Material"
} as const;

export const STAT_REWARD = {
  icon: "📊",
  name: "Stat"
} as const;

export const UNLOCK_REWARD = {
  icon: "🗺️",
  name: "Unlock"
} as const;

export const ACHIEVEMENT_REWARD = {
  icon: "🎖️",
  name: "Achievement"
} as const;

// Universal reward formatter
export function formatRewardBundle(bundle: RewardBundle): string {
  return bundle.rewards
    .map(reward => `${reward.icon} +${reward.amount} ${reward.name}`)
    .join('\n');
}

// Helper function to create rewards using constants
export function createReward(
  rewardType: { icon: string; name: string },
  amount: number,
  customName?: string
): RewardEntry {
  return {
    icon: rewardType.icon,
    amount,
    name: customName || rewardType.name
  };
}