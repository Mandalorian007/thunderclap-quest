import { z } from "zod";

// Discovery encounter data schemas
// These define the content structure for discovery encounters

// Content model for discovery encounters
export const DiscoveryEncounterContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  environment: z.object({
    type: z.string(),
    oddity: z.string(),
  }),
});

export type DiscoveryEncounterContent = z.infer<typeof DiscoveryEncounterContentSchema>;

// Response content for discovery encounter outcomes
export const DiscoveryResponseContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  environment: z.object({
    type: z.string(),
    oddity: z.string(),
  }),
  outcome: z.string().optional(), // Additional outcome description
  magicalEffect: z.string().optional(), // Special magical effects
});

export type DiscoveryResponseContent = z.infer<typeof DiscoveryResponseContentSchema>;