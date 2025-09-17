// Puzzle feature registration - registers templates with the engine
import { registerFeatureTemplateSet } from "../engine/core";
import { puzzleFeatureTemplateSet } from "./puzzle/templates";

// Register this feature template set with the engine
registerFeatureTemplateSet(puzzleFeatureTemplateSet);

// Export all puzzle components for external use
export * from "./puzzle/index";