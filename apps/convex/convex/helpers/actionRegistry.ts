import { QueryCtx, MutationCtx } from "../_generated/server";
import type { ActionResult } from "../shared/rewards";

// Action helper function signature
export type ActionHelperFunction = (
  ctx: QueryCtx | MutationCtx,
  params: { userId: string }
) => Promise<ActionResult>;

// Global action registry
const actionRegistry = new Map<string, ActionHelperFunction>();

// Register an action helper function
export function registerActionHelper(actionId: string, helperFunction: ActionHelperFunction): void {
  actionRegistry.set(actionId, helperFunction);
}

// Get an action helper function
export function getActionHelper(actionId: string): ActionHelperFunction {
  const helper = actionRegistry.get(actionId);
  if (!helper) {
    throw new Error(`Action helper not found for: ${actionId}`);
  }
  return helper;
}

// Check if action exists
export function hasActionHelper(actionId: string): boolean {
  return actionRegistry.has(actionId);
}

// Get all registered action IDs (for debugging)
export function getRegisteredActionIds(): string[] {
  return Array.from(actionRegistry.keys());
}

// Clear registry (for testing)
export function clearActionRegistry(): void {
  actionRegistry.clear();
}