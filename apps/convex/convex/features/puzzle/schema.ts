import { z } from "zod";

// Puzzle encounter data schemas
// These define the content structure for puzzle encounters

// Content model for puzzle encounters
export const PuzzleEncounterContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  puzzle: z.object({
    type: z.string(),
    question: z.string(),
    difficulty: z.string(),
  }),
  character: z.object({
    name: z.string(),
    emoji: z.string(),
  }),
  dialogue: z.string(),
});

export type PuzzleEncounterContent = z.infer<typeof PuzzleEncounterContentSchema>;

// Response content for puzzle encounter outcomes
export const PuzzleResponseContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  character: z.object({
    name: z.string(),
    emoji: z.string(),
  }),
  outcome: z.string().optional(), // Additional outcome description
  reward: z.string().optional(), // Special rewards or effects
});

export type PuzzleResponseContent = z.infer<typeof PuzzleResponseContentSchema>;