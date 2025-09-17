import { query, mutation } from "../../_generated/server";
import { zCustomQuery, zCustomMutation } from "convex-helpers/server/zod";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { SocialTemplateId } from "../social/types";
import { DiscoveryTemplateId } from "../discovery/types";
import { PuzzleTemplateId } from "../puzzle/types";

const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

// Random encounter selection - returns a template ID from any encounter type
export const startRandomEncounter = zQuery({
  args: { userId: z.string() },
  handler: async (ctx, { userId }) => {
    // Collect all available encounter template IDs
    const socialEncounters = [
      SocialTemplateId.JOKESTER_ENCOUNTER,
      SocialTemplateId.RIDDLER_ENCOUNTER,
      SocialTemplateId.GOSSIP_MERCHANT,
      // Can add more social encounters here as they're implemented
    ];

    const discoveryEncounters = [
      DiscoveryTemplateId.BUTTERFLY_CONFERENCE,
      DiscoveryTemplateId.UPSIDE_DOWN_PUDDLE,
      DiscoveryTemplateId.BOOK_HOUSE,
      // Can add more discovery encounters here as they're implemented
    ];

    const puzzleEncounters = [
      PuzzleTemplateId.PICKY_MAGIC_DOOR,
      PuzzleTemplateId.ENCHANTED_NUMBER_STONES,
      PuzzleTemplateId.MIRROR_RIDDLE_GUARDIAN,
      // Can add more puzzle encounters here as they're implemented
    ];

    // Combine all encounters into a single pool
    const allEncounters = [
      ...socialEncounters,
      ...discoveryEncounters,
      ...puzzleEncounters,
    ];

    // Simple random selection without persistence or weighting
    const randomIndex = Math.floor(Math.random() * allEncounters.length);
    return allEncounters[randomIndex];
  }
});