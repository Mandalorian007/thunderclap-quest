import { mutation, query } from "../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import type { TemplateExecutionResult, ActionExecutionResult, FeatureTemplateSet } from "./types";

// Import all features to register them
import "../features";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Template registry - will be populated by feature imports
const templateRegistry: Record<string, FeatureTemplateSet<any, any>> = {};

// Register a feature template set
export function registerFeatureTemplateSet<TTemplateIds extends string | number | symbol, TActionIds extends string | number | symbol>(
  featureTemplateSet: FeatureTemplateSet<TTemplateIds, TActionIds>
): void {
  Object.keys(featureTemplateSet.templates).forEach(templateId => {
    templateRegistry[templateId as string] = featureTemplateSet;
  });
}

// Get template by ID from registry
function getTemplate(templateId: string) {
  const featureSet = templateRegistry[templateId];
  if (!featureSet) {
    throw new Error(`Template ${templateId} not found in registry`);
  }

  const template = featureSet.templates[templateId as keyof typeof featureSet.templates];
  if (!template) {
    throw new Error(`Template ${templateId} not found in feature set`);
  }

  return template;
}

// Resolve template content (static or dynamic via Convex function)
export const resolveTemplateContent = zQuery({
  args: {
    content: z.any(), // Template content (object or function reference)
    userId: z.string()
  },
  handler: async (ctx, { content, userId }) => {
    // If content is a function reference, call it. Otherwise return as-is
    if (typeof content === 'function') {
      return await content(ctx, { userId });
    }
    return content;
  }
});

// Execute a template and return formatted result
export const executeTemplate = zQuery({
  args: {
    templateId: z.string(),
    userId: z.string()
  },
  handler: async (ctx, { templateId, userId }): Promise<TemplateExecutionResult> => {
    const template = getTemplate(templateId);

    // Resolve content
    let content;
    if (typeof template.content === 'function') {
      content = await template.content(ctx, { userId });
    } else {
      content = template.content;
    }

    // Format actions
    const actions = Object.entries(template.actions).map(([actionId, action]) => ({
      id: actionId,
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
    const template = getTemplate(templateId);
    const action = template.actions[actionId as keyof typeof template.actions];

    if (!action) {
      throw new Error(`Action ${actionId} not found in template ${templateId}`);
    }

    if (typeof action.execute === 'string') {
      // Static routing - return the template ID
      return { nextTemplateId: action.execute };
    } else if (action.execute === null) {
      // Explicit completion
      return { isComplete: true };
    } else {
      // Dynamic routing - call the function
      const nextTemplateId = await action.execute(ctx, { userId });
      return nextTemplateId
        ? { nextTemplateId }
        : { isComplete: true };
    }
  }
});

// Get template registry for debugging
export const getTemplateRegistry = zQuery({
  args: {},
  handler: async (ctx, {}) => {
    return Object.keys(templateRegistry);
  }
});