# Discord RPG Bot - Concept Document

## Core Vision
A lightweight RPG experience that lives entirely in Discord. Players engage through simple slash commands, receive immediate feedback with text and emojis, and progress through bite-sized encounters. Focus on trivial implementation, instant gratification, and future expandability.

## Design Principles
- **Player Agency**: Every encounter offers meaningful choices that feel impactful
- **Emergent Stories**: Choices create unique narrative moments and consequences  
- **Immediate Engagement**: Rich flavor text and contextual options hook attention
- **Replayability**: Variety in encounters and outcomes drives natural curiosity
- **Discord-Native**: Leverage Discord's UI patterns (buttons, embeds) for seamless experience

## Core Game Loop
```
/explore → Interactive Encounter → Player Choice → Consequence → Reward/Story
    ↓
Player sees unique outcome → Curious about next encounter
    ↓
Variety and humor drive natural return visits
```

## MVP Feature Set

### `/explore` - Primary Engagement
**Purpose**: Core action that drives all gameplay through meaningful player choices

**Encounter Types**:
- **Social**: NPCs with dialogue trees ("Chatty merchant", "Lost traveler", "Wise hermit")
- **Combat**: Action-oriented conflicts ("Bandits", "Wild beasts", "Rival adventurer")  
- **Discovery**: Environmental interactions ("Mysterious chest", "Ancient rune", "Hidden path")
- **Puzzle**: Simple brain teasers ("Riddle sphinx", "Magic door", "Talking statue")

**Interaction Flow**:
1. Player executes `/explore`
2. System presents encounter with rich flavor text
3. Player chooses from 2-4 contextual buttons
4. Choice leads to immediate consequence + follow-up options OR resolution
5. Outcome includes story progression + mechanical rewards

**Choice Examples**:
- **NPC Encounter**: [Chat] [Trade] [Help] [Ignore]
- **Bandit Ambush**: [Fight] [Negotiate] [Sneak Past] [Distract]
- **Mysterious Chest**: [Open Carefully] [Smash Open] [Examine First] [Walk Away]

### `/profile` - Progress Visualization
**Purpose**: Quick personal progress check

**Display Elements**:
- Player name and current level
- Experience points (current/next level)
- Coin balance
- Earned titles/achievements (humor-focused flair)

### `/inventory` - Collection Management
**Purpose**: Show accumulated items and resources

**Display Elements**:
- Item list with emoji representations
- Item quantities
- Total coin count

### `/quests` - Retention Mechanism
**Purpose**: Provide daily/weekly engagement hooks

**Functionality**:
- 1-3 simple objectives ("Explore 3 times", "Win 1 duel")
- One-click reward claiming via buttons
- Auto-refresh on completion

## Related Documentation

- **[Technical Architecture](architecture.md)** - System design and tech stack details
- **[02-game-design/](../02-game-design/)** - Player progression, combat mechanics, and gear systems
- **[03-technical/](../03-technical/)** - Implementation frameworks and authentication patterns

## Sample Interaction Flows

### Social Encounter
```
User: /explore
Bot: 🏪 A cheerful merchant waves from her colorful cart!
     "Greetings, traveler! Care to browse my wares?"
     [Chat] [Browse Goods] [Ask for Directions] [Walk Away]

User: [Chat]
Bot: 💬 "Oh, you're new around here! Let me tell you about the haunted 
     mill up north... they say it's full of treasure!"
     +5 XP, +1 Rumor: Haunted Mill
     [Ask More] [Thank Her] [Browse Goods]
```

### Combat Encounter
```
User: /explore  
Bot: ⚔️ Three bandits block the forest path!
     "Hand over your coins, or face our blades!"
     [Fight All Three] [Challenge Leader] [Offer Half Your Coins] [Attempt to Flee]

User: [Challenge Leader]
Bot: 🎯 You point at the biggest bandit: "Just you and me!"
     He grins and steps forward...
     [Quick Strike] [Defensive Stance] [Taunt Him] [Change Mind]
```

### Discovery Encounter
```
User: /explore
Bot: ✨ You discover an ancient stone archway covered in glowing runes!
     Strange whispers seem to echo from within...
     [Step Through] [Study the Runes] [Touch a Rune] [Mark Location & Leave]

User: [Study the Runes]
Bot: 📜 The symbols seem to shift as you watch... you recognize some!
     "Portal to... somewhere safe?" 
     +10 XP, +1 Ancient Knowledge
     [Risk Stepping Through] [Copy the Runes] [Leave Quickly]
```
