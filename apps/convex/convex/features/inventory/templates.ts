import type { FeatureTemplateSet } from "../../engine/types";
import { InventoryTemplateId, InventoryActionId } from "./types";
import {
  getInventoryOverviewHelper,
  getGearInventoryHelper,
  getMaterialsInventoryHelper,
  getItemsInventoryHelper,
  salvageAllGearActionHelper
} from "./functions";

// Re-export types for external use
export { InventoryTemplateId, InventoryActionId };

// Complete inventory feature template set with hub-and-spoke navigation
export const inventoryFeatureTemplateSet: FeatureTemplateSet<InventoryTemplateId, InventoryActionId> = {
  startTemplate: InventoryTemplateId.INVENTORY_OVERVIEW,

  templates: {
    // MAIN HUB - navigate to sub-inventories
    [InventoryTemplateId.INVENTORY_OVERVIEW]: {
      content: getInventoryOverviewHelper,
      actions: [
        {
          id: InventoryActionId.VIEW_GEAR,
          label: "⚔️ Gear",
          execute: InventoryTemplateId.INVENTORY_GEAR
        },
        {
          id: InventoryActionId.VIEW_MATERIALS,
          label: "⛏️ Materials",
          execute: InventoryTemplateId.INVENTORY_MATERIALS
        },
        {
          id: InventoryActionId.VIEW_ITEMS,
          label: "📦 Items",
          execute: InventoryTemplateId.INVENTORY_ITEMS
        }
      ]
    },

    // GEAR TAB - view + cleanup
    [InventoryTemplateId.INVENTORY_GEAR]: {
      content: getGearInventoryHelper,
      actions: [
        {
          id: InventoryActionId.BACK_TO_OVERVIEW,
          label: "← Back",
          execute: InventoryTemplateId.INVENTORY_OVERVIEW
        },
        {
          id: InventoryActionId.SALVAGE_ALL_GEAR,
          label: "🔨 Salvage All",
          execute: salvageAllGearActionHelper
        }
      ]
    },

    // MATERIALS TAB - view only (for now)
    [InventoryTemplateId.INVENTORY_MATERIALS]: {
      content: getMaterialsInventoryHelper,
      actions: [
        {
          id: InventoryActionId.BACK_TO_OVERVIEW,
          label: "← Back",
          execute: InventoryTemplateId.INVENTORY_OVERVIEW
        }
      ]
    },

    // ITEMS TAB - view only (for now)
    [InventoryTemplateId.INVENTORY_ITEMS]: {
      content: getItemsInventoryHelper,
      actions: [
        {
          id: InventoryActionId.BACK_TO_OVERVIEW,
          label: "← Back",
          execute: InventoryTemplateId.INVENTORY_OVERVIEW
        }
      ]
    }
  }
};