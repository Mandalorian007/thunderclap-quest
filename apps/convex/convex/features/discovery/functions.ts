import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { DiscoveryTemplateId } from "./types";
import { awardXPHelper, awardTitleHelper } from "../progression/functions";
import { ActionResult, XP_REWARD, TITLE_REWARD, RewardEntry } from "../../shared/rewards";
import { registerActionHelper } from "../../helpers/actionRegistry";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Action registry system - only helper functions are used for template actions

export async function eavesdropOnButterfliesHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 15, "discovery.eavesdropOnButterflies");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Butterfly Translator");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Butterfly Translator" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_WONDER,
    rewards: { rewards }
  };
}

export async function joinButterflyDebateHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 20, "discovery.joinButterflyDebate");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Controversial Pollinator");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Controversial Pollinator" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_WONDER,
    rewards: { rewards }
  };
}

export async function mediateButterflyDisputeHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 25, "discovery.mediateButterflyDispute");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Diplomat");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Diplomat" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_MAGIC,
    rewards: { rewards }
  };
}

export async function stickHandInPuddleHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 15, "discovery.stickHandInPuddle");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Brave");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Brave" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_MAGIC,
    rewards: { rewards }
  };
}

export async function dropCoinInPuddleHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 10, "discovery.dropCoinInPuddle");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Fish Apologizer");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Fish Apologizer" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_WONDER,
    rewards: { rewards }
  };
}

export async function drinkFromPuddleHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 20, "discovery.drinkFromPuddle");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Rainbow Burper");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Rainbow Burper" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_MAGIC,
    rewards: { rewards }
  };
}

export async function knockOnBookDoorHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 25, "discovery.knockOnBookDoor");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Polite");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Polite" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_DELIGHT,
    rewards: { rewards }
  };
}

export async function readTheWallsHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 15, "discovery.readTheWalls");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Scholar");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Scholar" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_WONDER,
    rewards: { rewards }
  };
}

export async function borrowABookHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
  const xpResult = await awardXPHelper(ctx, userId, 10, "discovery.borrowABook");
  const titleAwarded = await awardTitleHelper(ctx, userId, "Polite Patron");

  const rewards: RewardEntry[] = [
    { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
  ];

  if (titleAwarded) {
    rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Polite Patron" });
  }

  return {
    nextTemplateId: DiscoveryTemplateId.DISCOVERY_MAGIC,
    rewards: { rewards }
  };
}

// Register all discovery action helpers with template.action naming
registerActionHelper("BUTTERFLY_CONFERENCE.EAVESDROP_ON_BUTTERFLIES", eavesdropOnButterfliesHelper);
registerActionHelper("BUTTERFLY_CONFERENCE.JOIN_BUTTERFLY_DEBATE", joinButterflyDebateHelper);
registerActionHelper("BUTTERFLY_CONFERENCE.MEDIATE_BUTTERFLY_DISPUTE", mediateButterflyDisputeHelper);

registerActionHelper("UPSIDE_DOWN_PUDDLE.STICK_HAND_IN_PUDDLE", stickHandInPuddleHelper);
registerActionHelper("UPSIDE_DOWN_PUDDLE.DROP_COIN_IN_PUDDLE", dropCoinInPuddleHelper);
registerActionHelper("UPSIDE_DOWN_PUDDLE.DRINK_FROM_PUDDLE", drinkFromPuddleHelper);

registerActionHelper("BOOK_HOUSE.KNOCK_ON_BOOK_DOOR", knockOnBookDoorHelper);
registerActionHelper("BOOK_HOUSE.READ_THE_WALLS", readTheWallsHelper);
registerActionHelper("BOOK_HOUSE.BORROW_A_BOOK", borrowABookHelper);