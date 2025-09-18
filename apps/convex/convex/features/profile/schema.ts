import { z } from "zod";
import { EquippedGearSchema } from "../inventory/schema";

// Complete Player schema with hybrid inventory design
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

  // Equipped gear - stored on player for fast profile/combat access
  equippedGear: EquippedGearSchema
});

export type Player = z.infer<typeof PlayerSchema>;