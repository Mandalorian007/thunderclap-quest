import { z } from "zod";

// Start simple - just the basic Player schema to match our current table
export const PlayerSchema = z.object({
  userId: z.string(),           // Discord ID
  displayName: z.string(),      // Discord username
  xp: z.number(),              // Experience points
  level: z.number(),           // Current level
});

export type Player = z.infer<typeof PlayerSchema>;