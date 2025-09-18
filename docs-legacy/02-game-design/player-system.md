# Player Definition

## Core Player Entity

### Identity
- `userId: string` - Discord ID (primary key)
- `displayName: string` - Cached Discord username
- `createdAt: number` - Account creation timestamp (UTC)
- `lastActive: number` - Last interaction timestamp (UTC)

### Progression System
- `xp: number` - Experience points earned from encounters
- `level: number` - Current player level (calculated from XP)

### Achievements & Identity
- `titles: string[]` - Array of earned titles/achievements
- `currentTitle?: string` - Currently displayed title (optional)

## Progression Mechanics

### Paragon-Style Leveling System
- **Soft-Capped Levels**: Players can exceed game level but with exponentially higher XP requirements
- **Game Level**: Increases periodically (weekly/monthly), making progression easier for all players
- **Catch-Up XP**: Players below game level get massive XP bonuses
- **Beyond Game Level**: Players can continue leveling past game level at normal (slower) rates
- **No Level Perks**: Levels are pure prestige and community status
- **XP Sources**: Encounter completion, successful choices, discovery

### Game Level System
- **Soft Cap**: Game level determines "easy progression" threshold
- **Below Game Level**: Up to 100% XP bonus, scaling down as you approach game level
- **At Game Level**: Normal XP rates (100%)
- **Above Game Level**: XP penalty scaling down to 1% at 10 levels over game level

### XP Scaling Formula
- **Below Game Level**: Linear scaling from 100% bonus down to 0% as you reach game level
- **Above Game Level**: Linear scaling from 100% down to 1% over 10 levels
- **Example**: Game Level 20
  - Level 10: +100% XP (200% total)
  - Level 15: +50% XP (150% total)
  - Level 20: +0% XP (100% total)
  - Level 25: 50% XP (50% total)
  - Level 30: 1% XP (1% total)


### Title System
- **Achievement-Based**: Earned through specific actions or milestones
- **Examples**: "Treasure Hunter", "Smooth Talker", "Beast Slayer", "Puzzle Master"
- **Display**: Shows in `/profile` and optionally in encounter flavor text

## Open Design Questions

1. **Skill Stats**: Include RPG stats (STR, CHA, INT) or keep level-only?
2. **Inventory Integration**: Track item count in player or separate table?
3. **Guild Tracking**: Per-server progression or global?
4. **Game Level Schedule**: How often should game level increase (weekly, bi-weekly, monthly)?
5. **Catch-Up Formula**: What XP multiplier for players below game level (5x, 10x, 20x)?

## Database Schema Preview

```typescript
// Player interface (design)
export interface Player {
  userId: string;           // Discord ID
  displayName: string;      // Discord username
  createdAt: number;        // Timestamp (UTC)
  lastActive: number;       // Last interaction timestamp (UTC)

  // Progression
  xp: number;              // Experience points
  level: number;           // Current level
  titles: string[];        // Earned achievements
  currentTitle?: string;   // Active title

  // Equipped gear (6 optional slots using GearItem interface)
  equippedGear: {
    helm?: GearItem;
    chest?: GearItem;
    gloves?: GearItem;
    legs?: GearItem;
    mainHand?: GearItem;
    offhand?: GearItem;
  };

  // Inventory as array of GearItems
  inventory: GearItem[];
}
```