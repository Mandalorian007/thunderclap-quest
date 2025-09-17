/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as engine_core from "../engine/core.js";
import type * as engine_types from "../engine/types.js";
import type * as features_discovery_functions from "../features/discovery/functions.js";
import type * as features_discovery_index from "../features/discovery/index.js";
import type * as features_discovery_templates from "../features/discovery/templates.js";
import type * as features_discovery_types from "../features/discovery/types.js";
import type * as features_discovery from "../features/discovery.js";
import type * as features_explore_functions from "../features/explore/functions.js";
import type * as features_explore_index from "../features/explore/index.js";
import type * as features_explore_templates from "../features/explore/templates.js";
import type * as features_explore from "../features/explore.js";
import type * as features_index from "../features/index.js";
import type * as features_profile_functions from "../features/profile/functions.js";
import type * as features_profile_index from "../features/profile/index.js";
import type * as features_profile_templates from "../features/profile/templates.js";
import type * as features_profile_types from "../features/profile/types.js";
import type * as features_profile from "../features/profile.js";
import type * as features_progression_functions from "../features/progression/functions.js";
import type * as features_progression_index from "../features/progression/index.js";
import type * as features_progression_types from "../features/progression/types.js";
import type * as features_puzzle_functions from "../features/puzzle/functions.js";
import type * as features_puzzle_index from "../features/puzzle/index.js";
import type * as features_puzzle_templates from "../features/puzzle/templates.js";
import type * as features_puzzle_types from "../features/puzzle/types.js";
import type * as features_puzzle from "../features/puzzle.js";
import type * as features_social_functions from "../features/social/functions.js";
import type * as features_social_index from "../features/social/index.js";
import type * as features_social_templates from "../features/social/templates.js";
import type * as features_social_types from "../features/social/types.js";
import type * as features_social from "../features/social.js";
import type * as shared_rewards from "../shared/rewards.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "engine/core": typeof engine_core;
  "engine/types": typeof engine_types;
  "features/discovery/functions": typeof features_discovery_functions;
  "features/discovery/index": typeof features_discovery_index;
  "features/discovery/templates": typeof features_discovery_templates;
  "features/discovery/types": typeof features_discovery_types;
  "features/discovery": typeof features_discovery;
  "features/explore/functions": typeof features_explore_functions;
  "features/explore/index": typeof features_explore_index;
  "features/explore/templates": typeof features_explore_templates;
  "features/explore": typeof features_explore;
  "features/index": typeof features_index;
  "features/profile/functions": typeof features_profile_functions;
  "features/profile/index": typeof features_profile_index;
  "features/profile/templates": typeof features_profile_templates;
  "features/profile/types": typeof features_profile_types;
  "features/profile": typeof features_profile;
  "features/progression/functions": typeof features_progression_functions;
  "features/progression/index": typeof features_progression_index;
  "features/progression/types": typeof features_progression_types;
  "features/puzzle/functions": typeof features_puzzle_functions;
  "features/puzzle/index": typeof features_puzzle_index;
  "features/puzzle/templates": typeof features_puzzle_templates;
  "features/puzzle/types": typeof features_puzzle_types;
  "features/puzzle": typeof features_puzzle;
  "features/social/functions": typeof features_social_functions;
  "features/social/index": typeof features_social_index;
  "features/social/templates": typeof features_social_templates;
  "features/social/types": typeof features_social_types;
  "features/social": typeof features_social;
  "shared/rewards": typeof shared_rewards;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
