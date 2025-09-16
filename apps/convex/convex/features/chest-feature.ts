import { api } from "../_generated/api";
import type { FeatureTemplateSet } from "../engine/types";

// Define all template IDs as enum
export enum ChestTemplateId {
  MYSTERIOUS_CHEST = "MYSTERIOUS_CHEST",
  CHEST_EXAMINED = "CHEST_EXAMINED",
  LOOT_SELECTION = "LOOT_SELECTION",
  ENCOUNTER_COMPLETE = "ENCOUNTER_COMPLETE"
}

// Define all action IDs as enum
export enum ChestActionId {
  EXAMINE = "EXAMINE",
  FORCE_OPEN = "FORCE_OPEN",
  DISARM = "DISARM",
  TRIGGER = "TRIGGER",
  STEP_BACK = "STEP_BACK",
  TAKE_ITEM = "TAKE_ITEM",
  TAKE_COINS = "TAKE_COINS",
  TAKE_ALL = "TAKE_ALL",
  DONE = "DONE",
  LEAVE = "LEAVE"
}

// Complete chest encounter flow with enum-based IDs
export const chestFeatureTemplateSet: FeatureTemplateSet<ChestTemplateId, ChestActionId> = {
  startTemplate: ChestTemplateId.MYSTERIOUS_CHEST,

  templates: {
    [ChestTemplateId.MYSTERIOUS_CHEST]: {
      content: {
        title: "A Mysterious Chest",
        description: "An ornate wooden chest sits before you, slightly ajar. Strange markings cover its surface.",
        chestType: "wooden",
        isLocked: false,
        trapSuspected: true
      },
      actions: {
        [ChestActionId.EXAMINE]: {
          label: "Examine Closely",
          execute: api.features.chest.examineChest
        },
        [ChestActionId.FORCE_OPEN]: {
          label: "Force Open",
          execute: api.features.chest.forceOpenChest
        },
        [ChestActionId.LEAVE]: {
          label: "Walk Away",
          execute: null // null = encounter complete
        }
      }
    },

    [ChestTemplateId.CHEST_EXAMINED]: {
      content: api.features.chest.getExamineResults,
      actions: {
        [ChestActionId.DISARM]: {
          label: "Disarm Trap",
          execute: api.features.chest.disarmTrap
        },
        [ChestActionId.TRIGGER]: {
          label: "Trigger Trap",
          execute: api.features.chest.triggerTrap
        },
        [ChestActionId.STEP_BACK]: {
          label: "Step Back",
          execute: ChestTemplateId.MYSTERIOUS_CHEST // Direct enum reference
        }
      }
    },

    [ChestTemplateId.LOOT_SELECTION]: {
      content: api.features.chest.getLootOptions,
      actions: {
        [ChestActionId.TAKE_ITEM]: {
          label: "Take Item",
          execute: api.features.chest.takeSpecificItem
        },
        [ChestActionId.TAKE_COINS]: {
          label: "Take Coins",
          execute: api.features.chest.takeCoins
        },
        [ChestActionId.TAKE_ALL]: {
          label: "Take Everything",
          execute: api.features.chest.takeAllItems
        },
        [ChestActionId.DONE]: {
          label: "Done",
          execute: null // completion
        }
      }
    },

    [ChestTemplateId.ENCOUNTER_COMPLETE]: {
      content: {
        title: "Encounter Complete",
        description: "You continue on your journey, wiser from the experience..."
      },
      actions: {} // No actions = terminal state
    }
  }
};