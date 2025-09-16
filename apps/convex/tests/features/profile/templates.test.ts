import { expect, test, describe } from "vitest";
import { ProfileTemplateId, ProfileActionId, profileFeatureTemplateSet } from "../../../convex/features/profile/templates";

describe("Profile Templates", () => {
  describe("ProfileTemplateId enum", () => {
    test("contains expected template IDs", () => {
      expect(ProfileTemplateId.PROFILE_DISPLAY).toBe("PROFILE_DISPLAY");
    });

    test("has correct number of templates", () => {
      const templateIds = Object.values(ProfileTemplateId);
      expect(templateIds).toHaveLength(1);
    });
  });

  describe("ProfileActionId enum", () => {
    test("is empty for terminal template", () => {
      const actionIds = Object.values(ProfileActionId);
      expect(actionIds).toHaveLength(0);
    });
  });

  describe("profileFeatureTemplateSet", () => {
    test("has correct start template", () => {
      expect(profileFeatureTemplateSet.startTemplate).toBe(ProfileTemplateId.PROFILE_DISPLAY);
    });

    test("contains all expected templates", () => {
      const templateKeys = Object.keys(profileFeatureTemplateSet.templates);
      expect(templateKeys).toEqual([ProfileTemplateId.PROFILE_DISPLAY]);
    });

    test("PROFILE_DISPLAY template has correct structure", () => {
      const template = profileFeatureTemplateSet.templates[ProfileTemplateId.PROFILE_DISPLAY];

      expect(template.content).toBeDefined();
      expect(typeof template.content).toBe("function");
      expect(template.actions).toBeDefined();
      expect(Object.keys(template.actions)).toHaveLength(0); // No actions = terminal
    });

    test("template actions object matches ProfileActionId enum", () => {
      const template = profileFeatureTemplateSet.templates[ProfileTemplateId.PROFILE_DISPLAY];
      const actionKeys = Object.keys(template.actions);
      const enumValues = Object.values(ProfileActionId);

      expect(actionKeys).toEqual(enumValues);
    });
  });

  describe("template type safety", () => {
    test("template IDs are strongly typed", () => {
      // This test ensures TypeScript compilation catches type errors
      const templateId: ProfileTemplateId = ProfileTemplateId.PROFILE_DISPLAY;
      const template = profileFeatureTemplateSet.templates[templateId];

      expect(template).toBeDefined();
    });

    test("action IDs are strongly typed", () => {
      // This test ensures TypeScript compilation catches type errors
      const template = profileFeatureTemplateSet.templates[ProfileTemplateId.PROFILE_DISPLAY];
      const actionIds = Object.keys(template.actions) as ProfileActionId[];

      // Should be empty array for profile template
      expect(actionIds).toEqual([]);
    });
  });

  describe("template content function signature", () => {
    test("content function accepts correct parameters", async () => {
      const template = profileFeatureTemplateSet.templates[ProfileTemplateId.PROFILE_DISPLAY];

      // Mock context and parameters
      const mockCtx = {
        db: {
          query: () => ({
            withIndex: () => ({
              first: () => Promise.resolve({
                userId: "test",
                displayName: "Test",
                xp: 100,
                level: 2,
                titles: [],
                currentTitle: undefined,
                createdAt: Date.now(),
                lastActive: Date.now()
              })
            })
          })
        }
      };

      const params = { userId: "test-user" };

      // Should not throw error when called with correct signature
      const result = await template.content(mockCtx, params);
      expect(result).toBeDefined();
      expect(result.displayName).toBe("Test");
      expect(result.level).toBe(2);
    });
  });
});