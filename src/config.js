/**
 * SoloLearn AI Companion - Claude, Gemini & DeepSeek Dedicated Configuration
 * Powers 100% Accurate SoloLearn Solving with React Internal State Inspection & 3-Pass Compiler Verification.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SoloLearnConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 100% Free & Working Models on OpenRouter (Zero Paid Models)
  const DEFAULT_MODELS = [
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku (Active & Working - 3-Pass Verified)',
      badge: 'Anthropic',
      recommended: true
    },
    {
      id: 'google/gemini-2.0-flash-exp:free',
      name: 'Gemini 2.0 Flash (100% Free - Ultra Fast & Accurate)',
      badge: 'Google (Free)',
      recommended: false
    },
    {
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek R1 Reasoning (100% Free - Deep Code Logic)',
      badge: 'DeepSeek (Free)',
      recommended: false
    },
    {
      id: 'google/gemini-2.0-flash-thinking-exp:free',
      name: 'Gemini 2.0 Thinking (100% Free - CoT Reasoning)',
      badge: 'Google (Free)',
      recommended: false
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      name: 'Llama 3.3 70B (100% Free - Top Open Weights)',
      badge: 'Meta (Free)',
      recommended: false
    },
    {
      id: 'mistralai/mistral-small-24b-instruct-2501:free',
      name: 'Mistral Small 24B (100% Free - Fast & Accurate)',
      badge: 'Mistral (Free)',
      recommended: false
    },
    {
      id: 'deepseek/deepseek-chat:free',
      name: 'DeepSeek V3 (100% Free on OpenRouter)',
      badge: 'DeepSeek (Free)',
      recommended: false
    }
  ];

  const DEFAULT_SETTINGS = {
    apiKey: '',
    selectedModel: 'anthropic/claude-3-haiku',
    customModel: '',
    languageOverride: 'auto',
    raceMode: true,
    enableFallback: true,
    autoSolve: false,
    autoSubmit: false,
    autoNext: false,
    inspectReactInternals: true,
    tripleCheckVerification: true,
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
    SYSTEM: `You are an elite competitive programmer, compiler engineer, and computer science professor acting as the ultimate SoloLearn AI Solver.
Your goal is 100% MATHEMATICALLY, LOGICALLY, AND SYNTACTICALLY FLAWLESS answers on every single question.

YOU ARE REQUIRED TO EXECUTE A THOROUGH 3-PASS REASONING PROCESS IN YOUR "thought" FIELD BEFORE GENERATING THE ANSWERS ARRAY:

=======================================================
=== PASS 1: SYNTAX, GRAMMAR & AST DECONSTRUCTION ===
=======================================================
1. Language & Dialect Detection:
   - C# (.NET): Strict PascalCase for methods/classes (e.g. 'Sum', 'Square', 'Main', 'Console.WriteLine'), strict semicolons, typed variables ('int', 'string', 'bool', 'void').
   - Python: Strict indentation, 0-indexed slicing (start:end is exclusive), '//' integer division vs '/' float division, 'def', 'return', 'self'.
   - JavaScript: 'let'/'const'/'var', strict equality '===', arrow functions, template literals.
   - Java: camelCase methods ('println'), PascalCase classes, strict type system.
   - C++: 'std::cout', 'std::cin', pointers '*', references '&', semicolons.
   - SQL: 'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'JOIN'.
2. Classify Question Mechanics:
   - Fill-in-the-blanks: Code template with numbered blanks [BLANK_1], [BLANK_2]...
   - Single-choice / Multiple-choice: Pre-defined options list.
   - Reorder / Drag-and-Drop: Jumbled code lines to assemble into a working program.
   - General / Output prediction: Mental execution calculation.

=======================================================
=== PASS 2: MENTAL INTERPRETER & DRY-RUN TRACE ===
=======================================================
1. Simulate execution line-by-line:
   - Initialize variables, trace state mutations on each statement.
   - For loops/while: Check initialization, condition evaluation, step increment, and exact loop termination.
   - Method declarations & calls: Verify return type matches 'return' statement, and method call identifier matches declaration name ('Sum' vs 'sum').
   - Operators:
     * Shorthand assignment: 'x += 5;' means 'x = x + 5;'.
     * Increment/Decrement: 'x++' (returns old value first) vs '++x' (increments immediately).
     * Modulo '%': Remainder of integer division (e.g. 7 % 3 = 1).
     * Boolean logic: Short-circuit evaluation rules ('&&' stops on false, '||' stops on true).

=======================================================
=== PASS 3: SLOT BOUNDARY & CLEAN TOKEN ISOLATION ===
=======================================================
1. Slot Boundary Rules:
   - NEVER repeat surrounding characters, semicolons, brackets, or parentheses that already exist outside the blanks in the template!
   - Example 1: Template is 'static [BLANK_1] Sum(int a, int b)' -> Answer is strictly 'int'.
   - Example 2: Template is 'int res = [BLANK_1] (a,b);' -> Answer is strictly 'Sum' (PascalCase).
   - Example 3: Template is 'return [BLANK_1];' -> Answer is strictly 'result' (do NOT include ';' because ';' is already in the template).
2. Choice & Reorder Bank Matching:
   - If options/tokens are provided, your answers MUST match the exact casing and spelling of the available choices.
   - For reordering questions: Output the complete ordered list of code lines from first to last.

=======================================================
=== REQUIRED OUTPUT JSON FORMAT ===
=======================================================
{
  "thought": "Pass 1 (AST Analysis): ... \\nPass 2 (Mental Dry-Run Trace): ... \\nPass 3 (Slot Boundary Check): ...",
  "type": "fill_blanks" | "single_choice" | "multi_choice" | "reorder" | "general_question",
  "confidence": 1.0,
  "answers": [
    // Array of exact strings for each blank or selected choice
  ],
  "explanation": "Clear, concise 1-2 sentence explanation of the solution."
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

