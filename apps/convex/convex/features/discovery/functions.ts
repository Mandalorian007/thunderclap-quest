import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { DiscoveryTemplateId } from "./types";
import { awardXPHelper, awardTitleHelper } from "../progression/functions";
import { ActionResult, XP_REWARD, TITLE_REWARD, RewardEntry } from "../../shared/rewards";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Helper functions now use the centralized progression system

// Butterfly conference encounter actions
export const eavesdropOnButterflies = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const joinButterflyDebate = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const mediateButterflyDispute = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

// Upside-down puddle encounter actions
export const stickHandInPuddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const dropCoinInPuddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const drinkFromPuddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

// Book house encounter actions
export const knockOnBookDoor = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const readTheWalls = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const borrowABook = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});