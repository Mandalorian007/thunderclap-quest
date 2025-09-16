import { z } from "zod";
import { GearItemSchema } from "./gear";

// Player progression and identity schema
export const PlayerSchema = z.object({
  // Identity
  userId: z.string(),           // Discord ID (primary key)
  displayName: z.string(),      // Cached Discord username
  createdAt: z.number(),        // Account creation timestamp (UTC)
  lastActive: z.number(),       // Last interaction timestamp (UTC)

  // Progression
  xp: z.number(),              // Experience points
  level: z.number(),           // Current level
  titles: z.array(z.string()), // Earned achievements
  currentTitle: z.string().optional(),   // Active title

  // Equipped gear (6 optional slots using GearItem interface)
  equippedGear: z.object({
    helm: GearItemSchema.optional(),
    chest: GearItemSchema.optional(),
    gloves: GearItemSchema.optional(),
    legs: GearItemSchema.optional(),
    mainHand: GearItemSchema.optional(),
    offhand: GearItemSchema.optional(),
  }),

  // Inventory as array of GearItems
  inventory: z.array(GearItemSchema),
});

export type Player = z.infer<typeof PlayerSchema>;