# Explore Command Design

## Overview

The `/explore` command is the core engagement driver of Thunderclap Quest, delivering quick, meaningful encounters through a standardized template system. Each encounter provides immediate choice-consequence feedback designed for **fun and humor** while maintaining **consistent UX patterns**.

## Design Philosophy

- **Quick Interactions**: Single choice → immediate consequence → reward/story
- **Standardized Content Model**: Universal structure for rapid content creation
- **Humor-Driven**: Prioritize entertaining, lighthearted experiences
- **Minimal Discord Code**: Content changes don't require Discord development

## Encounter Categories

### 1. Social Encounters ✅ DESIGNED

**Purpose**: Character-driven interactions focused on humor and personality

#### Standardized Social Content Model

```typescript
interface SocialEncounterContent {
  title: string;           // "🎭 A Traveling Jokester"
  description: string;     // The encounter setup/flavor text
  character: {
    name: string;          // "Bobo the Entertainer"
    emoji: string;         // "🎭"
  };
  dialogue?: string;       // Optional character speech
}

// Actions follow engine template Record pattern
interface SocialAction {
  label: string;          // "Laugh Heartily"
  emoji: string;          // "😂"
  execute: TTemplateIds | FunctionReference | null;
}
```

#### Social Feature Template Set

```typescript
// features/social/types.ts - Template/action ID enums
export enum SocialTemplateId {
  // Character-specific encounters
  JOKESTER_ENCOUNTER = "JOKESTER_ENCOUNTER",
  RIDDLER_ENCOUNTER = "RIDDLER_ENCOUNTER",
  GOSSIP_MERCHANT = "GOSSIP_MERCHANT",
  LOST_BARD = "LOST_BARD",
  GRUMPY_HERMIT = "GRUMPY_HERMIT",
  CHATTY_INNKEEPER = "CHATTY_INNKEEPER",
  CONSPIRACY_THEORIST = "CONSPIRACY_THEORIST",
  STREET_PHILOSOPHER = "STREET_PHILOSOPHER",
  TRAVELING_SALESMAN = "TRAVELING_SALESMAN",
  VILLAGE_DRUNK = "VILLAGE_DRUNK",
  KNOW_IT_ALL_SCHOLAR = "KNOW_IT_ALL_SCHOLAR",
  SUPERSTITIOUS_VILLAGER = "SUPERSTITIOUS_VILLAGER",

  // Standardized outcomes
  SOCIAL_SUCCESS = "SOCIAL_SUCCESS",
  SOCIAL_FAILURE = "SOCIAL_FAILURE",
  SOCIAL_NEUTRAL = "SOCIAL_NEUTRAL"
}

// features/social/types.ts
export enum SocialActionId {
  // Jokester actions
  LAUGH_AT_JOKE = "LAUGH_AT_JOKE",
  GROAN_AT_JOKE = "GROAN_AT_JOKE",
  TELL_JOKE = "TELL_JOKE",

  // Riddler actions
  THINK_ABOUT_RIDDLE = "THINK_ABOUT_RIDDLE",
  GIVE_UP_ON_RIDDLE = "GIVE_UP_ON_RIDDLE",
  ANSWER_RIDDLE = "ANSWER_RIDDLE",

  // Gossip merchant actions
  LISTEN_TO_GOSSIP = "LISTEN_TO_GOSSIP",
  REJECT_GOSSIP = "REJECT_GOSSIP",
  SHARE_GOSSIP = "SHARE_GOSSIP",

  // Hermit actions
  APOLOGIZE_TO_HERMIT = "APOLOGIZE_TO_HERMIT",
  DISMISS_HERMIT = "DISMISS_HERMIT",
  ASK_ABOUT_OLD_DAYS = "ASK_ABOUT_OLD_DAYS",

  // Universal action
  WALK_AWAY = "WALK_AWAY"
}

// features/social/templates.ts - imports from ./types
export const socialFeatureTemplateSet: FeatureTemplateSet<SocialTemplateId, SocialActionId> = {
  startTemplate: SocialTemplateId.JOKESTER_ENCOUNTER, // Dynamic based on random selection

  templates: {
    [SocialTemplateId.JOKESTER_ENCOUNTER]: {
      content: {
        title: "🎭 A Traveling Jokester",
        description: "A colorful performer juggles while telling terrible puns to a small crowd.",
        character: { name: "Bobo the Entertainer", emoji: "🎭" },
        dialogue: "Why don't skeletons fight each other? They don't have the guts! *slaps knee*"
      },
      actions: [
        {
          id: SocialActionId.LAUGH_AT_JOKE,
          label: "Laugh Heartily",
          emoji: "😂",
          execute: api.social.functions.laughAtJoke
        },
        {
          id: SocialActionId.GROAN_AT_JOKE,
          label: "Groan Dramatically",
          emoji: "🙄",
          execute: api.social.functions.groanAtJoke
        },
        {
          id: SocialActionId.TELL_JOKE,
          label: "Tell Your Own Joke",
          emoji: "🎪",
          execute: api.social.functions.tellJoke
        },
        {
          id: SocialActionId.WALK_AWAY,
          label: "Walk Away",
          emoji: "🚶",
          execute: null // End encounter
        }
      ]
    },

    [SocialTemplateId.RIDDLER_ENCOUNTER]: {
      content: {
        title: "🧙 A Mysterious Riddler",
        description: "An old sage sits cross-legged beneath a gnarled tree, eyes twinkling with mischief.",
        character: { name: "Sage Puzzleton", emoji: "🧙" },
        dialogue: "I speak without a mouth and hear without ears. Have no body, but come alive with the wind. What am I?"
      },
      actions: [
        {
          id: SocialActionId.THINK_ABOUT_RIDDLE,
          label: "Think Carefully",
          emoji: "🤔",
          execute: api.social.functions.thinkAboutRiddle
        },
        {
          id: SocialActionId.GIVE_UP_ON_RIDDLE,
          label: "That's Too Hard!",
          emoji: "😤",
          execute: api.social.functions.giveUpOnRiddle
        },
        {
          id: SocialActionId.ANSWER_RIDDLE,
          label: "An Echo!",
          emoji: "💭",
          execute: api.social.functions.answerRiddle
        },
        {
          id: SocialActionId.WALK_AWAY,
          label: "Not Interested",
          emoji: "🚶",
          execute: null
        }
      ]
    },

    [SocialTemplateId.GOSSIP_MERCHANT]: {
      content: {
        title: "🛒 A Chatty Merchant",
        description: "A well-dressed trader arranges colorful wares while eagerly scanning for someone to talk to.",
        character: { name: "Gabby McTalk", emoji: "🛒" },
        dialogue: "Psst! Did you hear about the baker's daughter and the blacksmith's son? Oh, the DRAMA!"
      },
      actions: [
        {
          id: SocialActionId.LISTEN_TO_GOSSIP,
          label: "Listen Intently",
          emoji: "👂",
          execute: api.social.functions.listenToGossip
        },
        {
          id: SocialActionId.REJECT_GOSSIP,
          label: "Not Interested in Gossip",
          emoji: "🤐",
          execute: api.social.functions.rejectGossip
        },
        {
          id: SocialActionId.SHARE_GOSSIP,
          label: "Share Your Own News",
          emoji: "🗣️",
          execute: api.social.functions.shareGossip
        },
        {
          id: SocialActionId.WALK_AWAY,
          label: "Keep Moving",
          emoji: "🚶",
          execute: null
        }
      ]
    },

    // ... other encounter templates follow same pattern
  }
}
```

#### Sample Social Encounters

##### 1. Jokester Encounter Content
```typescript
// Template content (static data)
{
  title: "🎭 A Traveling Jokester",
  description: "A colorful performer juggles while telling terrible puns to a small crowd.",
  character: { name: "Bobo the Entertainer", emoji: "🎭" },
  dialogue: "Why don't skeletons fight each other? They don't have the guts! *slaps knee*"
}

// Template actions (Array using id property)
[
  {
    id: SocialActionId.LAUGH_AT_JOKE,
    label: "Laugh Heartily",
    emoji: "😂",
    execute: api.social.functions.laughAtJoke
  },
  {
    id: SocialActionId.GROAN_AT_JOKE,
    label: "Groan Dramatically",
    emoji: "🙄",
    execute: api.social.functions.groanAtJoke
  },
  {
    id: SocialActionId.TELL_JOKE,
    label: "Tell Your Own Joke",
    emoji: "🎪",
    execute: api.social.functions.tellJoke
  },
  {
    id: SocialActionId.WALK_AWAY,
    label: "Walk Away",
    emoji: "🚶",
    execute: null
  }
]
```

**Outcomes**:
- **Positive**: +15 XP, "Good Sport" title, small coin reward
- **Negative**: +5 XP, "Honest Critic" title, jokester respects honesty
- **Participate**: +20 XP, "Fellow Entertainer" title, special item
- **Walk Away**: +0 XP, no rewards

#### Backend Functions - Return Response Templates

```typescript
// features/social/functions.ts - Functions return response template IDs
export const laughAtJoke = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Good Sport");
    return SocialTemplateId.SOCIAL_SUCCESS; // Returns template with no actions
  }
});

export const answerRiddle = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    const success = Math.random() > 0.3; // 70% success
    await awardXP(ctx, userId, success ? 25 : 10);
    return success ? SocialTemplateId.SOCIAL_SUCCESS : SocialTemplateId.SOCIAL_FAILURE;
  }
});

// ... other encounter-specific functions follow same pattern
```

#### Response Templates (No Actions = Terminal)

```typescript
// Terminal templates that end the encounter
{
  [SocialTemplateId.SOCIAL_SUCCESS]: {
    content: {
      title: "✨ Encounter Complete",
      description: "The encounter ends on a positive note. You feel enriched by the experience.",
      character: { name: "Narrator", emoji: "✨" }
    },
    actions: [] // No actions = encounter complete
  },

  [SocialTemplateId.SOCIAL_FAILURE]: {
    content: {
      title: "😅 Things Go Awry",
      description: "Well, that didn't go as planned. You learn from the experience anyway.",
      character: { name: "Narrator", emoji: "😅" }
    },
    actions: [] // No actions = encounter complete
  }
}
```

### 2. Combat Encounters 🚧 FUTURE

**Purpose**: Action-oriented conflicts showcasing the combat triangle system

**Implementation**: Deferred until combat system is built
- Requires full gear/stats/CR system integration
- Needs Might/Focus/Sage vs Armor/Evasion/Aegis mechanics
- Combat resolution logic and damage calculations
- Player stat progression to make encounters meaningful

**Future Sample Ideas**:
- Bandit Ambush (fight/negotiate/sneak/distract)
- Wild Wolf Pack (intimidate/dodge/magic/retreat)
- Rival Duelist (honorable duel/dirty tactics/verbal sparring/walk away)

### 3. Discovery Encounters ✅ DESIGNED

**Purpose**: Weird and whimsical environmental encounters that create delightful moments

#### Discovery Feature Template Set

```typescript
// features/discovery/types.ts - Template/action ID enums
export enum DiscoveryTemplateId {
  // Whimsical discoveries
  BUTTERFLY_CONFERENCE = "BUTTERFLY_CONFERENCE",
  UPSIDE_DOWN_PUDDLE = "UPSIDE_DOWN_PUDDLE",
  BOOK_HOUSE = "BOOK_HOUSE",
  BACKWARDS_TREE = "BACKWARDS_TREE",
  SINGING_ROCK = "SINGING_ROCK",
  CLOUD_GARDEN = "CLOUD_GARDEN",
  DANCING_MUSHROOMS = "DANCING_MUSHROOMS",
  MIRROR_MEADOW = "MIRROR_MEADOW",

  // Response templates
  DISCOVERY_DELIGHT = "DISCOVERY_DELIGHT",
  DISCOVERY_WONDER = "DISCOVERY_WONDER",
  DISCOVERY_MAGIC = "DISCOVERY_MAGIC"
}

// features/discovery/types.ts
export enum DiscoveryActionId {
  // Butterfly conference actions
  EAVESDROP_ON_BUTTERFLIES = "EAVESDROP_ON_BUTTERFLIES",
  JOIN_BUTTERFLY_DEBATE = "JOIN_BUTTERFLY_DEBATE",
  MEDIATE_BUTTERFLY_DISPUTE = "MEDIATE_BUTTERFLY_DISPUTE",

  // Puddle actions
  STICK_HAND_IN_PUDDLE = "STICK_HAND_IN_PUDDLE",
  DROP_COIN_IN_PUDDLE = "DROP_COIN_IN_PUDDLE",
  DRINK_FROM_PUDDLE = "DRINK_FROM_PUDDLE",

  // Book house actions
  KNOCK_ON_BOOK_DOOR = "KNOCK_ON_BOOK_DOOR",
  READ_THE_WALLS = "READ_THE_WALLS",
  BORROW_A_BOOK = "BORROW_A_BOOK",

  // Tree actions
  TOUCH_UPSIDE_ROOTS = "TOUCH_UPSIDE_ROOTS",
  DIG_BURIED_BRANCHES = "DIG_BURIED_BRANCHES",
  SIT_AND_CONTEMPLATE = "SIT_AND_CONTEMPLATE",

  // Universal
  WALK_AWAY = "WALK_AWAY"
}
```

#### Sample Discovery Encounters

##### 1. Butterfly Conference
```typescript
// Template content
{
  title: "🦋 A Butterfly Conference",
  description: "A circle of butterflies appears to be having a heated debate, gesticulating dramatically with their colorful wings.",
  environment: { type: "meadow", oddity: "butterfly politics" }
}

// Template actions
[
  {
    id: DiscoveryActionId.EAVESDROP_ON_BUTTERFLIES,
    label: "Eavesdrop Quietly",
    emoji: "👂",
    execute: api.discovery.functions.eavesdropOnButterflies
  },
  {
    id: DiscoveryActionId.JOIN_BUTTERFLY_DEBATE,
    label: "Join the Debate",
    emoji: "🗣️",
    execute: api.discovery.functions.joinButterflyDebate
  },
  {
    id: DiscoveryActionId.MEDIATE_BUTTERFLY_DISPUTE,
    label: "Offer to Mediate",
    emoji: "⚖️",
    execute: api.discovery.functions.mediateButterflyDispute
  },
  {
    id: DiscoveryActionId.WALK_AWAY,
    label: "Quietly Back Away",
    emoji: "🚶",
    execute: null
  }
]
```

**Outcomes**:
- **Eavesdrop**: +15 XP, "Butterfly Translator" title, learn Tuesday flower secret
- **Join Debate**: +20 XP, "Controversial Pollinator" title, butterfly allies
- **Mediate**: +25 XP, "Diplomatic Mediator" title, honorary wing status
- **Walk Away**: +5 XP, "Respectful Observer" title

##### 2. Upside-Down Puddle
```typescript
// Template content
{
  title: "🌈 An Impossible Puddle",
  description: "This puddle reflects the sky beneath it, but shows fish swimming lazily through fluffy white clouds.",
  environment: { type: "forest clearing", oddity: "dimensional anomaly" }
}

// Template actions
[
  {
    id: DiscoveryActionId.STICK_HAND_IN_PUDDLE,
    label: "Stick Hand In",
    emoji: "✋",
    execute: api.discovery.functions.stickHandInPuddle
  },
  {
    id: DiscoveryActionId.DROP_COIN_IN_PUDDLE,
    label: "Drop a Coin In",
    emoji: "🪙",
    execute: api.discovery.functions.dropCoinInPuddle
  },
  {
    id: DiscoveryActionId.DRINK_FROM_PUDDLE,
    label: "Take a Sip",
    emoji: "💧",
    execute: api.discovery.functions.drinkFromPuddle
  },
  {
    id: DiscoveryActionId.WALK_AWAY,
    label: "Too Weird for Me",
    emoji: "🚶",
    execute: null
  }
]
```

**Outcomes**:
- **Stick Hand**: +15 XP, "Cloud Toucher" title, confuse birds
- **Drop Coin**: +10 XP, "Fish Apologizer" title, politeness lesson
- **Drink**: +20 XP, "Rainbow Burper" title, colorful burps for 1 hour
- **Walk Away**: +0 XP, no effects

##### 3. House Made of Books
```typescript
// Template content
{
  title: "📚 A Literary Cottage",
  description: "A cozy cottage built entirely from stacked books. The door appears to be a particularly thick dictionary that creaks when the wind blows.",
  environment: { type: "enchanted forest", oddity: "sentient architecture" }
}

// Template actions
[
  {
    id: DiscoveryActionId.KNOCK_ON_BOOK_DOOR,
    label: "Knock Politely",
    emoji: "🚪",
    execute: api.discovery.functions.knockOnBookDoor
  },
  {
    id: DiscoveryActionId.READ_THE_WALLS,
    label: "Read the Walls",
    emoji: "📖",
    execute: api.discovery.functions.readTheWalls
  },
  {
    id: DiscoveryActionId.BORROW_A_BOOK,
    label: "Try to Borrow a Book",
    emoji: "📚",
    execute: api.discovery.functions.borrowABook
  },
  {
    id: DiscoveryActionId.WALK_AWAY,
    label: "Leave It in Peace",
    emoji: "🚶",
    execute: null
  }
]
```

**Outcomes**:
- **Knock**: +25 XP, "Library Guest" title, access to infinite books
- **Read Walls**: +15 XP, "House Historian" title, house friendship
- **Borrow Book**: +10 XP, "Polite Patron" title, edible business card
- **Walk Away**: +5 XP, "Literature Respecter" title

#### Discovery Philosophy

**Design Goals**:
- **Embrace the impossible** - logic doesn't apply here
- **Every choice is delightful** - no "wrong" answers, just different flavors of wonder
- **Whimsical consequences** - rainbow burps, butterfly politics, house friendships
- **Curiosity rewarded** - the more engaged you are, the more magical the outcome
- **Studio Ghibli moments** - encounters that feel like stumbling into a fairy tale

### 4. Puzzle Encounters ✅ DESIGNED

**Purpose**: Traditional brain teasers with personality and forgiving failure states

#### Puzzle Feature Template Set

```typescript
// features/puzzle/types.ts - Template/action ID enums
export enum PuzzleTemplateId {
  // Traditional puzzles with personality
  PICKY_MAGIC_DOOR = "PICKY_MAGIC_DOOR",
  ENCHANTED_NUMBER_STONES = "ENCHANTED_NUMBER_STONES",
  MIRROR_RIDDLE_GUARDIAN = "MIRROR_RIDDLE_GUARDIAN",
  CHATTY_LOCK_MECHANISM = "CHATTY_LOCK_MECHANISM",
  PHILOSOPHICAL_GARGOYLE = "PHILOSOPHICAL_GARGOYLE",
  MUSICAL_PATTERN_TILES = "MUSICAL_PATTERN_TILES",
  WORDPLAY_FOUNTAIN = "WORDPLAY_FOUNTAIN",
  LOGIC_CRYSTAL_ARRAY = "LOGIC_CRYSTAL_ARRAY",

  // Response templates
  PUZZLE_SUCCESS = "PUZZLE_SUCCESS",
  PUZZLE_CREATIVE = "PUZZLE_CREATIVE",
  PUZZLE_FAILURE = "PUZZLE_FAILURE"
}

// features/puzzle/types.ts
export enum PuzzleActionId {
  // Door actions
  ANSWER_WORM = "ANSWER_WORM",
  ANSWER_CREATIVELY = "ANSWER_CREATIVELY",
  ASK_FOR_HINT = "ASK_FOR_HINT",
  TRY_TO_FORCE = "TRY_TO_FORCE",

  // Number stones actions
  PRESS_SIX = "PRESS_SIX",
  PRESS_EIGHT = "PRESS_EIGHT",
  PRESS_RANDOM = "PRESS_RANDOM",
  ASK_PATTERN = "ASK_PATTERN",

  // Mirror actions
  ANSWER_KEYBOARD = "ANSWER_KEYBOARD",
  MAKE_WILD_GUESS = "MAKE_WILD_GUESS",
  ASK_FOR_CLUE = "ASK_FOR_CLUE",
  COMPLIMENT_MIRROR = "COMPLIMENT_MIRROR",

  // Lock actions
  TRY_COMBINATION = "TRY_COMBINATION",
  LISTEN_TO_CLICKS = "LISTEN_TO_CLICKS",
  TALK_TO_LOCK = "TALK_TO_LOCK",

  // Universal
  WALK_AWAY = "WALK_AWAY"
}
```

#### Sample Puzzle Encounters

##### 1. Picky Magic Door
```typescript
// Template content
{
  title: "🚪 A Finicky Magic Door",
  description: "This ornate door clears its throat importantly before speaking in perfect rhyme.",
  puzzle: {
    type: "completion",
    question: "I open for those who can complete my phrase: 'The early bird catches the ___'",
    difficulty: "easy"
  },
  character: { name: "Door McRhymerson", emoji: "🚪" },
  dialogue: "Ahem! I shall test your wit with my most clever verse!"
}

// Template actions
[
  {
    id: PuzzleActionId.ANSWER_WORM,
    label: "Answer: Worm",
    emoji: "🪱",
    execute: api.puzzle.functions.answerWorm
  },
  {
    id: PuzzleActionId.ANSWER_CREATIVELY,
    label: "Answer: Bus!",
    emoji: "🚌",
    execute: api.puzzle.functions.answerCreatively
  },
  {
    id: PuzzleActionId.ASK_FOR_HINT,
    label: "Ask for a Hint",
    emoji: "💡",
    execute: api.puzzle.functions.askForHint
  },
  {
    id: PuzzleActionId.TRY_TO_FORCE,
    label: "Try to Force It Open",
    emoji: "💪",
    execute: api.puzzle.functions.tryToForce
  },
  {
    id: PuzzleActionId.WALK_AWAY,
    label: "Not Worth It",
    emoji: "🚶",
    execute: null
  }
]
```

**Outcomes**:
- **Correct Answer**: +25 XP, "Riddle Solver" title, door opens proudly
- **Creative Answer**: +20 XP, "Creative Thinker" title, door is amused and opens anyway
- **Ask Hint**: +15 XP, "Wise Questioner" title, door gives helpful clue
- **Force**: +10 XP, "Determined Soul" title, door complains but opens
- **Walk Away**: +0 XP, door calls after you with easier riddles

##### 2. Enchanted Number Stones
```typescript
// Template content
{
  title: "🔢 Mystical Number Stones",
  description: "Three glowing stones hover in the air, displaying numbers: 2, 4, ?. The third stone hums expectantly.",
  puzzle: {
    type: "pattern",
    sequence: [2, 4, "?"],
    correctAnswer: 6,
    difficulty: "easy"
  },
  environment: { type: "ancient ruins", magic: "mathematical" }
}

// Template actions
[
  {
    id: PuzzleActionId.PRESS_SIX,
    label: "Press 6",
    emoji: "6️⃣",
    execute: api.puzzle.functions.pressSix
  },
  {
    id: PuzzleActionId.PRESS_EIGHT,
    label: "Press 8",
    emoji: "8️⃣",
    execute: api.puzzle.functions.pressEight
  },
  {
    id: PuzzleActionId.PRESS_RANDOM,
    label: "Press 42",
    emoji: "🎲",
    execute: api.puzzle.functions.pressRandom
  },
  {
    id: PuzzleActionId.ASK_PATTERN,
    label: "Ask What Pattern",
    emoji: "❓",
    execute: api.puzzle.functions.askPattern
  },
  {
    id: PuzzleActionId.WALK_AWAY,
    label: "Math is Hard",
    emoji: "🚶",
    execute: null
  }
]
```

**Outcomes**:
- **Correct (6)**: +25 XP, "Pattern Master" title, stones reveal hidden treasure
- **Wrong but Logical (8)**: +15 XP, "Math Enthusiast" title, stones appreciate the effort
- **Random (42)**: +20 XP, "Cosmic Comedian" title, stones laugh and reward creativity
- **Ask Pattern**: +10 XP, "Thoughtful Student" title, stones explain kindly
- **Walk Away**: +0 XP, stones call out easier problems

##### 3. Mirror Riddle Guardian
```typescript
// Template content
{
  title: "🪞 A Wise Mirror Guardian",
  description: "An ornate mirror shimmers with intelligence, its surface showing not your reflection but swirling words.",
  puzzle: {
    type: "riddle",
    question: "What has keys but no locks, space but no room, and you can enter but not go inside?",
    correctAnswer: "keyboard",
    difficulty: "medium"
  },
  character: { name: "Mirror of Mysteries", emoji: "🪞" },
  dialogue: "Gaze upon my riddle, seeker of wisdom..."
}

// Template actions
[
  {
    id: PuzzleActionId.ANSWER_KEYBOARD,
    label: "Answer: Keyboard",
    emoji: "⌨️",
    execute: api.puzzle.functions.answerKeyboard
  },
  {
    id: PuzzleActionId.MAKE_WILD_GUESS,
    label: "Answer: A Sandwich!",
    emoji: "🥪",
    execute: api.puzzle.functions.makeWildGuess
  },
  {
    id: PuzzleActionId.ASK_FOR_CLUE,
    label: "Ask for a Clue",
    emoji: "🔍",
    execute: api.puzzle.functions.askForClue
  },
  {
    id: PuzzleActionId.COMPLIMENT_MIRROR,
    label: "Compliment the Mirror",
    emoji: "🌟",
    execute: api.puzzle.functions.complimentMirror
  },
  {
    id: PuzzleActionId.WALK_AWAY,
    label: "Too Cryptic",
    emoji: "🚶",
    execute: null
  }
]
```

**Outcomes**:
- **Correct**: +30 XP, "Riddle Master" title, mirror grants wisdom
- **Wild Guess**: +15 XP, "Bold Guesser" title, mirror is entertained
- **Ask Clue**: +20 XP, "Strategic Thinker" title, mirror gives helpful hint
- **Compliment**: +10 XP, "Silver Tongue" title, mirror blushes and helps
- **Walk Away**: +5 XP, mirror offers easier riddles

#### Puzzle Philosophy

**Design Goals**:
- **Traditional brain teasers** - real riddles, patterns, and logic problems
- **Personality-driven presentation** - puzzles have character and charm
- **Forgiving failure** - wrong answers lead to humor, not punishment
- **Multiple engagement styles** - logical, creative, brute force, social
- **Encourage curiosity** - asking for help is rewarded, not penalized
- **Fun failure states** - being wrong should still feel entertaining

## Random Selection System

### Simple Encounter Selection

```typescript
// features/explore/functions.ts - Simple random selection
export const startRandomEncounter = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Simple array of all available encounters
    const allEncounters = [
      ...Object.values(SocialTemplateId),
      ...Object.values(DiscoveryTemplateId),
      ...Object.values(PuzzleTemplateId),
      // FUTURE: ...Object.values(CombatTemplateId), (requires combat system)
    ];

    // Simple random selection - no history, no weights
    const randomIndex = Math.floor(Math.random() * allEncounters.length);
    return allEncounters[randomIndex];
  }
});
```

## Implementation Plan

### Phase 1: Social Encounters (Current)
1. ✅ Design standardized social content model
2. 🚧 Implement social feature template set
3. 🚧 Create universal Discord renderer for social encounters
4. 🚧 Implement single `handleSocialChoice` function
5. 🚧 Create 12 social encounter content definitions

### Phase 2: Random Selection System
1. 🚧 Implement simple random encounter selection
2. 🚧 Integrate with `/explore` command

### Phase 3: Combat Encounter Integration (Future)
1. 🚧 Complete gear/stats/CR combat system implementation
2. 🚧 Design combat encounter templates
3. 🚧 Integrate combat mechanics with template engine
4. 🚧 Add combat encounters to random selection pool

### Phase 4: Balancing & Polish
1. 🚧 Add encounter variety within types
2. 🚧 Add special rare encounters

## Technical Integration

### Discord Command Structure
```typescript
// /explore command - uses universal template executor
async function handleExploreCommand(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;

  // Get random encounter template ID
  const templateId = await convex.query(api.explore.functions.startRandomEncounter, { userId });

  // Use existing universal template executor
  const response = await executeDiscordTemplate(templateId, userId, interaction);

  await interaction.reply(response);
}
```

### Content Creation Workflow
1. **Write encounter content** (just JSON/TypeScript objects)
2. **Add to encounter pool** (single line addition)
3. **Test encounter** (automatic Discord integration)
4. **No Discord code changes required**

## Success Metrics

**Engagement**:
- Players use `/explore` multiple times per session
- High completion rate for encounters (vs walking away)
- Positive feedback on humor/entertainment value

**Technical**:
- Fast content creation (new encounter in <30 minutes)
- Zero Discord code changes for new content
- Consistent UX across all encounter types

**Game Design**:
- Balanced encounter type distribution
- Players discover personality through choices
- Clear progression feedback (XP, titles, items)

---

*This design enables rapid content creation while maintaining consistent, entertaining player experiences across all encounter types.*