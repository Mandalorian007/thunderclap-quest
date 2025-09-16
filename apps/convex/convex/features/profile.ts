// Profile feature registration - registers templates with the engine
import { registerFeatureTemplateSet } from "../engine/core";
import { profileFeatureTemplateSet } from "./profile/templates";

// Register this feature template set with the engine
registerFeatureTemplateSet(profileFeatureTemplateSet);

// Export all profile components for external use
export * from "./profile/index";