import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper to extract Discord ID from Clerk auth context
// This would be used by web interface functions
export const getDiscordIdFromAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated");
    }

    // In Clerk, Discord OAuth connections are stored in external accounts
    // This is a placeholder - actual implementation would depend on Clerk setup
    const discordAccount = identity.externalAccounts?.find(
      (account: any) => account.provider === 'oauth_discord'
    );

    if (!discordAccount) {
      throw new Error("Discord account not connected");
    }

    return discordAccount.externalId; // This is the Discord ID
  }
});

// Get player using authenticated Discord ID (for web interface)
export const getAuthenticatedPlayer = query({
  args: {},
  handler: async (ctx) => {
    const discordId = await getDiscordIdFromAuth(ctx);

    return await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", discordId))
      .first();
  }
});

// Note: Discord bot will get Discord ID directly from interaction.user.id
// and pass it to the same player functions that web interface uses
// This ensures perfect compatibility between both platforms