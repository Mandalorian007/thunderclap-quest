import type { FunctionReference } from "convex/server";

// Core engine template types following the design from docs/03-technical/engine-templates.md

export type EngineTemplate<TContent, TTemplateIds extends string | number | symbol, TActionIds extends string | number | symbol> = {
  content: TContent | FunctionReference<"query", "public", { userId: string }, TContent>;
  actions: Record<TActionIds, {
    label: string;
    execute: TTemplateIds | FunctionReference<"mutation", "public", { userId: string }, TTemplateIds | null> | null;
  }>;
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