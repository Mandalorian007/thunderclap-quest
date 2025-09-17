import { expect, test, describe } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createTestInstance } from "../../helpers/test-utils";

describe("Discovery Encounters Integration", () => {
  describe("butterfly conference workflow", () => {
    test("complete butterfly conference flow", async () => {
      const t = createTestInstance();
      const userId = "test-butterfly-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Nature Observer"
      });

      // Start butterfly conference
      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "BUTTERFLY_CONFERENCE",
        userId
      });

      // Verify template structure
      expect(template.templateId).toBe("BUTTERFLY_CONFERENCE");
      expect(template.content.title).toBe("🦋 A Butterfly Conference");
      expect(template.content.environment.type).toBe("meadow");
      expect(template.content.environment.oddity).toBe("butterfly politics");
      expect(template.isTerminal).toBe(false);

      // Verify available actions
      const actionIds = template.actions.map(a => a.id);
      expect(actionIds).toContain("EAVESDROP_ON_BUTTERFLIES");
      expect(actionIds).toContain("JOIN_BUTTERFLY_DEBATE");
      expect(actionIds).toContain("MEDIATE_BUTTERFLY_DISPUTE");
      expect(actionIds).toContain("WALK_AWAY");

      // Test eavesdropping
      const eavesdropResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "EAVESDROP_ON_BUTTERFLIES",
        userId
      });

      expect(eavesdropResult.nextTemplateId).toBe("DISCOVERY_WONDER");

      // Verify XP was awarded
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.xp).toBeGreaterThan(0);
    });

    test("joining butterfly debate", async () => {
      const t = createTestInstance();
      const userId = "test-butterfly-join";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Debate Enthusiast"
      });

      const joinResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "JOIN_BUTTERFLY_DEBATE",
        userId
      });

      // Should lead to delight or wonder
      expect(["DISCOVERY_DELIGHT", "DISCOVERY_WONDER"]).toContain(joinResult.nextTemplateId);
    });

    test("mediating butterfly dispute", async () => {
      const t = createTestInstance();
      const userId = "test-butterfly-mediate";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Peacemaker"
      });

      const mediateResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "MEDIATE_BUTTERFLY_DISPUTE",
        userId
      });

      expect(mediateResult.nextTemplateId).toBe("DISCOVERY_MAGIC");

      // Should award "Diplomat" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Diplomat");
    });
  });

  describe("upside-down puddle workflow", () => {
    test("complete puddle interaction flow", async () => {
      const t = createTestInstance();
      const userId = "test-puddle-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Curious Explorer"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "UPSIDE_DOWN_PUDDLE",
        userId
      });

      expect(template.content.title).toBe("🌈 An Impossible Puddle");
      expect(template.content.environment.type).toBe("forest clearing");
      expect(template.content.environment.oddity).toBe("dimensional anomaly");

      // Test sticking hand in puddle
      const handResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "UPSIDE_DOWN_PUDDLE",
        actionId: "STICK_HAND_IN_PUDDLE",
        userId
      });

      expect(handResult.nextTemplateId).toBe("DISCOVERY_MAGIC");

      // Check for "Brave" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Brave");
    });

    test("dropping coin in puddle", async () => {
      const t = createTestInstance();
      const userId = "test-puddle-coin";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Coin Tosser"
      });

      const coinResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "UPSIDE_DOWN_PUDDLE",
        actionId: "DROP_COIN_IN_PUDDLE",
        userId
      });

      expect(coinResult.nextTemplateId).toBe("DISCOVERY_WONDER");
    });

    test("drinking from puddle", async () => {
      const t = createTestInstance();
      const userId = "test-puddle-drink";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Risk Taker"
      });

      const drinkResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "UPSIDE_DOWN_PUDDLE",
        actionId: "DRINK_FROM_PUDDLE",
        userId
      });

      // Randomized magical outcome
      expect(["DISCOVERY_MAGIC", "DISCOVERY_DELIGHT"]).toContain(drinkResult.nextTemplateId);
    });
  });

  describe("book house workflow", () => {
    test("complete book house interaction flow", async () => {
      const t = createTestInstance();
      const userId = "test-book-house-flow";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Book Lover"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "BOOK_HOUSE",
        userId
      });

      expect(template.content.title).toBe("📚 A Literary Cottage");
      expect(template.content.environment.type).toBe("enchanted forest");
      expect(template.content.environment.oddity).toBe("sentient architecture");

      // Test knocking on door
      const knockResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "BOOK_HOUSE",
        actionId: "KNOCK_ON_BOOK_DOOR",
        userId
      });

      expect(knockResult.nextTemplateId).toBe("DISCOVERY_DELIGHT");

      // Check for "Polite" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Polite");
    });

    test("reading the walls", async () => {
      const t = createTestInstance();
      const userId = "test-read-walls";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Avid Reader"
      });

      const readResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "BOOK_HOUSE",
        actionId: "READ_THE_WALLS",
        userId
      });

      expect(readResult.nextTemplateId).toBe("DISCOVERY_WONDER");

      // Check for "Scholar" title
      const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });
      expect(profile.titles).toContain("Scholar");
    });

    test("borrowing a book", async () => {
      const t = createTestInstance();
      const userId = "test-borrow-book";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Borrower"
      });

      const borrowResult = await t.mutation(api.engine.core.executeAction, {
        templateId: "BOOK_HOUSE",
        actionId: "BORROW_A_BOOK",
        userId
      });

      // Randomized outcome based on politeness
      expect(["DISCOVERY_MAGIC", "DISCOVERY_WONDER"]).toContain(borrowResult.nextTemplateId);
    });
  });

  describe("discovery outcome templates", () => {
    test("discovery delight template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-delight-terminal";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Delight Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "DISCOVERY_DELIGHT",
        userId
      });

      expect(template.templateId).toBe("DISCOVERY_DELIGHT");
      expect(template.content.title).toBe("✨ Pure Delight");
      expect(template.content.environment.type).toBe("magical");
      expect(template.content.environment.oddity).toBe("happiness itself");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });

    test("discovery wonder template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-wonder-terminal";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Wonder Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "DISCOVERY_WONDER",
        userId
      });

      expect(template.content.title).toBe("🌟 Sense of Wonder");
      expect(template.content.environment.type).toBe("mysterious");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });

    test("discovery magic template is terminal", async () => {
      const t = createTestInstance();
      const userId = "test-magic-terminal";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "Magic Checker"
      });

      const template = await t.query(api.engine.core.executeTemplate, {
        templateId: "DISCOVERY_MAGIC",
        userId
      });

      expect(template.content.title).toBe("🎭 Magical Encounter");
      expect(template.content.environment.type).toBe("otherworldly");
      expect(template.content.environment.oddity).toBe("pure enchantment");
      expect(template.isTerminal).toBe(true);
      expect(template.actions).toEqual([]);
    });
  });

  describe("discovery rewards and progression", () => {
    test("discovery encounters award appropriate XP", async () => {
      const t = createTestInstance();
      const userId = "test-discovery-xp";

      await t.mutation(api.features.profile.functions.createPlayer, {
        userId,
        displayName: "XP Hunter"
      });

      const initialProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      // Complete a discovery action
      await t.mutation(api.engine.core.executeAction, {
        templateId: "BUTTERFLY_CONFERENCE",
        actionId: "EAVESDROP_ON_BUTTERFLIES",
        userId
      });

      const finalProfile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
        userId
      });

      expect(finalProfile.xp).toBeGreaterThan(initialProfile.xp);
      expect(finalProfile.xp - initialProfile.xp).toBeGreaterThanOrEqual(15); // Discovery XP amount
    });

    test("discovery encounters award unique titles", async () => {
      const t = createTestInstance();
      const discoveries = [
        { templateId: "BUTTERFLY_CONFERENCE", actionId: "MEDIATE_BUTTERFLY_DISPUTE", expectedTitle: "Diplomat" },
        { templateId: "UPSIDE_DOWN_PUDDLE", actionId: "STICK_HAND_IN_PUDDLE", expectedTitle: "Brave" },
        { templateId: "BOOK_HOUSE", actionId: "KNOCK_ON_BOOK_DOOR", expectedTitle: "Polite" },
        { templateId: "BOOK_HOUSE", actionId: "READ_THE_WALLS", expectedTitle: "Scholar" }
      ];

      for (const discovery of discoveries) {
        const userId = `test-title-${discovery.expectedTitle.toLowerCase()}`;

        await t.mutation(api.features.profile.functions.createPlayer, {
          userId,
          displayName: `${discovery.expectedTitle} Seeker`
        });

        await t.mutation(api.engine.core.executeAction, {
          templateId: discovery.templateId,
          actionId: discovery.actionId,
          userId
        });

        const profile = await t.query(api.features.profile.functions.getPlayerProfileContent, {
          userId
        });

        expect(profile.titles).toContain(discovery.expectedTitle);
      }
    });
  });
});