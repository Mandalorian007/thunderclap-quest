import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ChestTemplateId } from "./chest-feature";

// Action functions return enum values or null for completion
export const examineChest = mutation({
  args: {
    userId: v.string(),
    actionData: v.optional(v.any())
  },
  handler: async (ctx, { userId }): Promise<ChestTemplateId | null> => {
    // Award XP for examination
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        xp: player.xp + 10,
        lastActive: Date.now()
      });
    }

    // Return enum value for type safety
    return ChestTemplateId.CHEST_EXAMINED;
  }
});

export const forceOpenChest = mutation({
  args: {
    userId: v.string(),
    actionData: v.optional(v.any())
  },
  handler: async (ctx, { userId }): Promise<ChestTemplateId | null> => {
    const success = Math.random() > 0.3; // 70% success rate

    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    if (success) {
      // Award small XP for success
      await ctx.db.patch(player._id, {
        xp: player.xp + 25,
        lastActive: Date.now()
      });
      return ChestTemplateId.LOOT_SELECTION;
    } else {
      // Take damage, but allow retry - award small consolation XP
      await ctx.db.patch(player._id, {
        xp: player.xp + 5,
        lastActive: Date.now()
      });
      return ChestTemplateId.CHEST_EXAMINED;
    }
  }
});

export const disarmTrap = mutation({
  args: {
    userId: v.string(),
    actionData: v.optional(v.any())
  },
  handler: async (ctx, { userId }): Promise<ChestTemplateId | null> => {
    // Higher success rate for careful approach
    const success = Math.random() > 0.15; // 85% success rate

    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    if (success) {
      // Award bonus XP for careful approach
      await ctx.db.patch(player._id, {
        xp: player.xp + 35,
        lastActive: Date.now()
      });
      return ChestTemplateId.LOOT_SELECTION;
    } else {
      // Failed disarm triggers trap
      await ctx.db.patch(player._id, {
        xp: player.xp + 5,
        lastActive: Date.now()
      });
      return ChestTemplateId.CHEST_EXAMINED;
    }
  }
});

export const triggerTrap = mutation({
  args: {
    userId: v.string(),
    actionData: v.optional(v.any())
  },
  handler: async (ctx, { userId }): Promise<ChestTemplateId | null> => {
    // Guaranteed to work but with consequences
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (player) {
      // Small XP for boldness
      await ctx.db.patch(player._id, {
        xp: player.xp + 15,
        lastActive: Date.now()
      });
    }

    return ChestTemplateId.LOOT_SELECTION;
  }
});

// Dynamic content functions
export const getExamineResults = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    const skillLevel = player?.level || 1;

    return {
      title: "Trap Detected!",
      description: `Your keen eyes spot a pressure plate mechanism. ${skillLevel > 3 ? "Your experience tells you it's relatively simple to disarm." : "It looks dangerous but manageable."}`,
      trapType: "pressure plate",
      trapDifficulty: skillLevel > 5 ? "easy" : "medium",
      playerSkillLevel: skillLevel
    };
  }
});

export const getLootOptions = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    // Generate loot based on player level
    const playerLevel = player?.level || 1;
    const coinsFound = Math.floor(Math.random() * 50) + playerLevel * 10;

    return {
      title: "Treasure Found!",
      description: "The chest opens to reveal valuable items glinting in the light.",
      availableItems: [
        {
          id: "ancient_scroll",
          name: "Ancient Scroll",
          value: 100,
          rarity: "rare",
          description: "A scroll covered in mystical runes"
        },
        {
          id: "health_potion",
          name: "Health Potion",
          value: 25,
          rarity: "common",
          description: "A small vial of red liquid"
        }
      ],
      coinsAvailable: coinsFound,
      playerCoins: 0 // TODO: Add coins to player schema
    };
  }
});

// Placeholder functions for item taking (would implement inventory system)
export const takeSpecificItem = mutation({
  args: { userId: v.string(), actionData: v.optional(v.any()) },
  handler: async (ctx, { userId }) => {
    // TODO: Implement item taking logic
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        xp: player.xp + 15,
        lastActive: Date.now()
      });
    }

    return null; // Complete encounter
  }
});

export const takeCoins = mutation({
  args: { userId: v.string(), actionData: v.optional(v.any()) },
  handler: async (ctx, { userId }) => {
    // TODO: Implement coin taking logic
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        xp: player.xp + 10,
        lastActive: Date.now()
      });
    }

    return null; // Complete encounter
  }
});

export const takeAllItems = mutation({
  args: { userId: v.string(), actionData: v.optional(v.any()) },
  handler: async (ctx, { userId }) => {
    // TODO: Implement taking all items logic
    const player = await ctx.db
      .query("players")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        xp: player.xp + 30,
        lastActive: Date.now()
      });
    }

    return null; // Complete encounter
  }
});