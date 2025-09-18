import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { SocialTemplateId } from "./types";
import { awardXPHelper, awardTitleHelper } from "../progression/functions";
import { ActionResult, XP_REWARD, TITLE_REWARD, RewardEntry } from "../../shared/rewards";
import { registerActionHelper } from "../../helpers/actionRegistry";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Action registry system - only helper functions are used for template actions

// Helper functions for action registry
export async function laughAtJokeHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 15, "social.laughAtJoke");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Good Sport");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Good Sport" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards }
  };
}

export async function groanAtJokeHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 5, "social.groanAtJoke");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Honest Critic");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Honest Critic" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_NEUTRAL,
    rewards: { rewards }
  };
}

export async function tellJokeHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 20, "social.tellJoke");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Fellow Entertainer");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Fellow Entertainer" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards }
  };
}

export async function thinkAboutRiddleHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 10, "social.thinkAboutRiddle");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Deep Thinker");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Deep Thinker" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_NEUTRAL,
    rewards: { rewards }
  };
}

export async function giveUpOnRiddleHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 5, "social.giveUpOnRiddle");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Humble Student");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Humble Student" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_FAILURE,
    rewards: { rewards }
  };
}

export async function answerRiddleHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 25, "social.answerRiddle");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Wise");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Wise" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards }
  };
}

export async function listenToGossipHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 15, "social.listenToGossip");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Listener");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Listener" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards }
  };
}

export async function rejectGossipHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 10, "social.rejectGossip");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Principled Person");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Principled Person" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_NEUTRAL,
    rewards: { rewards }
  };
}

export async function shareGossipHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 20, "social.shareGossip");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Social Butterfly");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Social Butterfly" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards }
  };
}

export async function apologizeToHermitHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 15, "social.apologizeToHermit");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Respectful Visitor");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Respectful Visitor" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards }
  };
}

export async function dismissHermitHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 5, "social.dismissHermit");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Independent Spirit");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Independent Spirit" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_FAILURE,
    rewards: { rewards }
  };
}

export async function askAboutOldDaysHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 20, "social.askAboutOldDays");
  const titleAwarded = await awardTitleHelper(ctx, userId, "History Enthusiast");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "History Enthusiast" });
  }

  return {
    nextTemplateId: SocialTemplateId.SOCIAL_SUCCESS,
    rewards: { rewards }
  };
}

// Register all social action helpers with template.action naming
registerActionHelper("JOKESTER_ENCOUNTER.LAUGH_AT_JOKE", laughAtJokeHelper);
registerActionHelper("JOKESTER_ENCOUNTER.GROAN_AT_JOKE", groanAtJokeHelper);
registerActionHelper("JOKESTER_ENCOUNTER.TELL_JOKE", tellJokeHelper);

registerActionHelper("RIDDLER_ENCOUNTER.THINK_ABOUT_RIDDLE", thinkAboutRiddleHelper);
registerActionHelper("RIDDLER_ENCOUNTER.GIVE_UP_ON_RIDDLE", giveUpOnRiddleHelper);
registerActionHelper("RIDDLER_ENCOUNTER.ANSWER_RIDDLE", answerRiddleHelper);

registerActionHelper("GOSSIP_MERCHANT.LISTEN_TO_GOSSIP", listenToGossipHelper);
registerActionHelper("GOSSIP_MERCHANT.REJECT_GOSSIP", rejectGossipHelper);
registerActionHelper("GOSSIP_MERCHANT.SHARE_GOSSIP", shareGossipHelper);

// Note: Hermit helpers created but no hermit template exists yet
registerActionHelper("HERMIT_ENCOUNTER.APOLOGIZE_TO_HERMIT", apologizeToHermitHelper);
registerActionHelper("HERMIT_ENCOUNTER.DISMISS_HERMIT", dismissHermitHelper);
registerActionHelper("HERMIT_ENCOUNTER.ASK_ABOUT_OLD_DAYS", askAboutOldDaysHelper);