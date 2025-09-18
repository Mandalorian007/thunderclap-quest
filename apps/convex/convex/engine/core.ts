import { mutation, query } from "../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import type { TemplateExecutionResult, ActionExecutionResult } from "./types";
import {
  registerFeatureTemplateSet,
  getTemplateFromRegistry,
  getTemplateRegistryKeys,
  executeTemplateContent,
  executeTemplateAction
} from "../helpers/templateHelpers";

// Re-export for external use
export { registerFeatureTemplateSet };

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Resolve template content (static or dynamic via Convex function)
export const resolveTemplateContent = zQuery({
  args: {
    content: z.any(), // Template content (object or function reference)
    userId: z.string()
  },
  handler: async (ctx, { content, userId }) => {
    return await executeTemplateContent(ctx, content, userId);
  }
});

// Execute a template and return formatted result
export const executeTemplate = zQuery({
  args: {
    templateId: z.string(),
    userId: z.string(),
    rewards: z.any().optional() // Optional rewards to include in content
  },
  handler: async (ctx, { templateId, userId, rewards }): Promise<TemplateExecutionResult> => {
    const template = getTemplateFromRegistry(templateId);

    // Resolve content using helper
    let content = await executeTemplateContent(ctx, template.content, userId);

    // Add rewards to content if provided
    if (rewards) {
      content = {
        ...content,
        rewards
      };
    }

    // Format actions
    const actions = template.actions.map(action => ({
      id: action.id,
      label: action.label
    }));

    return {
      templateId,
      content,
      actions,
      isTerminal: actions.length === 0
    };
  }
});

// Execute a template action
export const executeAction = zMutation({
  args: {
    templateId: z.string(),
    actionId: z.string(),
    userId: z.string()
  },
  handler: async (ctx, { templateId, actionId, userId }): Promise<ActionExecutionResult> => {
    return await executeTemplateAction(ctx, templateId, actionId, userId);
  }
});

// Get template registry for debugging
export const getTemplateRegistry = zQuery({
  args: {},
  handler: async (ctx, {}) => {
    return getTemplateRegistryKeys();
  }
});

// Register all template sets at startup to avoid circular imports
import { profileFeatureTemplateSet } from '../features/profile/templates';
import { exploreFeatureTemplateSet } from '../features/explore/templates';
import { socialFeatureTemplateSet } from '../features/social/templates';
import { discoveryFeatureTemplateSet } from '../features/discovery/templates';
import { puzzleFeatureTemplateSet } from '../features/puzzle/templates';

// Import functions to trigger action helper registrations
import '../features/social/functions';
import '../features/discovery/functions';
import '../features/puzzle/functions';

registerFeatureTemplateSet(profileFeatureTemplateSet);
registerFeatureTemplateSet(exploreFeatureTemplateSet);
registerFeatureTemplateSet(socialFeatureTemplateSet);
registerFeatureTemplateSet(discoveryFeatureTemplateSet);
registerFeatureTemplateSet(puzzleFeatureTemplateSet);