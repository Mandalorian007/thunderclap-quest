import type { FunctionReference, RegisteredMutation } from "convex/server";
import type { RewardBundle } from "../shared/rewards";

// Core engine template types following the design from docs/03-technical/engine-templates.md

// Import ActionResult from shared rewards
import type { ActionResult } from "../shared/rewards";
import type { ActionHelperFunction } from "../helpers/actionRegistry";

// Define a more specific function type that matches what Convex mutations actually return
export type TemplateActionFunction = RegisteredMutation<"public", { userId: string }, Promise<string | null | ActionResult>>;

export type EngineAction<TTemplateIds extends string | number | symbol, TActionIds extends string | number | symbol> = {
  id: TActionIds;
  label: string;
  execute: TTemplateIds | string | null | ActionHelperFunction; // Now supports: template routing, action ID routing, completion, or helper function
};

export type EngineTemplate<TContent, TTemplateIds extends string | number | symbol, TActionIds extends string | number | symbol> = {
  content: TContent | FunctionReference<"query", "public", { userId: string }, TContent>;
  actions: EngineAction<TTemplateIds, TActionIds>[];
};

export type FeatureTemplateSet<TTemplateIds extends string | number | symbol, TActionIds extends string | number | symbol> = {
  startTemplate: TTemplateIds;
  templates: Record<TTemplateIds, EngineTemplate<any, TTemplateIds, TActionIds>>;
};

// Template execution result types
export type TemplateExecutionResult = {
  templateId: string;
  content: any;
  actions: Array<{
    id: string;
    label: string;
  }>;
  isTerminal: boolean; // true if no actions available
};

export type ActionExecutionResult = {
  nextTemplateId?: string;
  isComplete?: boolean;
  rewards?: RewardBundle;
};