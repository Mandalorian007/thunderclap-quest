import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { PlayerSchema } from "./schema";
import { createPlayer as createPlayerModel, ensurePlayerExists as ensurePlayerExistsModel, getPlayerWithStats, formatProfileContent } from "../../models/playerModel";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Create player with display name (for testing and explicit creation)
export const createPlayer = zMutation({
  args: {
    userId: z.string(),
    displayName: z.string()
  },
  handler: async (ctx, { userId, displayName }) => {
    return await createPlayerModel(ctx, userId, displayName);
  }
});

// Create player if not exists (mutation)
export const ensurePlayerExists = zMutation({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    return await ensurePlayerExistsModel(ctx, userId);
  }
});

// Profile content for template display (query only)
export const getPlayerProfileContent = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    const playerWithStats = await getPlayerWithStats(ctx, userId);
    return formatProfileContent(playerWithStats);
  }
});

// Engine helper function to get profile content
export async function getPlayerProfileContentHelper(ctx: any, { userId }: { userId: string }) {
  const playerWithStats = await getPlayerWithStats(ctx, userId);
  return formatProfileContent(playerWithStats);
}

// Note: Helper functions moved to ../../models/playerModel.ts
// Re-export the model layer function for backward compatibility
export { formatProfileContent } from "../../models/playerModel";