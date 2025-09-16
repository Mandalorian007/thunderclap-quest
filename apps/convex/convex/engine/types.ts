import type { FunctionReference } from "convex/server";

// Core engine template types
export type EngineTemplate<TContent, TTemplateIds, TActionIds> = {
  content: TContent | FunctionReference<"query", "public", { userId: string }, TContent>;
  actions: Record<TActionIds, {
    label: string;
    execute: TTemplateIds | FunctionReference<"mutation", "public", { userId: string }, TTemplateIds | null> | null;
  }>;
};

export type FeatureTemplateSet<TTemplateIds, TActionIds> = {
  startTemplate: TTemplateIds;
  templates: Record<TTemplateIds, EngineTemplate<any, TTemplateIds, TActionIds>>;
};