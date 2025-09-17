import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { PuzzleTemplateId } from "./types";

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

// Picky magic door encounter actions
export const answerWorm = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 25);
    await awardTitle(ctx, userId, "Clever");
    return PuzzleTemplateId.PUZZLE_SUCCESS;
  }
});

export const answerCreatively = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 30);
    await awardTitle(ctx, userId, "Creative");
    return PuzzleTemplateId.PUZZLE_CREATIVE;
  }
});

export const askForHint = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Wise Questioner");
    return PuzzleTemplateId.PUZZLE_SUCCESS;
  }
});

export const tryToForce = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 10);
    await awardTitle(ctx, userId, "Determined Soul");
    return PuzzleTemplateId.PUZZLE_FAILURE;
  }
});

// Enchanted number stones encounter actions
export const pressSix = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 25);
    await awardTitle(ctx, userId, "Logical");
    return PuzzleTemplateId.PUZZLE_SUCCESS;
  }
});

export const pressEight = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Math Enthusiast");
    return PuzzleTemplateId.PUZZLE_FAILURE;
  }
});

export const pressRandom = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 20);
    await awardTitle(ctx, userId, "Spontaneous");
    return PuzzleTemplateId.PUZZLE_CREATIVE;
  }
});

export const askPattern = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 10);
    await awardTitle(ctx, userId, "Thoughtful Student");
    return PuzzleTemplateId.PUZZLE_SUCCESS;
  }
});

// Mirror riddle guardian encounter actions
export const answerKeyboard = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 30);
    await awardTitle(ctx, userId, "Wise");
    return PuzzleTemplateId.PUZZLE_SUCCESS;
  }
});

export const makeWildGuess = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 15);
    await awardTitle(ctx, userId, "Bold");
    return PuzzleTemplateId.PUZZLE_CREATIVE;
  }
});

export const askForClue = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 20);
    await awardTitle(ctx, userId, "Strategic Thinker");
    return PuzzleTemplateId.PUZZLE_SUCCESS;
  }
});

export const complimentMirror = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<PuzzleTemplateId | null> => {
    await awardXP(ctx, userId, 10);
    await awardTitle(ctx, userId, "Charming");
    return PuzzleTemplateId.PUZZLE_CREATIVE;
  }
});