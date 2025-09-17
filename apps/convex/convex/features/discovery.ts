// Discovery feature registration - registers templates with the engine
import { registerFeatureTemplateSet } from "../engine/core";
import { discoveryFeatureTemplateSet } from "./discovery/templates";

// Register this feature template set with the engine
registerFeatureTemplateSet(discoveryFeatureTemplateSet);

// Export all discovery components for external use
export * from "./discovery/index";