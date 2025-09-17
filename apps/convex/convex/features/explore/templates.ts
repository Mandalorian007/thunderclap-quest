import type { FeatureTemplateSet } from "../../engine/types";

// Explore feature templates - entry point for all encounter types
// This feature primarily handles random selection routing to other features

export enum ExploreTemplateId {
  // This could be used for an explore menu/landing page if needed
  // For now, the explore command directly routes to random encounters
  PLACEHOLDER = "PLACEHOLDER"
}

export enum ExploreActionId {
  // No actions needed for this routing feature
}

// Minimal template set - the main logic is in the random selection function
export const exploreFeatureTemplateSet: FeatureTemplateSet<ExploreTemplateId, ExploreActionId> = {
  startTemplate: ExploreTemplateId.PLACEHOLDER,

  templates: {
    [ExploreTemplateId.PLACEHOLDER]: {
      content: {
        title: "Placeholder Explore Template",
        description: "This is a placeholder until encounter features are implemented."
      },
      actions: []
    }
  }
};