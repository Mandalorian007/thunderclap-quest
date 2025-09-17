import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

describe("Puzzle Encounters Integration", () => {
  describe("picky magic door workflow", () => {
    test("complete magic door flow", async () => {
      const t = createTestInstance();
      const userId = "test-door-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Door Challenger"
      });

      // Start magic door encounter
      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "PICKY_MAGIC_DOOR",
        userId
      });

      // Verify template structure
      expect(template.templateId).toBe("PICKY_MAGIC_DOOR");
      expect(template.content.title).toBe("🚪 A Finicky Magic Door");
      expect(template.content.character.name).toBe("Door McRhymerson");
      expect(template.content.puzzle.type).toBe("completion");
      expect(template.content.puzzle.difficulty).toBe("easy");
      expect(template.isTerminal).toBe(false);

      // Verify available actions
      const actionIds = template.actions.map(a => a.id);
      expect(actionIds).toContain("ANSWER_WORM");
      expect(actionIds).toContain("ANSWER_CREATIVELY");
      expect(actionIds).toContain("ASK_FOR_HINT");
      expect(actionIds).toContain("TRY_TO_FORCE");
      expect(actionIds).toContain("WALK_AWAY");

      // Test correct answer
      const correctResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "PICKY_MAGIC_DOOR",
        actionId: "ANSWER_WORM",
        userId
      });

      expect(correctResult.nextTemplateId).toBe("PUZZLE_SUCCESS");

      // Verify XP and title awarded
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.xp).toBeGreaterThan(0);
      expect(profile.titles).toContain("Clever");
    });

    test("creative answer to magic door", async () => {
      const t = createTestInstance();
      const userId = "test-door-creative";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Creative Thinker"
      });

      const creativeResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "PICKY_MAGIC_DOOR",
        actionId: "ANSWER_CREATIVELY",
        userId
      });

      expect(creativeResult.nextTemplateId).toBe("PUZZLE_CREATIVE");

      // Check for "Creative" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Creative");
    });

    test("asking for hint", async () => {
      const t = createTestInstance();
      const userId = "test-door-hint";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Help Seeker"
      });

      const hintResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "PICKY_MAGIC_DOOR",
        actionId: "ASK_FOR_HINT",
        userId
      });

      expect(hintResult.nextTemplateId).toBe("PUZZLE_SUCCESS");
    });

    test("trying to force door", async () => {
      const t = createTestInstance();
      const userId = "test-door-force";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Brute Force"
      });

      const forceResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "PICKY_MAGIC_DOOR",
        actionId: "TRY_TO_FORCE",
        userId
      });

      expect(forceResult.nextTemplateId).toBe("PUZZLE_FAILURE");
    });
  });

  describe("enchanted number stones workflow", () => {
    test("complete number stones flow", async () => {
      const t = createTestInstance();
      const userId = "test-stones-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Math Whiz"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "ENCHANTED_NUMBER_STONES",
        userId
      });

      expect(template.content.title).toBe("🔢 Mystical Number Stones");
      expect(template.content.character.name).toBe("Ancient Stones");
      expect(template.content.puzzle.type).toBe("pattern");
      expect(template.content.puzzle.question).toBe("What number comes next in the sequence: 2, 4, ?");

      // Test correct answer (6)
      const correctResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "ENCHANTED_NUMBER_STONES",
        actionId: "PRESS_SIX",
        userId
      });

      expect(correctResult.nextTemplateId).toBe("PUZZLE_SUCCESS");

      // Check for "Logical" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Logical");
    });

    test("wrong number answer", async () => {
      const t = createTestInstance();
      const userId = "test-stones-wrong";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Wrong Guesser"
      });

      const wrongResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "ENCHANTED_NUMBER_STONES",
        actionId: "PRESS_EIGHT",
        userId
      });

      expect(wrongResult.nextTemplateId).toBe("PUZZLE_FAILURE");
    });

    test("random number answer", async () => {
      const t = createTestInstance();
      const userId = "test-stones-random";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Random Guesser"
      });

      const randomResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "ENCHANTED_NUMBER_STONES",
        actionId: "PRESS_RANDOM",
        userId
      });

      expect(randomResult.nextTemplateId).toBe("PUZZLE_CREATIVE");

      // Check for "Spontaneous" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Spontaneous");
    });

    test("asking about pattern", async () => {
      const t = createTestInstance();
      const userId = "test-stones-pattern";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Pattern Seeker"
      });

      const patternResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "ENCHANTED_NUMBER_STONES",
        actionId: "ASK_PATTERN",
        userId
      });

      expect(patternResult.nextTemplateId).toBe("PUZZLE_SUCCESS");
    });
  });

  describe("mirror riddle guardian workflow", () => {
    test("complete mirror riddle flow", async () => {
      const t = createTestInstance();
      const userId = "test-mirror-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Riddle Master"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "MIRROR_RIDDLE_GUARDIAN",
        userId
      });

      expect(template.content.title).toBe("🪞 A Wise Mirror Guardian");
      expect(template.content.character.name).toBe("Mirror of Mysteries");
      expect(template.content.puzzle.type).toBe("riddle");
      expect(template.content.puzzle.difficulty).toBe("medium");

      // Test correct answer (keyboard)
      const correctResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "MIRROR_RIDDLE_GUARDIAN",
        actionId: "ANSWER_KEYBOARD",
        userId
      });

      expect(correctResult.nextTemplateId).toBe("PUZZLE_SUCCESS");

      // Check for "Wise" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Wise");
    });

    test("wild guess answer", async () => {
      const t = createTestInstance();
      const userId = "test-mirror-wild";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Wild Guesser"
      });

      const wildResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "MIRROR_RIDDLE_GUARDIAN",
        actionId: "MAKE_WILD_GUESS",
        userId
      });

      expect(wildResult.nextTemplateId).toBe("PUZZLE_CREATIVE");

      // Check for "Bold" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Bold");
    });

    test("asking for clue", async () => {
      const t = createTestInstance();
      const userId = "test-mirror-clue";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Clue Seeker"
      });

      const clueResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "MIRROR_RIDDLE_GUARDIAN",
        actionId: "ASK_FOR_CLUE",
        userId
      });

      expect(clueResult.nextTemplateId).toBe("PUZZLE_SUCCESS");
    });

    test("complimenting the mirror", async () => {
      const t = createTestInstance();
      const userId = "test-mirror-compliment";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Charmer"
      });

      const complimentResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "MIRROR_RIDDLE_GUARDIAN",
        actionId: "COMPLIMENT_MIRROR",
        userId
      });

      expect(complimentResult.nextTemplateId).toBe("PUZZLE_CREATIVE");

      // Check for "Charming" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Charming");
    });
  });

  describe("puzzle outcome templates", () => {
    test("puzzle success template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-puzzle-success";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Success Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "PUZZLE_SUCCESS",
        userId
      });

      expect(template.templateId).toBe("PUZZLE_SUCCESS");
      expect(template.content.title).toBe("🏆 Puzzle Solved!");
      expect(template.content.character.name).toBe("Victory");
      expect(template.content.puzzle.type).toBe("completed");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });

    test("puzzle creative template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-puzzle-creative";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Creative Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "PUZZLE_CREATIVE",
        userId
      });

      expect(template.content.title).toBe("💡 Creative Solution!");
      expect(template.content.character.name).toBe("Innovation");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });

    test("puzzle failure template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-puzzle-failure";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Failure Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "PUZZLE_FAILURE",
        userId
      });

      expect(template.content.title).toBe("🤔 Learning Experience");
      expect(template.content.character.name).toBe("Wisdom");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });
  });

  describe("puzzle rewards and progression", () => {
    test("puzzle encounters award appropriate XP", async () => {
      const t = createTestInstance();
      const userId = "test-puzzle-xp";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "XP Hunter"
      });

      const initialProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // Complete a puzzle correctly
      await t.mutation(api.engine.core.executeAction, {
        templateId: "PICKY_MAGIC_DOOR",
        actionId: "ANSWER_WORM",
        userId
      });

      const finalProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(finalProfile.xp).toBeGreaterThan(initialProfile.xp);
      expect(finalProfile.xp - initialProfile.xp).toBeGreaterThanOrEqual(25); // Puzzle XP amount
    });

    test("puzzle encounters award unique titles", async () => {
      const t = createTestInstance();
      const puzzles = [
        { templateId: "PICKY_MAGIC_DOOR", actionId: "ANSWER_WORM", expectedTitle: "Clever" },
        { templateId: "PICKY_MAGIC_DOOR", actionId: "ANSWER_CREATIVELY", expectedTitle: "Creative" },
        { templateId: "ENCHANTED_NUMBER_STONES", actionId: "PRESS_SIX", expectedTitle: "Logical" },
        { templateId: "ENCHANTED_NUMBER_STONES", actionId: "PRESS_RANDOM", expectedTitle: "Spontaneous" },
        { templateId: "MIRROR_RIDDLE_GUARDIAN", actionId: "ANSWER_KEYBOARD", expectedTitle: "Wise" },
        { templateId: "MIRROR_RIDDLE_GUARDIAN", actionId: "MAKE_WILD_GUESS", expectedTitle: "Bold" },
        { templateId: "MIRROR_RIDDLE_GUARDIAN", actionId: "COMPLIMENT_MIRROR", expectedTitle: "Charming" }
      ];

      for (const puzzle of puzzles) {
        const userId = `test-title-${puzzle.expectedTitle.toLowerCase()}-${Math.random()}`;

        await t.mutation(api.features.profile.functions.createPlayer, {
          userId,
          displayName: `${puzzle.expectedTitle} Seeker`
        });

        await t.mutation(api.engine.core.executeAction, {
          templateId: puzzle.templateId,
          actionId: puzzle.actionId,
          userId
        });

        const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
          userId
        });

        expect(profile.titles).toContain(puzzle.expectedTitle);
      }
    });

    test("creative solutions award bonus XP", async () => {
      const t = createTestInstance();
      const userId = "test-creative-bonus";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Creative Solver"
      });

      const initialProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // Use creative answer
      await t.mutation(api.engine.core.executeAction, {
        templateId: "PICKY_MAGIC_DOOR",
        actionId: "ANSWER_CREATIVELY",
        userId
      });

      const finalProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // Creative solutions should award more XP than regular correct answers
      expect(finalProfile.xp - initialProfile.xp).toBeGreaterThanOrEqual(30);
    });
  });
});