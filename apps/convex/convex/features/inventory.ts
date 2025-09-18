// Inventory feature registration - registers templates with the engine
import { registerFeatureTemplateSet } from "../engine/core";
import { inventoryFeatureTemplateSet } from "./inventory/templates";

// Register this feature template set with the engine
registerFeatureTemplateSet(inventoryFeatureTemplateSet);

// Export all inventory components for external use
export * from "./inventory/index";