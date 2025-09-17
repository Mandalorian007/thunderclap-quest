import { z } from "zod";

// Shared encounter data schemas for explore feature
// These may be used if we need to persist encounter state in the future

// For now, we don't need persistent schemas since encounters are stateless
// This file is created to maintain the vertical slice architecture pattern
// and can be expanded if future features require encounter persistence

export const PlaceholderSchema = z.object({
  id: z.string(),
  // This is a placeholder - real schemas can be added here if needed
});

export type Placeholder = z.infer<typeof PlaceholderSchema>;