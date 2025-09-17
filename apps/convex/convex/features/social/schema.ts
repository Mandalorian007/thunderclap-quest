import { z } from "zod";

// Social encounter data schemas
// These define the content structure for social encounters but don't require persistence

// Content model for social encounters
export const SocialEncounterContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  character: z.object({
    name: z.string(),
    emoji: z.string(),
  }),
  dialogue: z.string().optional(),
});

export type SocialEncounterContent = z.infer<typeof SocialEncounterContentSchema>;

// Response content for social encounter outcomes
export const SocialResponseContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  character: z.object({
    name: z.string(),
    emoji: z.string(),
  }),
  outcome: z.string().optional(), // Additional outcome description
});

export type SocialResponseContent = z.infer<typeof SocialResponseContentSchema>;