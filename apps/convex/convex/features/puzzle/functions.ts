import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { PuzzleTemplateId } from "./types";
import { awardXPHelper, awardTitleHelper } from "../progression/functions";
import { ActionResult, XP_REWARD, TITLE_REWARD, RewardEntry } from "../../shared/rewards";
import { registerActionHelper } from "../../helpers/actionRegistry";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Action registry system - only helper functions are used for template actions

export async function pressSixHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function answerWormHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function answerCreativelyHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function askForHintHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function tryToForceHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function pressEightHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function pressRandomHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function askPatternHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function answerKeyboardHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function makeWildGuessHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function askForClueHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

export async function complimentMirrorHelper(ctx: any, { userId }: { userId: string }): Promise<ActionResult> {
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

// Register all puzzle action helpers with template.action naming
registerActionHelper("PICKY_MAGIC_DOOR.ANSWER_WORM", answerWormHelper);
registerActionHelper("PICKY_MAGIC_DOOR.ANSWER_CREATIVELY", answerCreativelyHelper);
registerActionHelper("PICKY_MAGIC_DOOR.ASK_FOR_HINT", askForHintHelper);
registerActionHelper("PICKY_MAGIC_DOOR.TRY_TO_FORCE", tryToForceHelper);

registerActionHelper("ENCHANTED_NUMBER_STONES.PRESS_SIX", pressSixHelper);
registerActionHelper("ENCHANTED_NUMBER_STONES.PRESS_EIGHT", pressEightHelper);
registerActionHelper("ENCHANTED_NUMBER_STONES.PRESS_RANDOM", pressRandomHelper);
registerActionHelper("ENCHANTED_NUMBER_STONES.ASK_PATTERN", askPatternHelper);

registerActionHelper("MIRROR_RIDDLE_GUARDIAN.ANSWER_KEYBOARD", answerKeyboardHelper);
registerActionHelper("MIRROR_RIDDLE_GUARDIAN.MAKE_WILD_GUESS", makeWildGuessHelper);
registerActionHelper("MIRROR_RIDDLE_GUARDIAN.ASK_FOR_CLUE", askForClueHelper);
registerActionHelper("MIRROR_RIDDLE_GUARDIAN.COMPLIMENT_MIRROR", complimentMirrorHelper);