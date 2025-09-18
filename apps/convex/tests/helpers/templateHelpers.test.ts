import { describe, it, expect, beforeEach } from "vitest";
import {
  initializeTemplateRegistry,
  registerFeatureTemplateSet,
  getTemplateFromRegistry,
  getTemplateRegistryKeys
} from "../../convex/helpers/templateHelpers";
import { registerActionHelper, clearActionRegistry } from "../../convex/helpers/actionRegistry";
import type { FeatureTemplateSet } from "../../convex/engine/types";
import type { ActionResult } from "../../convex/shared/rewards";

// Mock feature template set for testing
enum MockTemplateId {
  TEST_TEMPLATE = "TEST_TEMPLATE",
  TERMINAL_TEMPLATE = "TERMINAL_TEMPLATE"
}

enum MockActionId {
  TEST_ACTION = "TEST_ACTION",
  COMPLETE_ACTION = "COMPLETE_ACTION",
  HELPER_ACTION = "HELPER_ACTION"
}

// Mock helper function for testing
const mockHelperFunction = async (ctx: any, { userId }: { userId: string }): Promise<ActionResult> => {
  return {
    nextTemplateId: MockTemplateId.TERMINAL_TEMPLATE,
    rewards: {
      rewards: [
        { icon: "✨", amount: 100, name: "Test XP" }
      ]
    }
  };
};

const mockFeatureTemplateSet: FeatureTemplateSet<MockTemplateId, MockActionId> = {
  startTemplate: MockTemplateId.TEST_TEMPLATE,
  templates: {
    [MockTemplateId.TEST_TEMPLATE]: {
      content: {
        title: "Test Template",
        description: "A template for testing"
      },
      actions: [
        {
          id: MockActionId.TEST_ACTION,
          label: "Test Action",
          execute: MockTemplateId.TERMINAL_TEMPLATE // Static routing
        },
        {
          id: MockActionId.COMPLETE_ACTION,
          label: "Complete",
          execute: null // Completion
        },
        {
          id: MockActionId.HELPER_ACTION,
          label: "Helper Action",
          execute: mockHelperFunction // Helper function
        }
      ]
    },
    [MockTemplateId.TERMINAL_TEMPLATE]: {
      content: {
        title: "Complete",
        description: "Test completed"
      },
      actions: [] // Terminal template
    }
  }
};

describe("templateHelpers", () => {
  beforeEach(() => {
    // Reset registries before each test
    initializeTemplateRegistry();
    clearActionRegistry();
  });

  describe("template registry", () => {
    it("should initialize template registry", () => {
      initializeTemplateRegistry();
      const keys = getTemplateRegistryKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys).toEqual([]);
    });

    it("should register and manage feature template sets", () => {
      // Test registration
      registerFeatureTemplateSet(mockFeatureTemplateSet);
      const keys = getTemplateRegistryKeys();

      expect(keys).toContain(MockTemplateId.TEST_TEMPLATE);
      expect(keys).toContain(MockTemplateId.TERMINAL_TEMPLATE);

      // Test retrieval
      const template = getTemplateFromRegistry(MockTemplateId.TEST_TEMPLATE);
      expect(template.content.title).toBe("Test Template");
      expect(template.actions).toHaveLength(3);
      expect(template.actions[0].id).toBe(MockActionId.TEST_ACTION);
    });

    it("should throw error for missing template", () => {
      expect(() => {
        getTemplateFromRegistry("NONEXISTENT_TEMPLATE");
      }).toThrow("Template NONEXISTENT_TEMPLATE not found in registry");
    });

    it("should handle invalid feature template set", () => {
      // This should not throw, but should warn
      registerFeatureTemplateSet(null as any);
      const keys = getTemplateRegistryKeys();
      expect(keys).toEqual([]);
    });
  });

  describe("template content execution", () => {
    it("should return static content as-is", async () => {
      const staticContent = { title: "Static", description: "Test" };

      // Mock context
      const mockCtx = {};

      const { executeTemplateContent } = await import("../../convex/helpers/templateHelpers");
      const result = await executeTemplateContent(mockCtx as any, staticContent, "test-user");

      expect(result).toBe(staticContent);
    });

    it("should execute function content", async () => {
      const dynamicContent = async (ctx: any, { userId }: { userId: string }) => {
        return { title: "Dynamic", userId };
      };

      const mockCtx = {};

      const { executeTemplateContent } = await import("../../convex/helpers/templateHelpers");
      const result = await executeTemplateContent(mockCtx as any, dynamicContent, "test-user");

      expect(result.title).toBe("Dynamic");
      expect(result.userId).toBe("test-user");
    });
  });

  describe("template action execution", () => {
    beforeEach(() => {
      // Register the template set for these tests
      registerFeatureTemplateSet(mockFeatureTemplateSet);
    });

    it("should handle static routing", async () => {
      const mockCtx = {};

      const { executeTemplateAction } = await import("../../convex/helpers/templateHelpers");
      const result = await executeTemplateAction(
        mockCtx as any,
        MockTemplateId.TEST_TEMPLATE,
        MockActionId.TEST_ACTION,
        "test-user"
      );

      expect(result.nextTemplateId).toBe(MockTemplateId.TERMINAL_TEMPLATE);
      expect(result.isComplete).toBeUndefined();
    });

    it("should handle completion action", async () => {
      const mockCtx = {};

      const { executeTemplateAction } = await import("../../convex/helpers/templateHelpers");
      const result = await executeTemplateAction(
        mockCtx as any,
        MockTemplateId.TEST_TEMPLATE,
        MockActionId.COMPLETE_ACTION,
        "test-user"
      );

      expect(result.isComplete).toBe(true);
      expect(result.nextTemplateId).toBeUndefined();
    });

    it("should throw error for missing action", async () => {
      const mockCtx = {};

      const { executeTemplateAction } = await import("../../convex/helpers/templateHelpers");

      await expect(executeTemplateAction(
        mockCtx as any,
        MockTemplateId.TEST_TEMPLATE,
        "NONEXISTENT_ACTION" as any,
        "test-user"
      )).rejects.toThrow("Action NONEXISTENT_ACTION not found in template TEST_TEMPLATE");
    });

    it("should handle action registry helper functions", async () => {
      const mockCtx = {};

      // Register the helper function in the action registry
      registerActionHelper("TEST_TEMPLATE.HELPER_ACTION", mockHelperFunction);

      const { executeTemplateAction } = await import("../../convex/helpers/templateHelpers");
      const result = await executeTemplateAction(
        mockCtx as any,
        MockTemplateId.TEST_TEMPLATE,
        MockActionId.HELPER_ACTION,
        "test-user"
      );

      expect(result.nextTemplateId).toBe(MockTemplateId.TERMINAL_TEMPLATE);
      expect(result.isComplete).toBe(false);
      expect(result.rewards).toBeDefined();
      expect(result.rewards!.rewards).toHaveLength(1);
      expect(result.rewards!.rewards[0].name).toBe("Test XP");
      expect(result.rewards!.rewards[0].amount).toBe(100);
    });

    it("should throw error when no helper is registered", async () => {
      const mockCtx = {};

      // Don't register the helper - should throw error
      const { executeTemplateAction } = await import("../../convex/helpers/templateHelpers");

      const result = await executeTemplateAction(
        mockCtx as any,
        MockTemplateId.TEST_TEMPLATE,
        MockActionId.HELPER_ACTION,
        "test-user"
      );

      // Should return completion due to error handling
      expect(result.isComplete).toBe(true);
      expect(result.nextTemplateId).toBeUndefined();
    });
  });
});