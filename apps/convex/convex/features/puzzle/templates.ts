import type { FeatureTemplateSet } from "../../engine/types";
import {
  answerWorm,
  answerCreatively,
  askForHint,
  tryToForce,
  pressSix,
  pressEight,
  pressRandom,
  askPattern,
  answerKeyboard,
  makeWildGuess,
  askForClue,
  complimentMirror
} from "./functions";
import { PuzzleTemplateId, PuzzleActionId } from "./types";

// Re-export types for external use
export { PuzzleTemplateId, PuzzleActionId };

// Puzzle feature template set following engine template pattern
export const puzzleFeatureTemplateSet: FeatureTemplateSet<PuzzleTemplateId, PuzzleActionId> = {
  startTemplate: PuzzleTemplateId.PICKY_MAGIC_DOOR, // This will be selected randomly

  templates: {
    [PuzzleTemplateId.PICKY_MAGIC_DOOR]: {
      content: {
        title: "🚪 A Finicky Magic Door",
        description: "This ornate door clears its throat importantly before speaking in perfect rhyme.",
        puzzle: {
          type: "completion",
          question: "I open for those who can complete my phrase: 'The early bird catches the ___'",
          difficulty: "easy"
        },
        character: { name: "Door McRhymerson", emoji: "🚪" },
        dialogue: "Ahem! I shall test your wit with my most clever verse!"
      },
      actions: [
        {
          id: PuzzleActionId.ANSWER_WORM,
          label: "Answer: Worm",
          execute: answerWorm
        },
        {
          id: PuzzleActionId.ANSWER_CREATIVELY,
          label: "Answer: Bus!",
          execute: answerCreatively
        },
        {
          id: PuzzleActionId.ASK_FOR_HINT,
          label: "Ask for a Hint",
          execute: askForHint
        },
        {
          id: PuzzleActionId.TRY_TO_FORCE,
          label: "Try to Force It Open",
          execute: tryToForce
        },
        {
          id: PuzzleActionId.WALK_AWAY,
          label: "Not Worth It",
          execute: null
        }
      ]
    },

    [PuzzleTemplateId.ENCHANTED_NUMBER_STONES]: {
      content: {
        title: "🔢 Mystical Number Stones",
        description: "Three glowing stones hover in the air, displaying numbers: 2, 4, ?. The third stone hums expectantly.",
        puzzle: {
          type: "pattern",
          question: "What number comes next in the sequence: 2, 4, ?",
          difficulty: "easy"
        },
        character: { name: "Ancient Stones", emoji: "🔢" },
        dialogue: "We test the mathematical mind. Can you see our pattern?"
      },
      actions: [
        {
          id: PuzzleActionId.PRESS_SIX,
          label: "Press 6",
          execute: pressSix
        },
        {
          id: PuzzleActionId.PRESS_EIGHT,
          label: "Press 8",
          execute: pressEight
        },
        {
          id: PuzzleActionId.PRESS_RANDOM,
          label: "Press 42",
          execute: pressRandom
        },
        {
          id: PuzzleActionId.ASK_PATTERN,
          label: "Ask What Pattern",
          execute: askPattern
        },
        {
          id: PuzzleActionId.WALK_AWAY,
          label: "Math is Hard",
          execute: null
        }
      ]
    },

    [PuzzleTemplateId.MIRROR_RIDDLE_GUARDIAN]: {
      content: {
        title: "🪞 A Wise Mirror Guardian",
        description: "An ornate mirror shimmers with intelligence, its surface showing not your reflection but swirling words.",
        puzzle: {
          type: "riddle",
          question: "What has keys but no locks, space but no room, and you can enter but not go inside?",
          difficulty: "medium"
        },
        character: { name: "Mirror of Mysteries", emoji: "🪞" },
        dialogue: "Gaze upon my riddle, seeker of wisdom..."
      },
      actions: [
        {
          id: PuzzleActionId.ANSWER_KEYBOARD,
          label: "Answer: Keyboard",
          execute: answerKeyboard
        },
        {
          id: PuzzleActionId.MAKE_WILD_GUESS,
          label: "Answer: A Sandwich!",
          execute: makeWildGuess
        },
        {
          id: PuzzleActionId.ASK_FOR_CLUE,
          label: "Ask for a Clue",
          execute: askForClue
        },
        {
          id: PuzzleActionId.COMPLIMENT_MIRROR,
          label: "Compliment the Mirror",
          execute: complimentMirror
        },
        {
          id: PuzzleActionId.WALK_AWAY,
          label: "Too Cryptic",
          execute: null
        }
      ]
    },

    // Terminal templates that end encounters
    [PuzzleTemplateId.PUZZLE_SUCCESS]: {
      content: {
        title: "🏆 Puzzle Solved!",
        description: "Your clever thinking has paid off! You feel a surge of satisfaction from solving the challenge.",
        character: { name: "Victory", emoji: "🏆" },
        dialogue: "Well done! Your mind is as sharp as your determination.",
        puzzle: { type: "completed", question: "", difficulty: "" }
      },
      actions: [] // No actions = encounter complete
    },

    [PuzzleTemplateId.PUZZLE_CREATIVE]: {
      content: {
        title: "💡 Creative Solution!",
        description: "Your unconventional approach impressed even the puzzle maker. Sometimes thinking outside the box is the best answer.",
        character: { name: "Innovation", emoji: "💡" },
        dialogue: "Brilliant! I hadn't thought of that approach before.",
        puzzle: { type: "completed", question: "", difficulty: "" }
      },
      actions: [] // No actions = encounter complete
    },

    [PuzzleTemplateId.PUZZLE_FAILURE]: {
      content: {
        title: "🤔 Learning Experience",
        description: "That didn't work out as planned, but you gained valuable experience in the attempt.",
        character: { name: "Wisdom", emoji: "🤔" },
        dialogue: "Not quite right, but your effort is commendable. Every attempt teaches us something.",
        puzzle: { type: "completed", question: "", difficulty: "" }
      },
      actions: [] // No actions = encounter complete
    }
  }
};