// Explore feature registration - registers templates with the engine
import { registerFeatureTemplateSet } from "../engine/core";
import { exploreFeatureTemplateSet } from "./explore/templates";

// Register this feature template set with the engine
registerFeatureTemplateSet(exploreFeatureTemplateSet);

// Export all explore components for external use
export * from "./explore/index";