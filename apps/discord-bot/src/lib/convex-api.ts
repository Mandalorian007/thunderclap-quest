/* eslint-disable */
/**
 * Minimal Convex API stub for Discord bot
 * Only includes the function references actually used by Discord commands
 * Avoids importing the full backend which causes TypeScript memory issues
 */

// Minimal type definitions
type FunctionReference<Args = any, Returns = any> = {
  __type: 'FunctionReference';
  __args: Args;
  __returns: Returns;
};

// API structure with only the functions Discord bot actually uses
export const api = {
  features: {
    profile: {
      functions: {
        ensurePlayerExists: {} as FunctionReference,
        getPlayerProfileContent: {} as FunctionReference,
      }
    },
    inventory: {
      functions: {
        getUnequippedGearForAutocomplete: {} as FunctionReference,
        equipGear: {} as FunctionReference,
        unequipGear: {} as FunctionReference,
        awardGear: {} as FunctionReference,
      }
    }
  },
  engine: {
    core: {
      executeTemplate: {} as FunctionReference,
      executeAction: {} as FunctionReference,
    }
  }
} as const;