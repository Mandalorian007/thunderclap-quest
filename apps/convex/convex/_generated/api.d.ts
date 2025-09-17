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
import type * as features_index from "../features/index.js";
import type * as features_profile_functions from "../features/profile/functions.js";
import type * as features_profile_index from "../features/profile/index.js";
import type * as features_profile_templates from "../features/profile/templates.js";
import type * as features_profile from "../features/profile.js";

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
  "features/index": typeof features_index;
  "features/profile/functions": typeof features_profile_functions;
  "features/profile/index": typeof features_profile_index;
  "features/profile/templates": typeof features_profile_templates;
  "features/profile": typeof features_profile;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
