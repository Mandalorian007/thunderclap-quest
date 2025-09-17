// Social feature registration - registers templates with the engine
import { registerFeatureTemplateSet } from "../engine/core";
import { socialFeatureTemplateSet } from "./social/templates";

// Register this feature template set with the engine
registerFeatureTemplateSet(socialFeatureTemplateSet);

// Export all social components for external use
export * from "./social/index";