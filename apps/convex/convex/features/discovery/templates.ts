import type { FeatureTemplateSet } from "../../engine/types";
import {
  eavesdropOnButterfliesHelper,
  joinButterflyDebateHelper,
  mediateButterflyDisputeHelper,
  stickHandInPuddleHelper,
  dropCoinInPuddleHelper,
  drinkFromPuddleHelper,
  knockOnBookDoorHelper,
  readTheWallsHelper,
  borrowABookHelper
} from "./functions";
import { DiscoveryTemplateId, DiscoveryActionId } from "./types";

// Re-export for external use
export { DiscoveryTemplateId, DiscoveryActionId };

// Discovery feature template set following engine template pattern
export const discoveryFeatureTemplateSet: FeatureTemplateSet<DiscoveryTemplateId, DiscoveryActionId> = {
  startTemplate: DiscoveryTemplateId.BUTTERFLY_CONFERENCE, // This will be selected randomly

  templates: {
    [DiscoveryTemplateId.BUTTERFLY_CONFERENCE]: {
      content: {
        title: "🦋 A Butterfly Conference",
        description: "A circle of butterflies appears to be having a heated debate, gesticulating dramatically with their colorful wings.",
        environment: { type: "meadow", oddity: "butterfly politics" }
      },
      actions: [
        {
          id: DiscoveryActionId.EAVESDROP_ON_BUTTERFLIES,
          label: "Eavesdrop Quietly",
          execute: eavesdropOnButterfliesHelper
        },
        {
          id: DiscoveryActionId.JOIN_BUTTERFLY_DEBATE,
          label: "Join the Debate",
          execute: joinButterflyDebateHelper
        },
        {
          id: DiscoveryActionId.MEDIATE_BUTTERFLY_DISPUTE,
          label: "Offer to Mediate",
          execute: mediateButterflyDisputeHelper
        },
        {
          id: DiscoveryActionId.WALK_AWAY,
          label: "Quietly Back Away",
          execute: null
        }
      ]
    },

    [DiscoveryTemplateId.UPSIDE_DOWN_PUDDLE]: {
      content: {
        title: "🌈 An Impossible Puddle",
        description: "This puddle reflects the sky beneath it, but shows fish swimming lazily through fluffy white clouds.",
        environment: { type: "forest clearing", oddity: "dimensional anomaly" }
      },
      actions: [
        {
          id: DiscoveryActionId.STICK_HAND_IN_PUDDLE,
          label: "Stick Hand In",
          execute: stickHandInPuddleHelper
        },
        {
          id: DiscoveryActionId.DROP_COIN_IN_PUDDLE,
          label: "Drop a Coin In",
          execute: dropCoinInPuddleHelper
        },
        {
          id: DiscoveryActionId.DRINK_FROM_PUDDLE,
          label: "Take a Sip",
          execute: drinkFromPuddleHelper
        },
        {
          id: DiscoveryActionId.WALK_AWAY,
          label: "Too Weird for Me",
          execute: null
        }
      ]
    },

    [DiscoveryTemplateId.BOOK_HOUSE]: {
      content: {
        title: "📚 A Literary Cottage",
        description: "A cozy cottage built entirely from stacked books. The door appears to be a particularly thick dictionary that creaks when the wind blows.",
        environment: { type: "enchanted forest", oddity: "sentient architecture" }
      },
      actions: [
        {
          id: DiscoveryActionId.KNOCK_ON_BOOK_DOOR,
          label: "Knock Politely",
          execute: knockOnBookDoorHelper
        },
        {
          id: DiscoveryActionId.READ_THE_WALLS,
          label: "Read the Walls",
          execute: readTheWallsHelper
        },
        {
          id: DiscoveryActionId.BORROW_A_BOOK,
          label: "Try to Borrow a Book",
          execute: borrowABookHelper
        },
        {
          id: DiscoveryActionId.WALK_AWAY,
          label: "Leave It in Peace",
          execute: null
        }
      ]
    },

    // Terminal templates that end encounters
    [DiscoveryTemplateId.DISCOVERY_DELIGHT]: {
      content: {
        title: "✨ Pure Delight",
        description: "This wonderful discovery fills you with joy and wonder at the magic of the world.",
        environment: { type: "magical", oddity: "happiness itself" }
      },
      actions: [] // No actions = encounter complete
    },

    [DiscoveryTemplateId.DISCOVERY_WONDER]: {
      content: {
        title: "🌟 Sense of Wonder",
        description: "You're left in awe by what you've experienced. The world feels more magical than before.",
        environment: { type: "mysterious", oddity: "expanded possibilities" }
      },
      actions: [] // No actions = encounter complete
    },

    [DiscoveryTemplateId.DISCOVERY_MAGIC]: {
      content: {
        title: "🎭 Magical Encounter",
        description: "Something truly extraordinary has happened. You feel touched by magic itself.",
        environment: { type: "otherworldly", oddity: "pure enchantment" }
      },
      actions: [] // No actions = encounter complete
    }
  }
};