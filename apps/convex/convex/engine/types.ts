import type { FunctionReference, RegisteredMutation } from "convex/server";

// Core engine template types following the design from docs/03-technical/engine-templates.md

// Define a more specific function type that matches what Convex mutations actually return
export type TemplateActionFunction = RegisteredMutation<"public", { userId: string }, Promise<string | null>>;

export type EngineAction<TTemplateIds extends string | number | symbol, TActionIds extends string | number | symbol> = {
  id: TActionIds;
  label: string;
  execute: TTemplateIds | TemplateActionFunction | FunctionReference<"mutation", "public", { userId: string }, TTemplateIds | null> | null;
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
};