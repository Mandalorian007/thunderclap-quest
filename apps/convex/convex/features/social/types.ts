// Define implemented social template IDs as enum
export enum SocialTemplateId {
  // Character-specific encounters (implemented)
  JOKESTER_ENCOUNTER = "JOKESTER_ENCOUNTER",
  RIDDLER_ENCOUNTER = "RIDDLER_ENCOUNTER",
  GOSSIP_MERCHANT = "GOSSIP_MERCHANT",

  // Response templates
  SOCIAL_SUCCESS = "SOCIAL_SUCCESS",
  SOCIAL_NEUTRAL = "SOCIAL_NEUTRAL",
  SOCIAL_FAILURE = "SOCIAL_FAILURE"
}

// Define all social action IDs as enum
export enum SocialActionId {
  // Jokester actions
  LAUGH_AT_JOKE = "LAUGH_AT_JOKE",
  GROAN_AT_JOKE = "GROAN_AT_JOKE",
  TELL_JOKE = "TELL_JOKE",

  // Riddler actions
  THINK_ABOUT_RIDDLE = "THINK_ABOUT_RIDDLE",
  GIVE_UP_ON_RIDDLE = "GIVE_UP_ON_RIDDLE",
  ANSWER_RIDDLE = "ANSWER_RIDDLE",

  // Gossip merchant actions
  LISTEN_TO_GOSSIP = "LISTEN_TO_GOSSIP",
  REJECT_GOSSIP = "REJECT_GOSSIP",
  SHARE_GOSSIP = "SHARE_GOSSIP",

  // Storyteller actions
  LISTEN_TO_TALE = "LISTEN_TO_TALE",
  REQUEST_SCARY_STORY = "REQUEST_SCARY_STORY",
  SHARE_YOUR_STORY = "SHARE_YOUR_STORY",

  // Universal
  WALK_AWAY = "WALK_AWAY"
}