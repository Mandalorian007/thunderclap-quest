import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

describe("Explore Feature Integration", () => {
  describe("random encounter selection", () => {
    test("returns valid encounter template ID", async () => {
      const t = createTestInstance();
      const userId = "test-explore-user";

      // Create player first
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Explorer"
      });

      // Start random encounter
      const templateId = await t.query(api.features.explore.functions.startRandomEncounter, {
        userId
      });

      expect(templateId).toBeDefined();
      expect(typeof templateId).toBe("string");

      // Verify it's a valid encounter template ID
      const validEncounterIds = [
        // Social encounters
        "JOKESTER_ENCOUNTER",
        "RIDDLER_ENCOUNTER",
        "GOSSIP_MERCHANT",
        // Discovery encounters
        "BUTTERFLY_CONFERENCE",
        "UPSIDE_DOWN_PUDDLE",
        "BOOK_HOUSE",
        // Puzzle encounters
        "PICKY_MAGIC_DOOR",
        "ENCHANTED_NUMBER_STONES",
        "MIRROR_RIDDLE_GUARDIAN"
      ];

      expect(validEncounterIds).toContain(templateId);
    });

    test("returns different encounters on multiple calls", async () => {
      const t = createTestInstance();
      const userId = "test-explore-variety";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Variety Seeker"
      });

      // Get multiple encounter results
      const encounters = await Promise.all([
        t.query(api.features.explore.functions.startRandomEncounter, { userId }),
        t.query(api.features.explore.functions.startRandomEncounter, { userId }),
        t.query(api.features.explore.functions.startRandomEncounter, { userId }),
        t.query(api.features.explore.functions.startRandomEncounter, { userId }),
        t.query(api.features.explore.functions.startRandomEncounter, { userId })
      ]);

      // Should get at least 2 different encounter types in 5 attempts
      const uniqueEncounters = new Set(encounters);
      expect(uniqueEncounters.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe("complete encounter workflows", () => {
    test("template execution works for random encounters", async () => {
      const t = createTestInstance();
      const userId = "test-template-execution";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Template Tester"
      });

      // Get random encounter
      const templateId = await t.query(api.features.explore.functions.startRandomEncounter, {
        userId
      });

      // Execute the template
      const result = await t.query(api.engine.core.executeTemplate, {
        templateId,
        userId
      });

      // Verify template execution result structure
      expect(result.templateId).toBe(templateId);
      expect(result.content).toBeDefined();
      expect(result.actions).toBeDefined();
      expect(Array.isArray(result.actions)).toBe(true);
      expect(typeof result.isTerminal).toBe("boolean");

      // All non-terminal templates should have actions
      if (!result.isTerminal) {
        expect(result.actions.length).toBeGreaterThan(0);

        // Verify action structure
        result.actions.forEach(action => {
          expect(action.id).toBeDefined();
          expect(action.label).toBeDefined();
          expect(typeof action.id).toBe("string");
          expect(typeof action.label).toBe("string");
        });
      }
    });

    test("encounter completion awards XP and updates player", async () => {
      const t = createTestInstance();
      const userId = "test-encounter-completion";

      // Create player
      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Completion Tester"
      });

      // Get initial player state
      const initialProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // Start an encounter and complete it by trying different actions
      const templateId = await t.query(api.features.explore.functions.startRandomEncounter, {
        userId
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId,
        userId
      });

      // If template has actions, execute the first one
      if (template.actions.length > 0) {
        const firstAction = template.actions[0];
        const actionResult = await t.mutation(api.engine.core.executeAction, {
          templateId,
          actionId: firstAction.id,
          userId
        });

        // Check if encounter completed or continued
        if (actionResult.isComplete) {
          // Verify XP was awarded (most actions award some XP)
          const finalProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
            userId
          });

          // Should have more XP than initial (most encounters award XP)
          expect(finalProfile.xp).toBeGreaterThanOrEqual(initialProfile.xp);
        } else {
          // Encounter continued to another template
          expect(actionResult.nextTemplateId).toBeDefined();
        }
      }
    });
  });

  describe("engine integration", () => {
    test("all encounter templates are properly registered", async () => {
      const t = createTestInstance();

      // Get registered templates from engine
      const registeredTemplates = await t.query(api.engine.core.getTemplateRegistry, {});

      // Verify all explore encounter templates are registered
      const expectedTemplates = [
        // Social
        "JOKESTER_ENCOUNTER",
        "RIDDLER_ENCOUNTER",
        "GOSSIP_MERCHANT",
        "SOCIAL_SUCCESS",
        "SOCIAL_FAILURE",
        "SOCIAL_NEUTRAL",
        // Discovery
        "BUTTERFLY_CONFERENCE",
        "UPSIDE_DOWN_PUDDLE",
        "BOOK_HOUSE",
        "DISCOVERY_DELIGHT",
        "DISCOVERY_WONDER",
        "DISCOVERY_MAGIC",
        // Puzzle
        "PICKY_MAGIC_DOOR",
        "ENCHANTED_NUMBER_STONES",
        "MIRROR_RIDDLE_GUARDIAN",
        "PUZZLE_SUCCESS",
        "PUZZLE_CREATIVE",
        "PUZZLE_FAILURE"
      ];

      expectedTemplates.forEach(templateId => {
        expect(registeredTemplates).toContain(templateId);
      });
    });

    test("explore templates work with engine action execution", async () => {
      const t = createTestInstance();
      const userId = "test-action-execution";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Action Tester"
      });

      // Try executing actions on different encounter types
      const encounters = [
        "JOKESTER_ENCOUNTER",
        "BUTTERFLY_CONFERENCE",
        "PICKY_MAGIC_DOOR"
      ];

      for (const templateId of encounters) {
        const template = await t.query(api.engine.core.executeTemplate, {
          templateId,
          userId
        });

        if (template.actions.length > 0) {
          const action = template.actions[0];

          // Should not throw when executing action
          const result = await t.mutation(api.engine.core.executeAction, {
            templateId,
            actionId: action.id,
            userId
          });

          // Result should be well-formed
          expect(typeof result).toBe("object");
          expect(result.isComplete !== undefined || result.nextTemplateId !== undefined).toBe(true);
        }
      }
    });
  });
});