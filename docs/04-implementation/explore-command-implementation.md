# /explore Command Implementation Checklist

## Overview

This document provides a step-by-step implementation checklist for the `/explore` command, covering all three encounter types: Social, Discovery, and Puzzle encounters.

## Phase 1: Core Infrastructure

### 1.1 Explore Feature Setup
- [ ] Create `features/explore/` directory structure
  - [ ] `features/explore/schema.ts` - Any shared encounter data schemas
  - [ ] `features/explore/functions.ts` - Random encounter selection logic
  - [ ] `features/explore/templates.ts` - Explore command entry point (if needed)
  - [ ] `features/explore/index.ts` - Feature exports

### 1.2 Random Selection System
- [ ] Implement `startRandomEncounter` query function
  ```typescript
  export const startRandomEncounter = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
      const allEncounters = [
        ...Object.values(SocialTemplateId),
        ...Object.values(DiscoveryTemplateId),
        ...Object.values(PuzzleTemplateId),
      ];
      const randomIndex = Math.floor(Math.random() * allEncounters.length);
      return allEncounters[randomIndex];
    }
  });
  ```

## Phase 2: Social Encounters

### 2.1 Social Feature Setup
- [ ] Create `features/social/` directory structure
  - [ ] `features/social/schema.ts` - Social encounter data schemas
  - [ ] `features/social/functions.ts` - All social action functions
  - [ ] `features/social/templates.ts` - Social encounter templates
  - [ ] `features/social/index.ts` - Feature exports

### 2.2 Social Template System
- [ ] Define `SocialTemplateId` enum with all encounter types
- [ ] Define `SocialActionId` enum with all action types
- [ ] Create `socialFeatureTemplateSet` with all encounters
- [ ] Add social response templates (SUCCESS/FAILURE/NEUTRAL)

### 2.3 Social Encounter Content
- [ ] Implement Jokester encounter
  - [ ] Template content and actions
  - [ ] `laughAtJoke` function
  - [ ] `groanAtJoke` function
  - [ ] `tellJoke` function
- [ ] Implement Riddler encounter
  - [ ] Template content and actions
  - [ ] `thinkAboutRiddle` function
  - [ ] `giveUpOnRiddle` function
  - [ ] `answerRiddle` function
- [ ] Implement Gossip Merchant encounter
  - [ ] Template content and actions
  - [ ] `listenToGossip` function
  - [ ] `rejectGossip` function
  - [ ] `shareGossip` function
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

## Phase 3: Discovery Encounters

### 3.1 Discovery Feature Setup
- [ ] Create `features/discovery/` directory structure
  - [ ] `features/discovery/schema.ts` - Discovery encounter schemas
  - [ ] `features/discovery/functions.ts` - All discovery action functions
  - [ ] `features/discovery/templates.ts` - Discovery encounter templates
  - [ ] `features/discovery/index.ts` - Feature exports

### 3.2 Discovery Template System
- [ ] Define `DiscoveryTemplateId` enum with all encounter types
- [ ] Define `DiscoveryActionId` enum with all action types
- [ ] Create `discoveryFeatureTemplateSet` with all encounters
- [ ] Add discovery response templates (DELIGHT/WONDER/MAGIC)

### 3.3 Discovery Encounter Content
- [ ] Implement Butterfly Conference encounter
  - [ ] Template content and actions
  - [ ] `eavesdropOnButterflies` function
  - [ ] `joinButterflyDebate` function
  - [ ] `mediateButterflyDispute` function
- [ ] Implement Upside-Down Puddle encounter
  - [ ] Template content and actions
  - [ ] `stickHandInPuddle` function
  - [ ] `dropCoinInPuddle` function
  - [ ] `drinkFromPuddle` function
- [ ] Implement Book House encounter
  - [ ] Template content and actions
  - [ ] `knockOnBookDoor` function
  - [ ] `readTheWalls` function
  - [ ] `borrowABook` function
- [ ] Add remaining discovery encounters (5 more)
  - [ ] Backwards Tree
  - [ ] Singing Rock
  - [ ] Cloud Garden
  - [ ] Dancing Mushrooms
  - [ ] Mirror Meadow

## Phase 4: Puzzle Encounters

### 4.1 Puzzle Feature Setup
- [ ] Create `features/puzzle/` directory structure
  - [ ] `features/puzzle/schema.ts` - Puzzle encounter schemas
  - [ ] `features/puzzle/functions.ts` - All puzzle action functions
  - [ ] `features/puzzle/templates.ts` - Puzzle encounter templates
  - [ ] `features/puzzle/index.ts` - Feature exports

### 4.2 Puzzle Template System
- [ ] Define `PuzzleTemplateId` enum with all encounter types
- [ ] Define `PuzzleActionId` enum with all action types
- [ ] Create `puzzleFeatureTemplateSet` with all encounters
- [ ] Add puzzle response templates (SUCCESS/CREATIVE/FAILURE)

### 4.3 Puzzle Encounter Content
- [ ] Implement Picky Magic Door encounter
  - [ ] Template content and actions
  - [ ] `answerWorm` function
  - [ ] `answerCreatively` function
  - [ ] `askForHint` function
  - [ ] `tryToForce` function
- [ ] Implement Enchanted Number Stones encounter
  - [ ] Template content and actions
  - [ ] `pressSix` function
  - [ ] `pressEight` function
  - [ ] `pressRandom` function
  - [ ] `askPattern` function
- [ ] Implement Mirror Riddle Guardian encounter
  - [ ] Template content and actions
  - [ ] `answerKeyboard` function
  - [ ] `makeWildGuess` function
  - [ ] `askForClue` function
  - [ ] `complimentMirror` function
- [ ] Add remaining puzzle encounters (5 more)
  - [ ] Chatty Lock Mechanism
  - [ ] Philosophical Gargoyle
  - [ ] Musical Pattern Tiles
  - [ ] Wordplay Fountain
  - [ ] Logic Crystal Array

## Phase 5: Discord Integration

### 5.1 Discord Command Setup
- [ ] Add `/explore` slash command registration
- [ ] Implement command handler using existing `executeDiscordTemplate`
  ```typescript
  async function handleExploreCommand(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const templateId = await convex.query(api.explore.functions.startRandomEncounter, { userId });
    const response = await executeDiscordTemplate(templateId, userId, interaction);
    await interaction.reply(response);
  }
  ```

### 5.2 Discord Rendering (Should be automatic)
- [ ] Verify existing template renderer works with social encounters
- [ ] Verify existing template renderer works with discovery encounters
- [ ] Verify existing template renderer works with puzzle encounters
- [ ] Test button interactions and action routing

## Phase 6: Helper Systems

### 6.1 XP and Title System
- [ ] Implement `awardXP` helper function
- [ ] Implement `awardTitle` helper function
- [ ] Define all encounter-specific titles
- [ ] Test XP progression integration

### 6.2 Testing Infrastructure
- [ ] Create test utilities for encounter flows
- [ ] Write tests for random encounter selection
- [ ] Write tests for each encounter type's action functions
- [ ] Write integration tests for complete encounter flows

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

## Success Criteria

### Functional Requirements
- [ ] `/explore` command works in Discord
- [ ] Random encounter selection functions correctly
- [ ] All three encounter types render properly
- [ ] Button interactions work for all actions
- [ ] XP and titles are awarded correctly
- [ ] Encounters complete properly (no hanging states)

### Content Requirements
- [ ] Minimum 12 social encounters implemented
- [ ] Minimum 8 discovery encounters implemented
- [ ] Minimum 8 puzzle encounters implemented
- [ ] All encounters have unique, engaging content
- [ ] Response variety makes repeated play interesting

### User Experience Requirements
- [ ] Encounters feel distinct from each other
- [ ] All choices lead to satisfying outcomes
- [ ] Humor and whimsy come through clearly
- [ ] No confusing or broken interaction flows
- [ ] Players want to use `/explore` multiple times

---

*This implementation can proceed in phases, with each encounter type implemented and tested independently before moving to the next.*