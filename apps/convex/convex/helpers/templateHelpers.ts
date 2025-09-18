import { QueryCtx, MutationCtx } from "../_generated/server";
import type { FeatureTemplateSet, ActionExecutionResult } from "../engine/types";
import type { ActionResult } from "../shared/rewards";
import { getActionHelper, hasActionHelper } from "./actionRegistry";

// Template registry management
let templateRegistry: Record<string, FeatureTemplateSet<any, any>> = {};

// Initialize registry
export function initializeTemplateRegistry() {
  templateRegistry = {};
}

// Register a feature template set
export function registerFeatureTemplateSet<TTemplateIds extends string | number | symbol, TActionIds extends string | number | symbol>(
  featureTemplateSet: FeatureTemplateSet<TTemplateIds, TActionIds>
): void {
  if (!featureTemplateSet || !featureTemplateSet.templates) {
    console.warn('Attempted to register invalid feature template set:', featureTemplateSet);
    return;
  }

  Object.keys(featureTemplateSet.templates).forEach(templateId => {
    const template = featureTemplateSet.templates[templateId as keyof typeof featureTemplateSet.templates];
    if (template) {
      templateRegistry[templateId as string] = featureTemplateSet;
    } else {
      console.warn(`Template ${templateId} is undefined in feature set`);
    }
  });
}

// Get template by ID from registry
export function getTemplateFromRegistry(templateId: string) {
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

// Get template registry for debugging
export function getTemplateRegistryKeys(): string[] {
  return Object.keys(templateRegistry);
}

// Execute template content (resolve if it's a function)
export async function executeTemplateContent(ctx: QueryCtx, content: any, userId: string) {
  if (typeof content === 'function') {
    return await content(ctx, { userId });
  }
  return content;
}

// Execute template action logic
export async function executeTemplateAction(
  ctx: MutationCtx,
  templateId: string,
  actionId: string,
  userId: string
): Promise<ActionExecutionResult> {
  const template = getTemplateFromRegistry(templateId);
  const action = template.actions.find(a => a.id === actionId);

  if (!action) {
    throw new Error(`Action ${actionId} not found in template ${templateId}`);
  }

  if (typeof action.execute === 'string' && action.execute !== 'ACTION_REGISTRY') {
    // Static routing - return the template ID
    return { nextTemplateId: action.execute };
  } else if (action.execute === null) {
    // Explicit completion
    return { isComplete: true };
  } else {
    // Dynamic routing - use action registry to get helper function
    try {
      // Check if this is a registered action helper
      const actionKey = `${templateId}.${actionId}`;
      if (hasActionHelper(actionKey)) {
        const helperFunction = getActionHelper(actionKey);
        const result = await helperFunction(ctx, { userId });

        // Convert ActionResult to ActionExecutionResult
        return {
          nextTemplateId: result.nextTemplateId || undefined,
          isComplete: !result.nextTemplateId,
          rewards: result.rewards
        };
      }

      // No fallback - all actions must be registered in the action registry
      throw new Error(`Action ${templateId}.${actionId} is not registered in the action registry. Please register a helper function using registerActionHelper("${templateId}.${actionId}", helperFunction).`);
    } catch (error) {
      console.error(`Template action execution error:`, error);
      return { isComplete: true };
    }
  }
}