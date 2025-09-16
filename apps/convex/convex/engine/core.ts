import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Helper to resolve template content (static or dynamic)
export const resolveTemplateContent = query({
  args: {
    content: v.any(), // Template content (object or function reference)
    userId: v.string()
  },
  handler: async (ctx, { content, userId }) => {
    // If content is a function reference, call it. Otherwise return as-is
    return typeof content === 'function'
      ? await content(ctx, { userId })
      : content;
  }
});

// Execute a template action
export const executeAction = mutation({
  args: {
    action: v.any(), // Action object with execute property
    userId: v.string()
  },
  handler: async (ctx, { action, userId }) => {
    if (typeof action.execute === 'string') {
      // Static routing - return the template ID
      return { nextTemplateId: action.execute };
    } else if (action.execute === null) {
      // Explicit completion
      return { isComplete: true };
    } else {
      // Dynamic routing - call the function
      const nextTemplateId = await action.execute(ctx, { userId });
      return nextTemplateId
        ? { nextTemplateId }
        : { isComplete: true };
    }
  }
});