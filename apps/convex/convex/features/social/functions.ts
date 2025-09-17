import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { SocialTemplateId } from "./types";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Helper function to award XP to a player
async function awardXP(ctx: any, userId: string, xpAmount: number) {
  const player = await ctx.db
    .query("players")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (player) {
    await ctx.db.patch(player._id, {
      xp: player.xp + xpAmount,
      lastActive: Date.now()
    });
  }
}

// Helper function to award a title to a player
async function awardTitle(ctx: any, userId: string, title: string) {
  const player = await ctx.db
    .query("players")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();

  if (player && !player.titles.includes(title)) {
    await ctx.db.patch(player._id, {
      titles: [...player.titles, title],
      lastActive: Date.now()
    });
  }
}

// Jokester encounter actions
export const laughAtJoke = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Good Sport");
    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});

export const groanAtJoke = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 5);
    await awardTitle(ctx, userId, "Honest Critic");
    return SocialTemplateId.SOCIAL_NEUTRAL;
  }
});

export const tellJoke = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 20);
    await awardTitle(ctx, userId, "Fellow Entertainer");
    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});

// Riddler encounter actions
export const thinkAboutRiddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 10);
    await awardTitle(ctx, userId, "Deep Thinker");
    return SocialTemplateId.SOCIAL_NEUTRAL;
  }
});

export const giveUpOnRiddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 5);
    await awardTitle(ctx, userId, "Humble Student");
    return SocialTemplateId.SOCIAL_FAILURE;
  }
});

export const answerRiddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    // Always succeed for correct answer
    await awardXP(ctx, userId, 25);
    await awardTitle(ctx, userId, "Wise");
    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});

// Gossip merchant encounter actions
export const listenToGossip = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Listener");
    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});

export const rejectGossip = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 10);
    await awardTitle(ctx, userId, "Principled Person");
    return SocialTemplateId.SOCIAL_NEUTRAL;
  }
});

export const shareGossip = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 20);
    await awardTitle(ctx, userId, "Social Butterfly");
    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});

// Hermit encounter actions (placeholder implementations)
export const apologizeToHermit = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Respectful Visitor");
    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});

export const dismissHermit = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 5);
    await awardTitle(ctx, userId, "Independent Spirit");
    return SocialTemplateId.SOCIAL_FAILURE;
  }
});

export const askAboutOldDays = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<SocialTemplateId | null> => {
    await awardXP(ctx, userId, 20);
    await awardTitle(ctx, userId, "History Enthusiast");
    return SocialTemplateId.SOCIAL_SUCCESS;
  }
});