/**
 * SoloLearn AI Companion - Claude & Gemini Dedicated Configuration
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SoloLearnConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Strictly Claude and Gemini models only (No GPT)
  const DEFAULT_MODELS = [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet (Recommended - Best Logic & Zero Errors)',
      badge: 'Anthropic',
      recommended: true
    },
    {
      id: 'google/gemini-2.0-flash-001',
      name: 'Gemini 2.0 Flash (Ultra Fast & Accurate)',
      badge: 'Google',
      recommended: false
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini 1.5 Pro (Deep Code Reasoning)',
      badge: 'Google',
      recommended: false
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku (Fast Anthropic)',
      badge: 'Anthropic',
      recommended: false
    }
  ];

  const DEFAULT_SETTINGS = {
    apiKey: '',
    selectedModel: 'anthropic/claude-3.5-sonnet',
    customModel: '',
    languageOverride: 'auto',
    autoSolve: false,
    autoSubmit: false,
    autoNext: false,
    heartSafety: true,
    actionDelay: 1200,
    typingSpeed: 25,
    soundEnabled: true,
    overlayVisible: true,
    temperature: 0.0
  };

  const STORAGE_KEY = 'sololearn_ai_solver_settings_v1';

  const Storage = {
    async get() {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
              if (result && result[STORAGE_KEY]) {
                resolve({ ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] });
              } else {
                const local = localStorage.getItem(STORAGE_KEY);
                resolve(local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : { ...DEFAULT_SETTINGS });
              }
            });
          });
        }
      } catch (e) {}

      try {
        const local = localStorage.getItem(STORAGE_KEY);
        return local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : { ...DEFAULT_SETTINGS };
      } catch (err) {
        return { ...DEFAULT_SETTINGS };
      }
    },

    async save(settings) {
      const merged = { ...DEFAULT_SETTINGS, ...settings };
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ [STORAGE_KEY]: merged });
        }
      } catch (e) {}

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    }
  };

  const PROMPT_TEMPLATE = {
    SYSTEM: `You are an elite competitive programmer, computer science professor, and master compiler solver for SoloLearn.
Your sole mission is to provide 100% FLAWLESS, zero-mistake answers for SoloLearn exercises.

CRITICAL SYNTAX & COMPILER VERIFICATION RULES:
1. Target Language: Strictly follow the target language (e.g. C# .NET, Python, JavaScript, Java, C++, SQL).
2. Loop Disambiguation:
   - "while (condition)": Takes a single boolean condition inside parentheses with NO semicolons inside (e.g. "while (x < 100)").
   - "for (init; cond; step)": Requires three clauses separated by semicolons inside parentheses.
   - If the code has "[BLANK_1] (x < 100)", the keyword is "while" because there are no semicolons inside the parentheses!
3. Precise Slot Boundaries:
   - Check what code already exists outside each blank.
   - If the code is "x [BLANK_2] 4;", the literal "4;" already exists outside the blank! The blank is ONLY the operator "+=" (do not repeat "4").
   - If the code is "Console.WriteLine( [BLANK_3] );", the parentheses already exist! The blank is ONLY "x".
4. Shorthand Assignment: "x = x + 4;" in shorthand is "x += 4;".
5. Match Count: The "answers" array must have the exact number of elements matching the blanks.

JSON SCHEMA:
{
  "thought": "Step-by-step mental compiler verification proving 100% syntax correctness.",
  "type": "single_choice" | "multi_choice" | "fill_blanks" | "reorder" | "general_question",
  "confidence": 1.0,
  "answers": [
    // Array of strings containing strictly the exact token for each blank
  ],
  "explanation": "Clear explanation of each slot and why the syntax is correct."
}`
  };

  return {
    DEFAULT_MODELS,
    DEFAULT_SETTINGS,
    STORAGE_KEY,
    Storage,
    PROMPT_TEMPLATE
  };
});
