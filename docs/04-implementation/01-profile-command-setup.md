# Implementation Tracker: /profile Command Engine Setup

## Goal
Implement `/profile` command using the Engine Template Framework as the first template-based encounter, following [Engine Template Framework](../03-technical/engine-templates.md).

## Current State

### ✅ Foundation Complete
- Turborepo monorepo structure operational
- Zod + convex-helpers integration working
- PlayerSchema implemented matching documentation
- Core player CRUD functions (`getPlayer`, `createPlayer`)
- Testing framework configured

### 🔧 Implementation Needed
- Engine Template Framework core implementation
- Profile Feature Template Set with enum-based IDs
- Template engine execution and routing
- Discord bot template integration
- Engine-level testing for template functionality

## Implementation Phases

### Phase 1: Engine Template Framework Core
**Design Reference**: [Engine Template Framework](../03-technical/engine-templates.md)

**Core Components:**
1. **Template Engine**: Core execution and routing system
2. **Profile Feature Template Set**: Single-template encounter for profile display
3. **Template Resolution**: Static content and dynamic Convex functions

**Tasks:**
- [ ] Create `apps/convex/convex/engine/` directory structure
- [ ] Implement core `EngineTemplate` and `FeatureTemplateSet` types
- [ ] Create `executeTemplate` and `resolveContent` functions
- [ ] Build template registry and routing system
- [ ] Set up vertical slice structure for features

**Files to Create:**
- `apps/convex/convex/engine/types.ts` - Core template types
- `apps/convex/convex/engine/core.ts` - Template execution engine
- `apps/convex/convex/features/profile/types.ts` - Template/action ID enums
- `apps/convex/convex/features/profile/templates.ts` - Profile template definitions
- `apps/convex/convex/features/profile/functions.ts` - Profile business logic
- `apps/convex/convex/features/profile/schema.ts` - Profile data schemas
- `apps/convex/convex/features/profile/index.ts` - Profile feature exports

**Engine Flow (Pseudo Code):**
```
Template Engine Core:
1. registerTemplate(profileFeatureSet) -> adds to registry
2. executeTemplate(templateId, userId) -> resolves content + actions
3. resolveContent(content, userId) -> calls Convex functions if needed
4. routeAction(actionId) -> returns next template or completion
```

### Phase 2: Profile Feature Template Set
**Design Reference**: [Player System](../02-game-design/player-system.md) + [Engine Templates](../03-technical/engine-templates.md)

**Profile Template Design:**
1. **Single Template**: `PROFILE_DISPLAY` - Shows player stats
2. **No Actions**: Terminal template (profile viewing only)
3. **Dynamic Content**: Calls Convex functions for live data

**Tasks:**
- [ ] Create `ProfileTemplateId` and `ProfileActionId` enums
- [ ] Implement `profileFeatureTemplateSet` with single template
- [ ] Create `getPlayerProfileContent` helper function
- [ ] Handle player auto-creation within template system
- [ ] Set up profile feature vertical slice

**Files to Create (Vertical Slice Structure):**
- `apps/convex/convex/features/profile/templates.ts` - Template definitions and enums
- `apps/convex/convex/features/profile/functions.ts` - Profile data functions and helpers
- `apps/convex/convex/features/profile/schema.ts` - Player schema definition
- `apps/convex/convex/features/profile/index.ts` - Export all profile components

**Template Flow (Pseudo Code):**
```
Profile Feature Template Set:
ProfileTemplateId.PROFILE_DISPLAY -> {
  content: api.profile.functions.getPlayerProfileContent,
  actions: [] // Empty array = terminal template
}

getPlayerProfileContent(userId):
1. ensurePlayerExists(userId) -> createPlayer if needed
2. calculateProfileData(player) -> level, XP, titles, etc.
3. return formatted profile content
```

### Phase 3: Discord Bot Template Integration
**Design Reference**: [Architecture - Discord Bot Layer](../01-overview/architecture.md#1-discord-bot-layer-discordjs-frontend)

**Tasks:**
- [ ] Environment variables setup (Discord token, Convex URL)
- [ ] Discord.js client with template engine integration
- [ ] `/profile` command using template execution
- [ ] Discord embed generation from template content

**Files to Modify:**
- `apps/discord-bot/src/index.ts`
- `apps/discord-bot/package.json` (add dotenv)

**Discord Integration Flow (Pseudo Code):**
```
Discord /profile Command:
1. userId = interaction.user.id
2. templateResult = await executeTemplate(ProfileTemplateId.PROFILE_DISPLAY, userId)
3. embed = createDiscordEmbed(templateResult.content)
4. interaction.reply({ embeds: [embed] })
```

### Phase 4: Testing & Validation
**Design Reference**: [Engine Testing Setup](../03-technical/engine-testing-setup.md)

**Tasks:**
- [ ] Engine tests for profile functionality
- [ ] Manual Discord testing in development server
- [ ] Performance validation (sub-500ms response target)
- [ ] Error case testing

**Files to Create:**
- `tests/features/profile.test.ts` - Profile feature tests

## Success Criteria

- [ ] `/profile` command returns accurate player data from Convex
- [ ] Rich Discord embed follows design specifications
- [ ] Graceful error handling for edge cases
- [ ] Engine tests pass with 100% coverage
- [ ] Manual testing confirms expected user experience

## Development Workflow

```bash
# Start development environment
cd apps/convex && pnpm dev     # Terminal 1
cd apps/discord-bot && pnpm dev   # Terminal 2

# Run tests
cd apps/convex && pnpm test
```

## Design Dependencies

This implementation directly depends on:
- [PlayerSchema](../02-game-design/player-system.md#database-schema-preview) - Data structure
- [Progression System](../02-game-design/player-system.md#progression-mechanics) - Level/XP calculations
- [Discord-Native Patterns](../01-overview/README.md#design-principles) - UI formatting

## Template Engine Foundation Result

By implementing `/profile` as the first template-based encounter, we establish:

**✅ Core Engine Components:**
- Template type definitions and routing
- Content resolution (static + dynamic Convex functions)
- Feature Template Set pattern with enum-based IDs
- Discord integration for template execution

**✅ Expansion Ready:**
Once profile template works, adding `/explore` becomes trivial:

**Future Template Addition (Pseudo Code):**
```
/explore Command:
1. Add ChestTemplateId enum + chestFeatureTemplateSet
2. Register chest templates in template registry
3. executeTemplate(ChestTemplateId.MYSTERIOUS_CHEST, userId)
4. Handle button interactions -> executeAction(actionId, userId)
5. Multi-step encounters work automatically
```

**Template Registry Pattern:**
```
templateRegistry = {
  [ProfileTemplateId.PROFILE_DISPLAY]: profileFeatureTemplateSet,
  [ChestTemplateId.MYSTERIOUS_CHEST]: chestFeatureTemplateSet,
  // Add more encounters easily
}
```

## Next Features After Completion

Following design roadmap:
1. Add gear display to profile (pending gear system implementation)
2. Title system with earning/selection mechanics
3. Enhanced XP curve formula implementation
4. Engine template framework for `/explore` command
5. Performance optimizations and caching