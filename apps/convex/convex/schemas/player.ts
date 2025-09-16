import { z } from "zod";

// Complete Player schema matching the documentation
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

  // TODO: Add equipped gear and inventory later
});

export type Player = z.infer<typeof PlayerSchema>;