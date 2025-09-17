import type { FeatureTemplateSet } from "../../engine/types";
import { getPlayerProfileContentHelper } from "./functions";

// Define all template IDs as enum
export enum ProfileTemplateId {
  PROFILE_DISPLAY = "PROFILE_DISPLAY"
}

// Define all action IDs as enum (empty for profile - it's a terminal template)
export enum ProfileActionId {
  // Profile has no actions - it's a display-only template
}

// Profile feature template set - single template, no actions
export const profileFeatureTemplateSet: FeatureTemplateSet<ProfileTemplateId, ProfileActionId> = {
  startTemplate: ProfileTemplateId.PROFILE_DISPLAY,

  templates: {
    [ProfileTemplateId.PROFILE_DISPLAY]: {
      content: getPlayerProfileContentHelper,
      actions: [] // Empty array = terminal template
    }
  }
};