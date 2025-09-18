/* eslint-disable */
/**
 * Minimal Convex API types for Discord bot
 * Contains only the function references we use
 */

// Minimal type definitions
type FunctionReference<Args = any, Returns = any> = {
  __type: 'FunctionReference';
  __args: Args;
  __returns: Returns;
};

// API structure matching what we use in the Discord bot
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