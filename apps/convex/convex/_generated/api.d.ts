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
import type * as engine_simple_test from "../engine/simple_test.js";
import type * as engine_types from "../engine/types.js";
import type * as features_index from "../features/index.js";
import type * as features_profile_feature from "../features/profile-feature.js";
import type * as players from "../players.js";
import type * as profile from "../profile.js";
import type * as schemas_player from "../schemas/player.js";

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
  "engine/simple_test": typeof engine_simple_test;
  "engine/types": typeof engine_types;
  "features/index": typeof features_index;
  "features/profile-feature": typeof features_profile_feature;
  players: typeof players;
  profile: typeof profile;
  "schemas/player": typeof schemas_player;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
