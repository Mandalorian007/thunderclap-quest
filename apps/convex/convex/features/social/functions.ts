import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { SocialTemplateId } from "./types";
import { awardXPHelper, awardTitleHelper } from "../progression/functions";
import { ActionResult, XP_REWARD, TITLE_REWARD, RewardEntry } from "../../shared/rewards";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Helper functions now use the centralized progression system

// Jokester encounter actions
export const laughAtJoke = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const groanAtJoke = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const tellJoke = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

// Riddler encounter actions
export const thinkAboutRiddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const giveUpOnRiddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const answerRiddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    // Always succeed for correct answer
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
});

// Gossip merchant encounter actions
export const listenToGossip = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const rejectGossip = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const shareGossip = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

// Hermit encounter actions (placeholder implementations)
export const apologizeToHermit = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const dismissHermit = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});

export const askAboutOldDays = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
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
});