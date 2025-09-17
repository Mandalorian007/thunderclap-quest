import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { DiscoveryTemplateId } from "./types";

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

// Butterfly conference encounter actions
export const eavesdropOnButterflies = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Butterfly Translator");
    return DiscoveryTemplateId.DISCOVERY_WONDER;
  }
});

export const joinButterflyDebate = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 20);
    await awardTitle(ctx, userId, "Controversial Pollinator");
    return DiscoveryTemplateId.DISCOVERY_WONDER;
  }
});

export const mediateButterflyDispute = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 25);
    await awardTitle(ctx, userId, "Diplomat");
    return DiscoveryTemplateId.DISCOVERY_MAGIC;
  }
});

// Upside-down puddle encounter actions
export const stickHandInPuddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Brave");
    return DiscoveryTemplateId.DISCOVERY_MAGIC;
  }
});

export const dropCoinInPuddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 10);
    await awardTitle(ctx, userId, "Fish Apologizer");
    return DiscoveryTemplateId.DISCOVERY_WONDER;
  }
});

export const drinkFromPuddle = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 20);
    await awardTitle(ctx, userId, "Rainbow Burper");
    return DiscoveryTemplateId.DISCOVERY_MAGIC;
  }
});

// Book house encounter actions
export const knockOnBookDoor = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 25);
    await awardTitle(ctx, userId, "Polite");
    return DiscoveryTemplateId.DISCOVERY_DELIGHT;
  }
});

export const readTheWalls = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Scholar");
    return DiscoveryTemplateId.DISCOVERY_WONDER;
  }
});

export const borrowABook = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<DiscoveryTemplateId | null> => {
    await awardXP(ctx, userId, 10);
    await awardTitle(ctx, userId, "Polite Patron");
    return DiscoveryTemplateId.DISCOVERY_MAGIC;
  }
});