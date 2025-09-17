import type { FeatureTemplateSet } from "../../engine/types";
import {
  laughAtJoke,
  groanAtJoke,
  tellJoke,
  thinkAboutRiddle,
  giveUpOnRiddle,
  answerRiddle,
  listenToGossip,
  rejectGossip,
  shareGossip
} from "./functions";
import { SocialTemplateId, SocialActionId } from "./types";

// Re-export types for external use
export { SocialTemplateId, SocialActionId };

// Social feature template set following engine template pattern
export const socialFeatureTemplateSet: FeatureTemplateSet<SocialTemplateId, SocialActionId> = {
  startTemplate: SocialTemplateId.JOKESTER_ENCOUNTER, // This will be selected randomly

  templates: {
    [SocialTemplateId.JOKESTER_ENCOUNTER]: {
      content: {
        title: "🎭 A Traveling Jokester",
        description: "A colorful performer juggles while telling terrible puns to a small crowd.",
        character: { name: "Bobo the Entertainer", emoji: "🎭" },
        dialogue: "Why don't skeletons fight each other? They don't have the guts! *slaps knee*"
      },
      actions: [
        {
          id: SocialActionId.LAUGH_AT_JOKE,
          label: "Laugh Heartily",
          execute: laughAtJoke
        },
        {
          id: SocialActionId.GROAN_AT_JOKE,
          label: "Groan Dramatically",
          execute: groanAtJoke
        },
        {
          id: SocialActionId.TELL_JOKE,
          label: "Tell Your Own Joke",
          execute: tellJoke
        },
        {
          id: SocialActionId.WALK_AWAY,
          label: "Walk Away",
          execute: null // End encounter
        }
      ]
    },

    [SocialTemplateId.RIDDLER_ENCOUNTER]: {
      content: {
        title: "🧙 A Mysterious Riddler",
        description: "An old sage sits cross-legged beneath a gnarled tree, eyes twinkling with mischief.",
        character: { name: "Sage Puzzleton", emoji: "🧙" },
        dialogue: "I speak without a mouth and hear without ears. Have no body, but come alive with the wind. What am I?"
      },
      actions: [
        {
          id: SocialActionId.THINK_ABOUT_RIDDLE,
          label: "Think Carefully",
          execute: thinkAboutRiddle
        },
        {
          id: SocialActionId.GIVE_UP_ON_RIDDLE,
          label: "That's Too Hard!",
          execute: giveUpOnRiddle
        },
        {
          id: SocialActionId.ANSWER_RIDDLE,
          label: "An Echo!",
          execute: answerRiddle
        },
        {
          id: SocialActionId.WALK_AWAY,
          label: "Not Interested",
          execute: null
        }
      ]
    },

    [SocialTemplateId.GOSSIP_MERCHANT]: {
      content: {
        title: "🛒 A Chatty Merchant",
        description: "A well-dressed trader arranges colorful wares while eagerly scanning for someone to talk to.",
        character: { name: "Gabby McTalk", emoji: "🛒" },
        dialogue: "Psst! Did you hear about the baker's daughter and the blacksmith's son? Oh, the DRAMA!"
      },
      actions: [
        {
          id: SocialActionId.LISTEN_TO_GOSSIP,
          label: "Listen Intently",
          execute: listenToGossip
        },
        {
          id: SocialActionId.REJECT_GOSSIP,
          label: "Not Interested in Gossip",
          execute: rejectGossip
        },
        {
          id: SocialActionId.SHARE_GOSSIP,
          label: "Share Your Own News",
          execute: shareGossip
        },
        {
          id: SocialActionId.WALK_AWAY,
          label: "Keep Moving",
          execute: null
        }
      ]
    },

    // Terminal templates that end encounters
    [SocialTemplateId.SOCIAL_SUCCESS]: {
      content: {
        title: "✨ Encounter Complete",
        description: "The encounter ends on a positive note. You feel enriched by the experience.",
        character: { name: "Narrator", emoji: "✨" }
      },
      actions: [] // Empty array = terminal template
    },

    [SocialTemplateId.SOCIAL_FAILURE]: {
      content: {
        title: "😅 Things Go Awry",
        description: "Well, that didn't go as planned. You learn from the experience anyway.",
        character: { name: "Narrator", emoji: "😅" }
      },
      actions: [] // Empty array = terminal template
    },

    [SocialTemplateId.SOCIAL_NEUTRAL]: {
      content: {
        title: "🤝 A Pleasant Exchange",
        description: "The interaction was brief but pleasant. You both part ways with a smile.",
        character: { name: "Narrator", emoji: "🤝" }
      },
      actions: [] // Empty array = terminal template
    }
  }
};