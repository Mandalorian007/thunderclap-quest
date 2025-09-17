import type { FeatureTemplateSet } from "../../engine/types";
import { getPlayerProfileContentHelper } from "./functions";
import { ProfileTemplateId, ProfileActionId } from "./types";

// Re-export for external use
export { ProfileTemplateId, ProfileActionId };

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