// Pure helper functions for progression calculations
// These functions don't require database context and can be used anywhere

// Exponential XP calculation functions
export function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  // Exponential scaling: 100 * (1.15^(level-2))
  return Math.floor(100 * Math.pow(1.15, level - 2));
}

export function getTotalXPForLevel(level: number): number {
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += getXPRequiredForLevel(i);
  }
  return totalXP;
}

export function calculatePlayerLevel(totalXP: number): number {
  let level = 1;
  let cumulativeXP = 0;

  while (cumulativeXP <= totalXP) {
    level++;
    const xpForThisLevel = getXPRequiredForLevel(level);
    if (cumulativeXP + xpForThisLevel > totalXP) {
      break;
    }
    cumulativeXP += xpForThisLevel;
  }

  return level - 1;
}

// XP multiplier calculation based on game level relationship
export function getXPMultiplier(playerLevel: number, gameLevel: number): number {
  if (playerLevel < gameLevel) {
    // Catch-up bonus: 10% bonus per level behind, capped at 200% (3x total)
    const levelsBehind = gameLevel - playerLevel;
    const bonusPerLevel = 0.10; // 10% per level behind
    const maxMultiplier = 3.0; // Cap at 3x (300%)
    return Math.min(maxMultiplier, 1.0 + (levelsBehind * bonusPerLevel));
  } else if (playerLevel > gameLevel) {
    // Prestige penalty: 5% penalty per level ahead, floor at 50%
    const levelsAhead = playerLevel - gameLevel;
    const penaltyPerLevel = 0.05; // 5% penalty per level ahead
    const minMultiplier = 0.5; // Floor at 50%
    return Math.max(minMultiplier, 1.0 - (levelsAhead * penaltyPerLevel));
  } else {
    return 1.0; // Normal XP rate at game level
  }
}

// Calculate progression statistics for a set of players
export function calculateProgressionStats(players: any[], gameLevel: number) {
  const levelDistribution: Record<number, number> = {};
  let totalPlayers = 0;

  for (const player of players) {
    const level = calculatePlayerLevel(player.xp);
    levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    totalPlayers++;
  }

  // Calculate average player level
  const averageLevel = players.length > 0
    ? players.reduce((sum, p) => sum + calculatePlayerLevel(p.xp), 0) / players.length
    : 0;

  return {
    gameLevel,
    totalPlayers,
    averageLevel,
    levelDistribution
  };
}