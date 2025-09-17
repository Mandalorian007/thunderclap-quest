import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { PuzzleTemplateId } from "./types";
import { awardXPHelper, awardTitleHelper } from "../progression/functions";
import { ActionResult, XP_REWARD, TITLE_REWARD, RewardEntry } from "../../shared/rewards";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Helper functions now use the centralized progression system

// Picky magic door encounter actions
export const answerWorm = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 25, "puzzle.answerWorm");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Clever");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Clever" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_SUCCESS,
      rewards: { rewards }
    };
  }
});

export const answerCreatively = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 30, "puzzle.answerCreatively");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Creative");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Creative" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_CREATIVE,
      rewards: { rewards }
    };
  }
});

export const askForHint = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 15, "puzzle.askForHint");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Wise Questioner");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Wise Questioner" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_SUCCESS,
      rewards: { rewards }
    };
  }
});

export const tryToForce = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 10, "puzzle.tryToForce");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Determined Soul");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Determined Soul" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_FAILURE,
      rewards: { rewards }
    };
  }
});

// Enchanted number stones encounter actions
export const pressSix = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 25, "puzzle.pressSix");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Logical");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Logical" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_SUCCESS,
      rewards: { rewards }
    };
  }
});

export const pressEight = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 15, "puzzle.pressEight");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Math Enthusiast");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Math Enthusiast" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_FAILURE,
      rewards: { rewards }
    };
  }
});

export const pressRandom = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 20, "puzzle.pressRandom");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Spontaneous");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Spontaneous" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_CREATIVE,
      rewards: { rewards }
    };
  }
});

export const askPattern = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 10, "puzzle.askPattern");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Thoughtful Student");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Thoughtful Student" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_SUCCESS,
      rewards: { rewards }
    };
  }
});

// Mirror riddle guardian encounter actions
export const answerKeyboard = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 30, "puzzle.answerKeyboard");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Wise");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Wise" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_SUCCESS,
      rewards: { rewards }
    };
  }
});

export const makeWildGuess = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 15, "puzzle.makeWildGuess");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Bold");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Bold" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_CREATIVE,
      rewards: { rewards }
    };
  }
});

export const askForClue = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 20, "puzzle.askForClue");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Strategic Thinker");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Strategic Thinker" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_SUCCESS,
      rewards: { rewards }
    };
  }
});

export const complimentMirror = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }): Promise<ActionResult> => {
    const xpResult = await awardXPHelper(ctx, userId, 10, "puzzle.complimentMirror");
    const titleAwarded = await awardTitleHelper(ctx, userId, "Charming");

    const rewards: RewardEntry[] = [
      { icon: XP_REWARD.icon, amount: xpResult.xpAwarded, name: XP_REWARD.name }
    ];

    if (titleAwarded) {
      rewards.push({ icon: TITLE_REWARD.icon, amount: 1, name: "Charming" });
    }

    return {
      nextTemplateId: PuzzleTemplateId.PUZZLE_CREATIVE,
      rewards: { rewards }
    };
  }
});