import { z } from "zod";

// Game level tracking schema
export const GameLevelSchema = z.object({
  level: z.number().default(1),
  lastIncrease: z.number(), // Timestamp of last automatic increase
  nextIncrease: z.number(), // Timestamp of next scheduled increase
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type GameLevel = z.infer<typeof GameLevelSchema>;