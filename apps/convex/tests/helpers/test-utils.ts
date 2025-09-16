// Test utilities for consistent test setup
import { convexTest } from "convex-test";
import schema from "../../convex/schema";
import { api } from "../../convex/_generated/api";

// Create a test instance with schema and correct module path
export function createTestInstance() {
  // Provide the path to convex directory relative to test files
  const modules = import.meta.glob("../../convex/**/*.{js,ts}");
  return convexTest(schema, modules);
}

// Create a test player with default data
export async function createTestPlayer(
  t: ReturnType<typeof createTestInstance>,
  overrides: {
    userId?: string;
    displayName?: string;
    xp?: number;
    titles?: string[];
    currentTitle?: string;
  } = {}
) {
  const playerData = {
    userId: "test-user-" + Math.random().toString(36).substr(2, 9),
    displayName: "Test Player",
    createdAt: Date.now(),
    lastActive: Date.now(),
    xp: 0,
    level: 1,
    titles: [],
    currentTitle: undefined,
    ...overrides,
  };

  return await t.mutation(api.features.profile.functions.createPlayer, {
    userId: playerData.userId,
    displayName: playerData.displayName,
  });
}

// Common test data
export const TestData = {
  players: {
    newPlayer: {
      xp: 0,
      level: 1,
      titles: [],
    },
    experiencedPlayer: {
      xp: 250,
      level: 3,
      titles: ["First Steps", "Explorer"],
      currentTitle: "Explorer",
    },
  },

  encounters: {
    profileDisplay: "PROFILE_DISPLAY",
  },
} as const;