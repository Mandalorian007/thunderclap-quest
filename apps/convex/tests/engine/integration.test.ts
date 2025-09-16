// Engine integration test - validates complete template flow
import { expect, test, describe } from "vitest";
import { api } from "../../convex/_generated/api";
import { ProfileTemplateId } from "../../convex/features";
import { createTestInstance } from "../helpers/test-utils";

describe("Engine Integration Tests", () => {
  test("complete profile template flow", async () => {
    const t = createTestInstance();
    const userId = "integration-test-user";
    const displayName = "Integration Test User";

    // 1. Create test player
    await t.run(async (ctx) => {
      await ctx.db.insert("players", {
        userId,
        displayName,
        createdAt: Date.now(),
        lastActive: Date.now(),
        xp: 150,
        level: 2,
        titles: ["First Steps"],
        currentTitle: "First Steps",
      });
    });

    // 2. Test template registry
    const registryResult = await t.query(api.engine.core.getTemplateRegistry);
    expect(registryResult).toContain(ProfileTemplateId.PROFILE_DISPLAY);

    // 3. Test complete template execution
    const templateResult = await t.query(api.engine.core.executeTemplate, {
      templateId: ProfileTemplateId.PROFILE_DISPLAY,
      userId
    });

    // 4. Validate complete flow
    expect(templateResult.templateId).toBe(ProfileTemplateId.PROFILE_DISPLAY);
    expect(templateResult.isTerminal).toBe(true);
    expect(templateResult.content.displayName).toBe(displayName);
    expect(templateResult.content.level).toBe(2);
    expect(templateResult.content.xp).toBe(150);
    expect(templateResult.content.titles).toEqual(["First Steps"]);
  });
});