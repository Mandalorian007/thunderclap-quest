// Template and action ID enums for inventory feature
// This prevents circular imports between functions.ts and templates.ts

export enum InventoryTemplateId {
  INVENTORY_OVERVIEW = "INVENTORY_OVERVIEW",    // Main summary view
  INVENTORY_GEAR = "INVENTORY_GEAR",           // Gear management tab
  INVENTORY_MATERIALS = "INVENTORY_MATERIALS", // Materials tab
  INVENTORY_ITEMS = "INVENTORY_ITEMS"          // General items tab
}

export enum InventoryActionId {
  // Navigation
  VIEW_GEAR = "VIEW_GEAR",
  VIEW_MATERIALS = "VIEW_MATERIALS",
  VIEW_ITEMS = "VIEW_ITEMS",
  BACK_TO_OVERVIEW = "BACK_TO_OVERVIEW",

  // Inventory management
  SALVAGE_ALL_GEAR = "SALVAGE_ALL_GEAR"
}