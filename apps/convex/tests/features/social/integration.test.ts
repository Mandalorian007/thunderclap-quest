import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

describe("Social Encounters Integration", () => {
  describe("jokester encounter workflow", () => {
    test("complete jokester encounter flow", async () => {
      const t = createTestInstance();
      const userId = "test-jokester-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Joke Lover"
      });

      // Start jokester encounter
      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "JOKESTER_ENCOUNTER",
        userId
      });

      // Verify template structure
      expect(template.templateId).toBe("JOKESTER_ENCOUNTER");
      expect(template.content.title).toBe("🎭 A Traveling Jokester");
      expect(template.content.character.name).toBe("Bobo the Entertainer");
      expect(template.isTerminal).toBe(false);
      expect(template.actions.length).toBeGreaterThan(0);

      // Verify available actions
      const actionIds = template.actions.map(a => a.id);
      expect(actionIds).toContain("LAUGH_AT_JOKE");
      expect(actionIds).toContain("GROAN_AT_JOKE");
      expect(actionIds).toContain("TELL_JOKE");
      expect(actionIds).toContain("WALK_AWAY");

      // Test laughing at joke
      const laughResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "LAUGH_AT_JOKE",
        userId
      });

      // Should complete successfully and award XP
      expect(laughResult.nextTemplateId).toBe("SOCIAL_SUCCESS");

      // Verify XP was awarded
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.xp).toBeGreaterThan(0);
    });

    test("groaning at joke gives different outcome", async () => {
      const t = createTestInstance();
      const userId = "test-jokester-groan";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Groan Master"
      });

      // Groan at joke
      const groanResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "GROAN_AT_JOKE",
        userId
      });

      // Should lead to neutral outcome
      expect(groanResult.nextTemplateId).toBe("SOCIAL_NEUTRAL");
    });

    test("telling own joke can succeed or fail", async () => {
      const t = createTestInstance();
      const userId = "test-tell-joke";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Aspiring Comedian"
      });

      // Tell joke (randomized outcome)
      const jokeResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "JOKESTER_ENCOUNTER",
        actionId: "TELL_JOKE",
        userId
      });

      // Should lead to either success or failure
      expect(["SOCIAL_SUCCESS", "SOCIAL_FAILURE"]).toContain(jokeResult.nextTemplateId);
    });
  });

  describe("riddler encounter workflow", () => {
    test("complete riddler encounter flow", async () => {
      const t = createTestInstance();
      const userId = "test-riddler-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Riddle Solver"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "RIDDLER_ENCOUNTER",
        userId
      });

      expect(template.templateId).toBe("RIDDLER_ENCOUNTER");
      expect(template.content.title).toBe("🧙 A Mysterious Riddler");
      expect(template.content.character.name).toBe("Sage Puzzleton");

      // Verify riddle actions
      const actionIds = template.actions.map(a => a.id);
      expect(actionIds).toContain("THINK_ABOUT_RIDDLE");
      expect(actionIds).toContain("GIVE_UP_ON_RIDDLE");
      expect(actionIds).toContain("ANSWER_RIDDLE");
      expect(actionIds).toContain("WALK_AWAY");

      // Answer the riddle correctly
      const answerResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "RIDDLER_ENCOUNTER",
        actionId: "ANSWER_RIDDLE",
        userId
      });

      expect(answerResult.nextTemplateId).toBe("SOCIAL_SUCCESS");

      // Check for "Wise" title award
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Wise");
    });

    test("giving up on riddle", async () => {
      const t = createTestInstance();
      const userId = "test-give-up";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Quitter"
      });

      const giveUpResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "RIDDLER_ENCOUNTER",
        actionId: "GIVE_UP_ON_RIDDLE",
        userId
      });

      expect(giveUpResult.nextTemplateId).toBe("SOCIAL_FAILURE");
    });
  });

  describe("gossip merchant workflow", () => {
    test("complete gossip merchant flow", async () => {
      const t = createTestInstance();
      const userId = "test-gossip-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Gossip Enthusiast"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "GOSSIP_MERCHANT",
        userId
      });

      expect(template.content.title).toBe("🛒 A Chatty Merchant");
      expect(template.content.character.name).toBe("Gabby McTalk");

      // Test listening to gossip
      const listenResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "GOSSIP_MERCHANT",
        actionId: "LISTEN_TO_GOSSIP",
        userId
      });

      expect(listenResult.nextTemplateId).toBe("SOCIAL_SUCCESS");

      // Check for "Listener" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Listener");
    });

    test("rejecting gossip", async () => {
      const t = createTestInstance();
      const userId = "test-reject-gossip";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Noble Soul"
      });

      const rejectResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "GOSSIP_MERCHANT",
        actionId: "REJECT_GOSSIP",
        userId
      });

      expect(rejectResult.nextTemplateId).toBe("SOCIAL_NEUTRAL");
    });

    test("sharing own gossip", async () => {
      const t = createTestInstance();
      const userId = "test-share-gossip";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Chatty Person"
      });

      const shareResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "GOSSIP_MERCHANT",
        actionId: "SHARE_GOSSIP",
        userId
      });

      // Randomized outcome - success or neutral
      expect(["SOCIAL_SUCCESS", "SOCIAL_NEUTRAL"]).toContain(shareResult.nextTemplateId);
    });
  });

  describe("social outcome templates", () => {
    test("social success template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-success-terminal";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Success Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "SOCIAL_SUCCESS",
        userId
      });

      expect(template.templateId).toBe("SOCIAL_SUCCESS");
      expect(template.content.title).toBe("✨ Encounter Complete");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });

    test("social failure template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-failure-terminal";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Failure Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "SOCIAL_FAILURE",
        userId
      });

      expect(template.content.title).toBe("😅 Things Go Awry");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });

    test("social neutral template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-neutral-terminal";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Neutral Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "SOCIAL_NEUTRAL",
        userId
      });

      expect(template.content.title).toBe("🤝 A Pleasant Exchange");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });
  });
});