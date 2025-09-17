# /explore Command Implementation Checklist

## Overview

This document provides a step-by-step implementation checklist for the `/explore` command, covering all three encounter types: Social, Discovery, and Puzzle encounters.

## Phase 1: Core Infrastructure ✅ COMPLETE

### 1.1 Explore Feature Setup ✅ COMPLETE
- [x] Create `features/explore/` directory structure
  - [x] `features/explore/schema.ts` - Any shared encounter data schemas
  - [x] `features/explore/functions.ts` - Random encounter selection logic
  - [x] `features/explore/templates.ts` - Explore command entry point (if needed)
  - [x] `features/explore/index.ts` - Feature exports

### 1.2 Random Selection System ✅ COMPLETE
- [x] Implement `startRandomEncounter` query function
  ```typescript
  export const startRandomEncounter = zQuery({
    args: { userId: z.string() },
    handler: async (ctx, { userId }) => {
      const socialEncounters = [
        SocialTemplateId.JOKESTER_ENCOUNTER,
        SocialTemplateId.RIDDLER_ENCOUNTER,
        SocialTemplateId.GOSSIP_MERCHANT,
      ];
      const discoveryEncounters = [
        DiscoveryTemplateId.BUTTERFLY_CONFERENCE,
        DiscoveryTemplateId.UPSIDE_DOWN_PUDDLE,
        DiscoveryTemplateId.BOOK_HOUSE,
      ];
      const puzzleEncounters = [
        PuzzleTemplateId.PICKY_MAGIC_DOOR,
        PuzzleTemplateId.ENCHANTED_NUMBER_STONES,
        PuzzleTemplateId.MIRROR_RIDDLE_GUARDIAN,
      ];
      const allEncounters = [...socialEncounters, ...discoveryEncounters, ...puzzleEncounters];
      const randomIndex = Math.floor(Math.random() * allEncounters.length);
      return allEncounters[randomIndex];
    }
  });
  ```

## Phase 2: Social Encounters ✅ COMPLETE

### 2.1 Social Feature Setup ✅ COMPLETE
- [x] Create `features/social/` directory structure
  - [x] `features/social/types.ts` - Template/action ID enums
  - [x] `features/social/schema.ts` - Social encounter data schemas
  - [x] `features/social/functions.ts` - All social action functions (imports from ./types)
  - [x] `features/social/templates.ts` - Social encounter templates (imports from ./types)
  - [x] `features/social/index.ts` - Feature exports

### 2.2 Social Template System ✅ COMPLETE
- [x] Define `SocialTemplateId` enum in `types.ts` with all encounter types
- [x] Define `SocialActionId` enum in `types.ts` with all action types
- [x] Create `socialFeatureTemplateSet` with all encounters
- [x] Add social response templates (SUCCESS/FAILURE/NEUTRAL)

### 2.3 Social Encounter Content ✅ COMPLETE
- [x] Implement Jokester encounter
  - [x] Template content and actions
  - [x] `laughAtJoke` function
  - [x] `groanAtJoke` function
  - [x] `tellJoke` function
- [x] Implement Riddler encounter
  - [x] Template content and actions
  - [x] `thinkAboutRiddle` function
  - [x] `giveUpOnRiddle` function
  - [x] `answerRiddle` function
- [x] Implement Gossip Merchant encounter
  - [x] Template content and actions
  - [x] `listenToGossip` function
  - [x] `rejectGossip` function
  - [x] `shareGossip` function
- [ ] Implement Grumpy Hermit encounter
  - [ ] Template content and actions
  - [ ] `apologizeToHermit` function
  - [ ] `dismissHermit` function
  - [ ] `askAboutOldDays` function
- [ ] Add remaining social encounters (8 more)
  - [ ] Chatty Innkeeper
  - [ ] Conspiracy Theorist
  - [ ] Street Philosopher
  - [ ] Traveling Salesman
  - [ ] Village Drunk
  - [ ] Know-It-All Scholar
  - [ ] Superstitious Villager
  - [ ] Lost Bard

## Phase 3: Discovery Encounters ✅ COMPLETE

### 3.1 Discovery Feature Setup ✅ COMPLETE
- [x] Create `features/discovery/` directory structure
  - [x] `features/discovery/types.ts` - Template/action ID enums
  - [x] `features/discovery/schema.ts` - Discovery encounter schemas
  - [x] `features/discovery/functions.ts` - All discovery action functions (imports from ./types)
  - [x] `features/discovery/templates.ts` - Discovery encounter templates (imports from ./types)
  - [x] `features/discovery/index.ts` - Feature exports

### 3.2 Discovery Template System ✅ COMPLETE
- [x] Define `DiscoveryTemplateId` enum in `types.ts` with all encounter types
- [x] Define `DiscoveryActionId` enum in `types.ts` with all action types
- [x] Create `discoveryFeatureTemplateSet` with all encounters
- [x] Add discovery response templates (DELIGHT/WONDER/MAGIC)

### 3.3 Discovery Encounter Content ✅ COMPLETE
- [x] Implement Butterfly Conference encounter
  - [x] Template content and actions
  - [x] `eavesdropOnButterflies` function
  - [x] `joinButterflyDebate` function
  - [x] `mediateButterflyDispute` function
- [x] Implement Upside-Down Puddle encounter
  - [x] Template content and actions
  - [x] `stickHandInPuddle` function
  - [x] `dropCoinInPuddle` function
  - [x] `drinkFromPuddle` function
- [x] Implement Book House encounter
  - [x] Template content and actions
  - [x] `knockOnBookDoor` function
  - [x] `readTheWalls` function
  - [x] `borrowABook` function
- [ ] Add remaining discovery encounters (5 more)
  - [ ] Backwards Tree
  - [ ] Singing Rock
  - [ ] Cloud Garden
  - [ ] Dancing Mushrooms
  - [ ] Mirror Meadow

## Phase 4: Puzzle Encounters ✅ COMPLETE

### 4.1 Puzzle Feature Setup ✅ COMPLETE
- [x] Create `features/puzzle/` directory structure
  - [x] `features/puzzle/types.ts` - Template/action ID enums
  - [x] `features/puzzle/schema.ts` - Puzzle encounter schemas
  - [x] `features/puzzle/functions.ts` - All puzzle action functions (imports from ./types)
  - [x] `features/puzzle/templates.ts` - Puzzle encounter templates (imports from ./types)
  - [x] `features/puzzle/index.ts` - Feature exports

### 4.2 Puzzle Template System ✅ COMPLETE
- [x] Define `PuzzleTemplateId` enum in `types.ts` with all encounter types
- [x] Define `PuzzleActionId` enum in `types.ts` with all action types
- [x] Create `puzzleFeatureTemplateSet` with all encounters
- [x] Add puzzle response templates (SUCCESS/CREATIVE/FAILURE)

### 4.3 Puzzle Encounter Content ✅ COMPLETE
- [x] Implement Picky Magic Door encounter
  - [x] Template content and actions
  - [x] `answerWorm` function
  - [x] `answerCreatively` function
  - [x] `askForHint` function
  - [x] `tryToForce` function
- [x] Implement Enchanted Number Stones encounter
  - [x] Template content and actions
  - [x] `pressSix` function
  - [x] `pressEight` function
  - [x] `pressRandom` function
  - [x] `askPattern` function
- [x] Implement Mirror Riddle Guardian encounter
  - [x] Template content and actions
  - [x] `answerKeyboard` function
  - [x] `makeWildGuess` function
  - [x] `askForClue` function
  - [x] `complimentMirror` function
- [ ] Add remaining puzzle encounters (5 more)
  - [ ] Chatty Lock Mechanism
  - [ ] Philosophical Gargoyle
  - [ ] Musical Pattern Tiles
  - [ ] Wordplay Fountain
  - [ ] Logic Crystal Array

## Phase 5: Discord Integration ✅ COMPLETE

### 5.1 Discord Command Setup ✅ COMPLETE
- [x] Add `/explore` slash command registration
- [x] Implement command handler using existing `executeDiscordTemplate`
  ```typescript
  export async function execute(interaction: CommandInteraction) {
    const { executeDiscordTemplate } = await import('../core/templateExecutor');
    const userId = interaction.user.id;
    const convex = (interaction.client as any).convex;

    await interaction.deferReply();
    const templateId = await convex.query('features/explore/functions:startRandomEncounter', { userId });
    const response = await executeDiscordTemplate(templateId, userId, convex, interaction);
    await interaction.editReply(response);
  }
  ```

### 5.2 Discord Rendering ✅ COMPLETE
- [x] Verify existing template renderer works with social encounters
- [x] Verify existing template renderer works with discovery encounters
- [x] Verify existing template renderer works with puzzle encounters
- [x] Test button interactions and action routing
- [x] Fixed content structure-based detection for all encounter types
- [x] Updated interaction handler to send new messages instead of editing

## Phase 6: Helper Systems ✅ COMPLETE

### 6.1 XP and Title System ✅ COMPLETE
- [x] Implement `awardXP` helper function
- [x] Implement `awardTitle` helper function
- [x] Define all encounter-specific titles
- [x] Test XP progression integration

### 6.2 Testing Infrastructure ✅ COMPLETE
- [x] Create test utilities for encounter flows
- [x] Write tests for random encounter selection
- [x] Write tests for each encounter type's action functions
- [x] Write integration tests for complete encounter flows
- [x] Integration tests exist for all features: profile, explore, social, discovery, puzzle
- [x] Engine core and integration tests implemented

## Phase 7: Content Expansion

### 7.1 Additional Content
- [ ] Add more social encounter variations
- [ ] Add more discovery encounter variations
- [ ] Add more puzzle encounter variations
- [ ] Create rare/special encounters

### 7.2 Balancing and Polish
- [ ] Test encounter frequency and variety
- [ ] Adjust XP rewards based on playtesting
- [ ] Polish encounter descriptions and dialogue
- [ ] Add encounter descriptions to make them more vivid

## Technical Notes

### Template Engine Integration
- All encounters use the existing template engine framework with array-based actions
- No Discord-specific code needed for new encounters
- Universal template renderer handles all encounter types automatically
- Empty arrays `[]` indicate terminal templates, populated arrays contain action objects with `id` and `label`

### Content Model Structure
```typescript
// Social encounters
interface SocialEncounterContent {
  title: string;
  description: string;
  character: { name: string; emoji: string; };
  dialogue?: string;
}

// Discovery encounters
interface DiscoveryEncounterContent {
  title: string;
  description: string;
  environment: { type: string; oddity: string; };
}

// Puzzle encounters
interface PuzzleEncounterContent {
  title: string;
  description: string;
  puzzle: { type: string; question: string; difficulty: string; };
  character: { name: string; emoji: string; };
  dialogue: string;
}
```

### Template Action Structure
```typescript
// Array-based actions format
actions: [
  {
    id: ActionId.SOME_ACTION,
    label: "Action Label",
    execute: someFunction | TemplateId.NEXT_TEMPLATE | null
  }
]

// Terminal templates (encounter complete)
actions: [] // Empty array
```

### Function Patterns
- All action functions return `TemplateId | null`
- `null` return = encounter complete
- Template ID return = continue to that template
- Functions award XP, titles, and other rewards

## Success Criteria ✅ COMPLETE

### Functional Requirements ✅ COMPLETE
- [x] `/explore` command works in Discord
- [x] Random encounter selection functions correctly
- [x] All three encounter types render properly
- [x] Button interactions work for all actions
- [x] XP and titles are awarded correctly
- [x] Encounters complete properly (no hanging states)
- [x] Fixed circular import issues with per-feature types.ts pattern
- [x] Standardized content rendering for all encounter types

### Content Requirements 🚧 PARTIALLY COMPLETE
- [x] 3 social encounters implemented (Jokester, Riddler, Gossip Merchant)
- [x] 3 discovery encounters implemented (Butterfly Conference, Upside-Down Puddle, Book House)
- [x] 3 puzzle encounters implemented (Picky Magic Door, Number Stones, Mirror Guardian)
- [x] All encounters have unique, engaging content
- [x] Response variety makes repeated play interesting
- [ ] Additional encounters can be added by expanding the encounter arrays in startRandomEncounter

### User Experience Requirements ✅ COMPLETE
- [x] Encounters feel distinct from each other
- [x] All choices lead to satisfying outcomes
- [x] Humor and whimsy come through clearly
- [x] No confusing or broken interaction flows
- [x] Players want to use `/explore` multiple times
- [x] Rich Discord embeds with proper formatting and colors
- [x] Content structure automatically detected and rendered appropriately

---

*This implementation can proceed in phases, with each encounter type implemented and tested independently before moving to the next.*