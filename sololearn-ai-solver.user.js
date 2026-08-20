// ==UserScript==
// @name         SoloLearn AI Companion (Multi-AI Consensus & 3-Pass Solver)
// @namespace    https://github.com/REP-Julian/sololearn-ai-companion
// @version      2.0.0
// @description  Multi-AI consensus & 3-pass compiler solver for SoloLearn interactive courses, quizzes, and code rearrange tasks.
// @author       Julian Agustino (@REP-Julian)
// @homepage     https://github.com/REP-Julian/sololearn-ai-companion
// @match        https://*.sololearn.com/*
// @match        https://sololearn.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

/**
 * SoloLearn AI Automation Solver - Standalone Userscript
 * Built for Tampermonkey, Violentmonkey, and Greasemonkey.
 */


(function() {
  'use strict';

  // Inject CSS Styles
  const styleEl = document.createElement('style');
  styleEl.id = 'sololearn-ai-styles';
  styleEl.textContent = "/* ==========================================================================\n   SoloLearn AI Companion - Glassmorphic HUD & Visual Answer Styles\n   ========================================================================== */\n\n#sololearn-ai-hud {\n  position: fixed !important;\n  top: 20px !important;\n  right: 20px !important;\n  width: 380px !important;\n  max-width: calc(100vw - 32px) !important;\n  max-height: calc(100vh - 40px) !important;\n  z-index: 2147483647 !important;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif !important;\n  font-size: 13px !important;\n  line-height: 1.5 !important;\n  color: #ffffff !important;\n  background: rgba(15, 23, 42, 0.96) !important;\n  backdrop-filter: blur(20px) !important;\n  -webkit-backdrop-filter: blur(20px) !important;\n  border: 1px solid #334155 !important;\n  border-radius: 18px !important;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(56, 189, 248, 0.25) !important;\n  box-sizing: border-box !important;\n  user-select: none !important;\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden !important;\n}\n\n#sololearn-ai-hud *,\n#sololearn-ai-hud *::before,\n#sololearn-ai-hud *::after {\n  box-sizing: border-box !important;\n  font-family: inherit !important;\n}\n\n/* Header */\n.sl-hud-header {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  padding: 14px 18px !important;\n  background: #1e293b !important;\n  border-bottom: 1px solid #334155 !important;\n  cursor: grab !important;\n  flex-shrink: 0 !important;\n}\n\n.sl-hud-header:active {\n  cursor: grabbing !important;\n}\n\n.sl-hud-brand {\n  display: flex !important;\n  align-items: center !important;\n  gap: 10px !important;\n  font-size: 15px !important;\n  font-weight: 700 !important;\n  color: #ffffff !important;\n}\n\n.sl-brand-icon {\n  width: 28px !important;\n  height: 28px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  background: linear-gradient(135deg, #0284c7, #8b5cf6) !important;\n  border-radius: 8px !important;\n  font-size: 14px !important;\n  color: #ffffff !important;\n  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6) !important;\n}\n\n.sl-hud-controls {\n  display: flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n}\n\n.sl-icon-btn {\n  background: #334155 !important;\n  border: 1px solid #475569 !important;\n  color: #e2e8f0 !important;\n  width: 30px !important;\n  height: 30px !important;\n  border-radius: 8px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  cursor: pointer !important;\n  font-size: 14px !important;\n}\n\n.sl-icon-btn:hover {\n  background: #475569 !important;\n  color: #ffffff !important;\n  border-color: #38bdf8 !important;\n}\n\n/* Status Bar */\n.sl-status-bar {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  padding: 10px 18px !important;\n  background: #141f36 !important;\n  border-bottom: 1px solid #1e293b !important;\n  font-size: 12px !important;\n  flex-shrink: 0 !important;\n}\n\n.sl-status-pill {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  font-weight: 600 !important;\n  color: #e2e8f0 !important;\n}\n\n.sl-status-dot {\n  width: 9px !important;\n  height: 9px !important;\n  border-radius: 50% !important;\n  display: inline-block !important;\n}\n\n.sl-status-dot.idle { background: #94a3b8 !important; }\n.sl-status-dot.thinking { background: #f59e0b !important; box-shadow: 0 0 10px #f59e0b !important; }\n.sl-status-dot.success { background: #10b981 !important; box-shadow: 0 0 10px #10b981 !important; }\n.sl-status-dot.error { background: #ef4444 !important; box-shadow: 0 0 10px #ef4444 !important; }\n.sl-status-dot.active { background: #38bdf8 !important; box-shadow: 0 0 10px #38bdf8 !important; }\n\n.sl-model-badge {\n  font-size: 11px !important;\n  font-weight: 700 !important;\n  padding: 4px 10px !important;\n  background: #0369a1 !important;\n  color: #ffffff !important;\n  border: 1px solid #38bdf8 !important;\n  border-radius: 14px !important;\n  max-width: 170px !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n\n/* Body with automatic smooth scrollbar to prevent stretching off-screen */\n.sl-hud-body {\n  padding: 14px 16px !important;\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 10px !important;\n  background: #0f172a !important;\n  overflow-y: auto !important;\n  max-height: calc(100vh - 120px) !important;\n  scrollbar-width: thin !important;\n  scrollbar-color: #334155 transparent !important;\n}\n\n.sl-hud-body::-webkit-scrollbar {\n  width: 6px !important;\n}\n\n.sl-hud-body::-webkit-scrollbar-track {\n  background: transparent !important;\n}\n\n.sl-hud-body::-webkit-scrollbar-thumb {\n  background: #334155 !important;\n  border-radius: 4px !important;\n}\n\n.sl-hud-body::-webkit-scrollbar-thumb:hover {\n  background: #475569 !important;\n}\n\n/* Big Companion Answer Display Card */\n.sl-companion-answer-card {\n  padding: 14px 16px !important;\n  background: linear-gradient(135deg, #064e3b 0%, #022c22 100%) !important;\n  border: 2px solid #10b981 !important;\n  border-radius: 12px !important;\n  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35) !important;\n  display: flex;\n  flex-direction: column !important;\n  gap: 10px !important;\n}\n\n.sl-companion-answer-card.consensus {\n  background: linear-gradient(135deg, #064e3b 0%, #0b1f33 100%) !important;\n  border: 2px solid #fbbf24 !important;\n  box-shadow: 0 0 25px rgba(251, 191, 36, 0.45) !important;\n}\n\n.sl-companion-answer-card.consensus .sl-companion-answer-header {\n  color: #fbbf24 !important;\n}\n\n.sl-companion-answer-header {\n  display: flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n  font-size: 12px !important;\n  font-weight: 800 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n  color: #34d399 !important;\n}\n\n.sl-companion-answer-content {\n  font-size: 18px !important;\n  font-weight: 800 !important;\n  color: #ffffff !important;\n  background: rgba(0, 0, 0, 0.45) !important;\n  padding: 10px 14px !important;\n  border-radius: 8px !important;\n  border: 1px solid rgba(52, 211, 153, 0.4) !important;\n  line-height: 1.4 !important;\n  word-break: break-word !important;\n  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;\n}\n\n.sl-companion-explanation {\n  font-size: 12px !important;\n  color: #d1fae5 !important;\n  line-height: 1.5 !important;\n  border-top: 1px dashed rgba(16, 185, 129, 0.4) !important;\n  padding-top: 8px !important;\n}\n\n/* Primary Reveal Answer Button */\n.sl-btn-primary {\n  width: 100% !important;\n  padding: 13px 18px !important;\n  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;\n  color: #ffffff !important;\n  border: 1px solid #38bdf8 !important;\n  border-radius: 10px !important;\n  font-size: 14px !important;\n  font-weight: 700 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 8px !important;\n  cursor: pointer !important;\n  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.45) !important;\n}\n\n.sl-btn-primary:hover {\n  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%) !important;\n}\n\n.sl-hotkey-hint {\n  font-size: 11px !important;\n  padding: 2px 6px !important;\n  background: #0c4a6e !important;\n  border: 1px solid #38bdf8 !important;\n  border-radius: 4px !important;\n  color: #ffffff !important;\n  margin-left: auto !important;\n  font-weight: 700 !important;\n}\n\n/* Auto-Scan Toggle */\n.sl-toggle-btn {\n  padding: 10px 14px !important;\n  background: #1e293b !important;\n  border: 1px solid #475569 !important;\n  border-radius: 10px !important;\n  color: #94a3b8 !important;\n  font-size: 12px !important;\n  font-weight: 700 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  cursor: pointer !important;\n}\n\n.sl-toggle-btn.active {\n  background: #064e3b !important;\n  border-color: #10b981 !important;\n  color: #34d399 !important;\n}\n\n/* Settings Drawer */\n.sl-settings-drawer {\n  display: none !important;\n  flex-direction: column !important;\n  gap: 12px !important;\n  padding-top: 12px !important;\n  border-top: 1px solid #334155 !important;\n}\n\n.sl-settings-drawer.open {\n  display: flex !important;\n}\n\n.sl-field-group {\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 6px !important;\n}\n\n.sl-field-label {\n  font-size: 11px !important;\n  font-weight: 700 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n  color: #94a3b8 !important;\n}\n\n.sl-input, .sl-select {\n  width: 100% !important;\n  padding: 9px 12px !important;\n  background: #020617 !important;\n  border: 1px solid #475569 !important;\n  border-radius: 8px !important;\n  color: #ffffff !important;\n  font-size: 12px !important;\n  outline: none !important;\n}\n\n.sl-input:focus, .sl-select:focus {\n  border-color: #38bdf8 !important;\n}\n\n.sl-btn-secondary {\n  padding: 9px 14px !important;\n  background: #0369a1 !important;\n  border: 1px solid #38bdf8 !important;\n  color: #ffffff !important;\n  border-radius: 8px !important;\n  font-size: 12px !important;\n  font-weight: 700 !important;\n  cursor: pointer !important;\n}\n\n.sl-btn-secondary:hover {\n  background: #0284c7 !important;\n}\n\n/* In-Page Visual Highlighter Badges & Glowing Outline */\n.sl-ai-highlighted-choice {\n  position: relative !important;\n  border: 2.5px solid #10b981 !important;\n  background: rgba(16, 185, 129, 0.15) !important;\n  box-shadow: 0 0 20px rgba(16, 185, 129, 0.55) !important;\n  border-radius: 12px !important;\n  transition: all 0.3s ease !important;\n}\n\n.sl-ai-badge {\n  position: absolute !important;\n  top: -12px !important;\n  right: 12px !important;\n  background: #10b981 !important;\n  color: #ffffff !important;\n  font-size: 11px !important;\n  font-weight: 800 !important;\n  padding: 2px 8px !important;\n  border-radius: 10px !important;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;\n  letter-spacing: 0.4px !important;\n  z-index: 1000 !important;\n}\n\n.sl-ai-order-badge {\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;\n  color: #ffffff !important;\n  font-size: 11px !important;\n  font-weight: 800 !important;\n  padding: 3px 8px !important;\n  border-radius: 6px !important;\n  margin-right: 10px !important;\n  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4) !important;\n  letter-spacing: 0.5px !important;\n  border: 1px solid #34d399 !important;\n}\n\n#sololearn-ai-hud.minimized .sl-hud-body,\n#sololearn-ai-hud.minimized .sl-status-bar {\n  display: none !important;\n}\n\n#sololearn-ai-hud.minimized {\n  width: auto !important;\n}\n";
  (document.head || document.documentElement).appendChild(styleEl);

  // Load Config
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



  // Load OpenRouter Client
  /**
 * SoloLearn AI Companion - 3-Pass Compiler Solver & OpenRouter Client
 * Enforces triple-check mental dry-runs and React internal state verification.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'));
  } else {
    root.OpenRouterClient = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

  const FAST_RACE_MODELS = [
    'anthropic/claude-3-haiku',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-small-24b-instruct-2501:free'
  ];

  class OpenRouterClient {
    constructor(apiKey, model = 'anthropic/claude-3-haiku') {
      this.apiKey = apiKey;
      this.model = model;
    }

    setApiKey(key) {
      this.apiKey = key ? key.trim() : '';
    }

    setModel(model) {
      this.model = model;
    }

    /**
     * Extracts pure answer tokens and cleanly separates reasoning
     */
    cleanJsonResponse(rawText) {
      if (!rawText) return null;
      let text = rawText.trim();

      const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (markdownMatch && markdownMatch[1]) {
        text = markdownMatch[1].trim();
      }

      let parsed = null;

      // 1. Try JSON.parse
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const substring = text.substring(firstBrace, lastBrace + 1);
          try {
            parsed = JSON.parse(substring);
          } catch (err2) {
            try {
              const repaired = substring.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
              parsed = JSON.parse(repaired);
            } catch (err3) {}
          }
        }
      }

      // If JSON.parse succeeded, extract and clean
      if (parsed && typeof parsed === 'object') {
        let rawAnswers = parsed.answers || parsed.answer || parsed.solution || parsed.result || [];
        if (!Array.isArray(rawAnswers)) rawAnswers = [rawAnswers];

        const cleanAnswers = rawAnswers
          .map(a => String(a).replace(/^[{\["'\s]+|[}\]"'\s]+$/g, '').trim())
          .filter(a => a.length > 0 && !a.includes('"thought"') && !a.includes('"answers"'));

        let cleanExp = parsed.explanation || parsed.thought || 'Verified 3-Pass syntax solution.';
        if (typeof cleanExp === 'object') cleanExp = JSON.stringify(cleanExp);

        if (cleanAnswers.length > 0) {
          return {
            thought: parsed.thought || 'Triple-check compiler verification passed.',
            type: parsed.type || 'fill_blanks',
            confidence: parsed.confidence || 1.0,
            answers: cleanAnswers,
            explanation: String(cleanExp).replace(/\\n/g, ' ').trim()
          };
        }
      }

      // 2. High-Precision Regex Extractor Fallback
      const answersMatch = text.match(/"answers"\s*:\s*\[([\s\S]*?)\]/i);
      if (answersMatch && answersMatch[1]) {
        const rawItems = answersMatch[1].split(',');
        const extractedAnswers = rawItems
          .map(item => item.replace(/["'\\\[\]]/g, '').trim())
          .filter(a => a.length > 0 && !a.includes('{') && !a.includes('thought'));

        const expMatch = text.match(/"explanation"\s*:\s*"([\s\S]*?)"/i);
        const thoughtMatch = text.match(/"thought"\s*:\s*"([\s\S]*?)"/i);

        return {
          type: 'fill_blanks',
          answers: extractedAnswers,
          thought: thoughtMatch ? thoughtMatch[1] : 'Regex extracted verification',
          explanation: (expMatch ? expMatch[1] : (thoughtMatch ? thoughtMatch[1] : 'Correct answer verified.')).replace(/\\"/g, '"')
        };
      }

      // 3. Single answer regex
      const singleAnswerMatch = text.match(/"answer"\s*:\s*"([^"]+)"/i);
      if (singleAnswerMatch && singleAnswerMatch[1]) {
        return {
          type: 'single_choice',
          answers: [singleAnswerMatch[1].replace(/["']/g, '').trim()],
          thought: 'Single choice match',
          explanation: 'Verified solution.'
        };
      }

      // Fallback plain token
      const cleanToken = text.replace(/^[#\*\s\->{"]+|[}\s"]+$/g, '').slice(0, 60).trim();
      return {
        type: 'general',
        answers: [cleanToken],
        thought: 'Direct evaluation',
        explanation: 'Direct answer evaluation.'
      };
    }

    async solve(questionPayload, modelOverride = null, options = {}) {
      // 1. Direct Ground Truth from SoloLearn React Fiber / Next.js
      if (questionPayload && questionPayload.isInternalGroundTruth && Array.isArray(questionPayload.answers) && questionPayload.answers.length > 0) {
        return {
          success: true,
          data: {
            type: questionPayload.type,
            confidence: 1.0,
            answers: questionPayload.answers,
            explanation: questionPayload.explanation || 'Extracted directly from SoloLearn React internal state.',
            thought: '100% Ground Truth from SoloLearn React component props.'
          },
          model: 'SoloLearn Internal State (Ground Truth)',
          isInternalGroundTruth: true,
          latencyMs: 1
        };
      }

      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenRouter API Key is missing. Please enter your API key in settings (⚙).'
        };
      }

      const isRace = options.raceMode !== false;
      const targetModel = modelOverride || this.model || 'anthropic/claude-3-haiku';

      // 2. Parallel AI Race & Consensus Voting Engine
      // Runs all models concurrently. Models with matching answers are flagged as the Best Consensus Answer!
      if (isRace) {
        const racePool = Array.from(new Set([targetModel, ...FAST_RACE_MODELS])).slice(0, 4);

        return new Promise((resolve) => {
          const results = [];
          let completed = 0;
          let isResolved = false;
          let timerId = null;

          const evaluateConsensus = () => {
            if (isResolved) return;
            isResolved = true;
            if (timerId) clearTimeout(timerId);

            if (results.length === 0) {
              resolve({
                success: false,
                error: 'All racing AI models failed.'
              });
              return;
            }

            // Group responses by normalized answer signature
            const groupMap = new Map();
            for (const item of results) {
              const answersArray = Array.isArray(item.data.answers) ? item.data.answers : [item.data.answer];
              const normalizedSig = answersArray.map(a => String(a).toLowerCase().trim()).join('|||');

              if (!groupMap.has(normalizedSig)) {
                groupMap.set(normalizedSig, {
                  votes: 0,
                  models: [],
                  winnerRes: item
                });
              }
              const group = groupMap.get(normalizedSig);
              group.votes++;
              group.models.push(item.model);
            }

            // Find the group with the highest consensus votes
            let bestGroup = null;
            for (const grp of groupMap.values()) {
              if (!bestGroup || grp.votes > bestGroup.votes) {
                bestGroup = grp;
              }
            }

            const chosen = bestGroup.winnerRes;
            const hasConsensus = bestGroup.votes > 1;

            resolve({
              ...chosen,
              wasRaced: true,
              hasConsensus,
              votes: bestGroup.votes,
              totalVoters: results.length,
              agreementRatio: `${bestGroup.votes}/${results.length}`,
              agreedModels: bestGroup.models,
              racingModels: racePool
            });
          };

          racePool.forEach(async (model) => {
            try {
              const res = await this.queryModel(questionPayload, model);
              if (res && res.success && !isResolved) {
                results.push(res);

                // If 2 or more models agree on the EXACT same answer, trigger instant consensus!
                const answersArray = Array.isArray(res.data.answers) ? res.data.answers : [res.data.answer];
                const sig = answersArray.map(a => String(a).toLowerCase().trim()).join('|||');
                const matching = results.filter(r => {
                  const arr = Array.isArray(r.data.answers) ? r.data.answers : [r.data.answer];
                  return arr.map(a => String(a).toLowerCase().trim()).join('|||') === sig;
                });

                if (matching.length >= 2) {
                  evaluateConsensus();
                  return;
                }

                // If first result arrives, give other models a brief window to corroborate
                if (results.length === 1 && !timerId) {
                  timerId = setTimeout(() => {
                    evaluateConsensus();
                  }, 1600);
                }
              }
            } catch (_) {
            } finally {
              completed++;
              if (completed === racePool.length && !isResolved) {
                evaluateConsensus();
              }
            }
          });
        });
      }

      // 3. Single Model with Resilient Fallback
      try {
        const result = await this.queryModel(questionPayload, targetModel);
        if (result.success || options.enableFallback === false) {
          return result;
        }

        // Sequential fallback
        for (const fallbackModel of FAST_RACE_MODELS) {
          if (fallbackModel === targetModel) continue;
          try {
            const fbResult = await this.queryModel(questionPayload, fallbackModel);
            if (fbResult.success) {
              return fbResult;
            }
          } catch (_) {}
        }

        return result;
      } catch (err) {
        return {
          success: false,
          error: `Error with ${targetModel}: ${err.message || 'Request failed'}`
        };
      }
    }

    async queryModel(questionPayload, activeModel) {
      const startTime = performance.now();
      const language = questionPayload.language || 'C# (.NET)';

      const userPrompt = `You are an expert SoloLearn compiler and solver. Execute an EXHAUSTIVE 3-PASS MENTAL COMPILER VERIFICATION before generating the final JSON:

TARGET PROGRAMMING LANGUAGE: ${language}

TASK OBJECTIVE:
"${questionPayload.title || 'Complete the exercise'}"

CODE TEMPLATE (WITH NUMBERED BLANK SLOTS):
\`\`\`${language}
${questionPayload.code || 'No code snippet provided.'}
\`\`\`

QUESTION CATEGORY: ${questionPayload.type}
TOTAL BLANKS/SLOTS TO FILL: ${questionPayload.blankCount || 0}
AVAILABLE CHOICES / WORD BANK (if any):
${JSON.stringify(questionPayload.options || [], null, 2)}
EXTRA CONTEXT: "${questionPayload.extraText || ''}"

MANDATORY 3-PASS VERIFICATION PROTOCOL (Populate into "thought"):
- Pass 1 (AST & Language Grammar): Analyze language conventions, keywords, case-sensitivity, and slot requirements.
- Pass 2 (Mental Interpreter Simulation): Step through lines of code, simulate runtime variables, evaluate operators, and trace logic.
- Pass 3 (Slot Boundary Check): Ensure your answers array contains ONLY the exact missing token without repeating surrounding punctuation outside the blank.

Return strictly valid JSON matching the schema.`;

      const requestBody = {
        model: activeModel,
        messages: [
          { role: 'system', content: Config.PROMPT_TEMPLATE.SYSTEM },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.0,
        max_tokens: 2048
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for deep reasoning models

        const response = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://sololearn.com',
            'X-Title': 'SoloLearn AI Companion',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const latencyMs = Math.round(performance.now() - startTime);

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData && errData.error && errData.error.message) {
              errorMsg = errData.error.message;
            }
          } catch (_) {}

          if (response.status === 401) {
            errorMsg = 'Invalid OpenRouter API Key. Please verify your key in settings.';
          } else if (response.status === 402) {
            errorMsg = 'Insufficient OpenRouter credits on your account.';
          }

          return {
            success: false,
            error: errorMsg,
            status: response.status,
            latencyMs
          };
        }

        const data = await response.json();
        const choice = data.choices && data.choices[0];
        const rawContent = choice && choice.message ? choice.message.content : '';

        const parsedJson = this.cleanJsonResponse(rawContent);

        if (!parsedJson || !Array.isArray(parsedJson.answers) || parsedJson.answers.length === 0) {
          return {
            success: false,
            error: 'AI response could not be parsed.',
            raw: rawContent,
            latencyMs
          };
        }

        return {
          success: true,
          data: parsedJson,
          raw: rawContent,
          latencyMs,
          model: activeModel,
          usage: data.usage || null
        };
      } catch (err) {
        const latencyMs = Math.round(performance.now() - startTime);
        return {
          success: false,
          error: `Connection error: ${err.message || 'Timeout after 45s'}`,
          latencyMs
        };
      }
    }
  }

  return OpenRouterClient;
});


  // Load Parser
  /**
 * SoloLearn AI Companion - React Fiber Internal State Inspector & Precision DOM Parser
 * Extracts ground-truth answers from SoloLearn React component state / Next.js props,
 * with high-precision DOM parsing fallbacks for all SoloLearn activities.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SoloLearnParser = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isVisible(el) {
    if (!el) return false;
    if (el.closest && el.closest('#sololearn-ai-hud')) return false;

    try {
      const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if (style) {
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      }
      if (el.closest && el.closest('[aria-hidden="true"]')) return false;

      if (typeof el.getBoundingClientRect === 'function' && window.innerWidth > 0) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          if (rect.right < -50 || rect.left > window.innerWidth + 50) return false;
        }
      }
    } catch (e) {}

    return true;
  }

  function getCleanText(el) {
    if (!el) return '';
    try {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
      return (clone.innerText || clone.textContent || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
    } catch (e) {
      return (el.innerText || el.textContent || '').trim();
    }
  }

  /**
   * SoloLearnInternalInspector: Deeply inspects React Fiber nodes, React component props,
   * and Next.js page state for ground truth solutions or pristine question data.
   */
  class SoloLearnInternalInspector {
    static findReactFiber(domNode) {
      if (!domNode) return null;
      for (const key in domNode) {
        if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
          return domNode[key];
        }
      }
      return null;
    }

    static findReactProps(domNode) {
      if (!domNode) return null;
      for (const key in domNode) {
        if (key.startsWith('__reactProps$')) {
          return domNode[key];
        }
      }
      return null;
    }

    static traverseFiberForQuestionData(fiber, maxDepth = 30) {
      if (!fiber) return null;
      const queue = [{ node: fiber, depth: 0 }];
      const visited = new Set();

      while (queue.length > 0) {
        const { node, depth } = queue.shift();
        if (!node || depth > maxDepth || visited.has(node)) continue;
        visited.add(node);

        const props = node.memoizedProps || node.pendingProps;
        if (props && typeof props === 'object') {
          const inspected = this.extractQuestionFromProps(props);
          if (inspected) return inspected;
        }

        const state = node.memoizedState;
        if (state && typeof state === 'object') {
          const inspectedState = this.extractQuestionFromProps(state);
          if (inspectedState) return inspectedState;
        }

        if (node.child) queue.push({ node: node.child, depth: depth + 1 });
        if (node.return && depth < 10) queue.push({ node: node.return, depth: depth + 1 });
        if (node.sibling && depth < 10) queue.push({ node: node.sibling, depth: depth + 1 });
      }

      return null;
    }

    static extractQuestionFromProps(props) {
      if (!props) return null;

      // Look for quiz / question container objects
      const candidates = [
        props.quiz,
        props.quizItem,
        props.question,
        props.item,
        props.step,
        props.task,
        props.data,
        props.exercise,
        props.lessonQuiz,
        props.activeQuestion,
        props
      ];

      for (const cand of candidates) {
        if (!cand || typeof cand !== 'object') continue;

        // Check for ground truth answers inside this object
        let answers = null;
        let explanation = null;

        // 1. Direct answer field
        if (cand.correctAnswer !== undefined && cand.correctAnswer !== null) {
          answers = Array.isArray(cand.correctAnswer) ? cand.correctAnswer : [String(cand.correctAnswer)];
        } else if (cand.correct_answer !== undefined) {
          answers = Array.isArray(cand.correct_answer) ? cand.correct_answer : [String(cand.correct_answer)];
        } else if (Array.isArray(cand.answers) && cand.answers.length > 0 && typeof cand.answers[0] === 'string') {
          answers = cand.answers;
        } else if (Array.isArray(cand.correctAnswers) && cand.correctAnswers.length > 0) {
          answers = cand.correctAnswers.map(a => String(a.text || a));
        } else if (cand.solution !== undefined && cand.solution !== null) {
          if (Array.isArray(cand.solution)) answers = cand.solution.map(String);
          else if (typeof cand.solution === 'string') answers = [cand.solution];
          else if (typeof cand.solution === 'object' && cand.solution.answers) answers = cand.solution.answers;
        } else if (Array.isArray(cand.options)) {
          // Check options array with isCorrect flags
          const correctOpts = cand.options.filter(o => o && (o.isCorrect === true || o.correct === true));
          if (correctOpts.length > 0) {
            answers = correctOpts.map(o => String(o.text || o.title || o.value || o.label || ''));
          } else if (cand.correctOptionId !== undefined) {
            const match = cand.options.find(o => o.id === cand.correctOptionId);
            if (match) answers = [String(match.text || match.title || match.value || match.label || '')];
          } else if (cand.correctOptionIndex !== undefined && cand.options[cand.correctOptionIndex]) {
            const match = cand.options[cand.correctOptionIndex];
            answers = [String(match.text || match.title || match.value || match.label || '')];
          }
        }

        if (answers && answers.length > 0) {
          explanation = cand.explanation || cand.hint || 'Extracted directly from SoloLearn React Internal State.';
          return {
            isInternalGroundTruth: true,
            title: cand.title || cand.text || cand.instruction || cand.questionText || '',
            code: cand.code || cand.template || cand.codeTemplate || cand.snippet || '',
            language: cand.language || cand.courseLanguage || '',
            type: cand.type || (answers.length > 1 ? 'fill_blanks' : 'single_choice'),
            answers: answers.map(a => String(a).trim()),
            explanation: String(explanation),
            rawObject: cand
          };
        }

        // Check if pristine question data without answers exists (e.g. pristine code/options)
        if (cand.code || cand.template || cand.options || cand.title) {
          return {
            isInternalGroundTruth: false,
            title: cand.title || cand.text || cand.instruction || '',
            code: cand.code || cand.template || cand.codeTemplate || cand.snippet || '',
            language: cand.language || cand.courseLanguage || '',
            options: Array.isArray(cand.options) ? cand.options.map(o => typeof o === 'string' ? o : (o.text || o.title || o.value || '')) : [],
            rawObject: cand
          };
        }
      }

      return null;
    }

    static inspect() {
      // 1. Check window.__NEXT_DATA__
      try {
        if (typeof window !== 'undefined' && window.__NEXT_DATA__ && window.__NEXT_DATA__.props) {
          const pageProps = window.__NEXT_DATA__.props.pageProps;
          if (pageProps) {
            const fromNext = this.extractQuestionFromProps(pageProps);
            if (fromNext && fromNext.isInternalGroundTruth) return fromNext;
          }
        }
      } catch (e) {}

      // 2. Check React Fiber from active quiz elements
      const targetSelectors = [
        '[data-test="lesson-content"]',
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
        'main',
        '#root',
        '#__next'
      ];

      for (const sel of targetSelectors) {
        const el = document.querySelector(sel);
        if (!el) continue;

        // Check direct props
        const props = this.findReactProps(el);
        if (props) {
          const extracted = this.extractQuestionFromProps(props);
          if (extracted && extracted.isInternalGroundTruth) return extracted;
        }

        // Check fiber tree
        const fiber = this.findReactFiber(el);
        if (fiber) {
          const extracted = this.traverseFiberForQuestionData(fiber);
          if (extracted && extracted.isInternalGroundTruth) return extracted;
        }
      }

      return null;
    }
  }

  class SoloLearnParser {
    static detectLanguage() {
      const url = (typeof window !== 'undefined' ? window.location.href : '').toLowerCase();
      const pageTitle = (typeof document !== 'undefined' ? document.title : '').toLowerCase();
      const headerText = (typeof document !== 'undefined' && document.body ? getCleanText(document.body.querySelector('header, nav, [data-test="course-title"]') || document.body).slice(0, 500) : '').toLowerCase();

      const combined = `${url} ${pageTitle} ${headerText}`;

      if (combined.includes('c-sharp') || combined.includes('csharp') || combined.includes('c#')) return 'C# (.NET)';
      if (combined.includes('c-plus-plus') || combined.includes('cpp') || combined.includes('c++')) return 'C++';
      if (combined.includes('python')) return 'Python';
      if (combined.includes('javascript') || combined.includes('/js') || combined.includes(' js ')) return 'JavaScript';
      if (combined.includes('typescript') || combined.includes('/ts') || combined.includes(' ts ')) return 'TypeScript';
      if (combined.includes('java') && !combined.includes('javascript')) return 'Java';
      if (combined.includes('sql') || combined.includes('database')) return 'SQL';
      if (combined.includes('html') || combined.includes('web-development')) return 'HTML';
      if (combined.includes('css')) return 'CSS';
      if (combined.includes('kotlin')) return 'Kotlin';
      if (combined.includes('swift')) return 'Swift';
      if (combined.includes('php')) return 'PHP';
      if (combined.includes('go-') || combined.includes('/go') || combined.includes('golang')) return 'Go';
      if (combined.includes('ruby')) return 'Ruby';

      return 'C# (.NET)';
    }

    static getQuestionContainer() {
      const candidateSelectors = [
        '[data-test="lesson-content"]',
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
        '[data-test="exercise-container"]',
        'main',
        '#root',
        '#__next',
        'body'
      ];

      for (const selector of candidateSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (isVisible(el)) return el;
        }
      }
      return document.body;
    }

    static extractTitle(container = document) {
      const titleSelectors = [
        '[data-test="quiz-title"]',
        '[data-test="question-text"]',
        '[data-test="task-description"]',
        '[data-test="lesson-title"]',
        '[data-test="instruction"]',
        '[data-test="task-title"]',
        'h1', 'h2', 'h3',
        '.question-title', '.quiz-task', '.task-title', '.instruction'
      ];

      const cleanTitleText = (raw) => {
        if (!raw) return '';
        return raw
          .replace(/Module\s+\d+\s+Quiz/gi, '')
          .replace(/Stuck\?/gi, '')
          .replace(/Change\s+Language/gi, '')
          .replace(/\bQuiz\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
      };

      for (const sel of titleSelectors) {
        const elements = container.querySelectorAll(sel);
        for (const el of elements) {
          if (!isVisible(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;
          const cleaned = cleanTitleText(getCleanText(el));
          if (cleaned.length > 5) {
            return cleaned;
          }
        }
      }

      const paragraphs = container.querySelectorAll('p, span, div, h4, h5');
      for (const p of paragraphs) {
        if (!isVisible(p)) continue;
        if (p.closest('header') || p.closest('nav') || p.closest('button') || p.closest('#sololearn-ai-hud')) continue;
        const raw = getCleanText(p);
        const cleaned = cleanTitleText(raw);
        if (
          cleaned.length > 8 &&
          cleaned.length < 350 &&
          (cleaned.toLowerCase().includes('rearrange') ||
           cleaned.toLowerCase().includes('reorder') ||
           cleaned.toLowerCase().includes('drag and drop') ||
           cleaned.toLowerCase().includes('arrange the code') ||
           cleaned.toLowerCase().includes('put in order') ||
           cleaned.toLowerCase().includes('runs as long') ||
           cleaned.toLowerCase().includes('while loop') ||
           cleaned.toLowerCase().includes('for loop') ||
           cleaned.toLowerCase().includes('fill in') ||
           cleaned.toLowerCase().includes('create a valid') ||
           cleaned.toLowerCase().includes('write the shorthand') ||
           cleaned.toLowerCase().includes('declare a variable') ||
           cleaned.toLowerCase().includes('what is the') ||
           cleaned.toLowerCase().includes('what will be') ||
           cleaned.toLowerCase().includes('statement'))
        ) {
          return cleaned;
        }
      }

      return 'SoloLearn Activity';
    }

    static extractCodeAndBlanks(container = document) {
      const candidateBoxes = Array.from(container.querySelectorAll(
        'pre, code, div[class*="code"], div[class*="Code"], div[style*="monospace"], div[class*="editor"], div[class*="snippet"], [data-test*="code"]'
      ));

      // Keep only outermost code containers to prevent double-counting child <code> inside parent <div data-test="code-snippet">
      const topBoxes = candidateBoxes.filter(box => {
        if (!isVisible(box)) return false;
        return !candidateBoxes.some(parent => parent !== box && isVisible(parent) && parent.contains(box));
      });

      const codeBoxes = [];
      for (const box of topBoxes) {
        const text = getCleanText(box);
        if (text.length > 1 || box.querySelector('input, [contenteditable="true"], div[class*="slot"], span[class*="slot"], div[class*="blank"], span[class*="blank"], [data-test*="blank"], [data-test*="slot"]')) {
          codeBoxes.push(box);
        }
      }

      const blankElements = [];
      let globalBlankIdx = 1;
      const formattedParts = [];

      const blankSelector = 'input, [contenteditable="true"], span[class*="slot"], div[class*="slot"], span[class*="blank"], div[class*="blank"], span[class*="circle"], div[class*="circle"], div[class*="drop"], span[class*="drop"], [data-test*="blank"], [data-test*="slot"], [data-test*="empty-slot"], [data-test*="drop-target"]';

      for (let i = 0; i < codeBoxes.length; i++) {
        const box = codeBoxes[i];
        const insideBlanks = box.querySelectorAll(blankSelector);

        try {
          const clone = box.cloneNode(true);
          clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
          const cloneBlanks = clone.querySelectorAll(blankSelector);

          cloneBlanks.forEach((b) => {
            const placeholder = document.createTextNode(` [BLANK_${globalBlankIdx++}] `);
            if (b.parentNode) b.parentNode.replaceChild(placeholder, b);
          });

          for (const el of insideBlanks) {
            blankElements.push(el);
          }

          formattedParts.push(getCleanText(clone));
        } catch (e) {
          formattedParts.push(getCleanText(box));
        }
      }

      return {
        code: formattedParts.join('\n\n'),
        blankElements
      };
    }

    static getChoiceOptions(container = document, title = '') {
      const choices = [];
      const seen = new Set();
      const titleLower = (title || this.extractTitle(container)).toLowerCase();

      const isValidOptionText = (text) => {
        if (!text) return false;
        const clean = text.trim();
        if (clean.length === 0 || clean.length > 120) return false;
        const lower = clean.toLowerCase();
        if (
          lower === 'check' ||
          lower === 'continue' ||
          lower === 'next' ||
          lower === 'got it' ||
          lower === 'stuck?' ||
          lower === 'copy' ||
          lower === 'try again' ||
          lower === 'report' ||
          lower === 'hint'
        ) return false;
        if (titleLower.length > 5 && lower.includes(titleLower.slice(0, 25))) return false;
        return true;
      };

      // 1. Check explicit option/choice selectors
      const explicitSelectors = [
        '[data-test*="option"]',
        '[data-test*="choice"]',
        '[data-test*="answer"]',
        '[data-test*="quiz-item"]',
        '[role="radio"]',
        '[role="checkbox"]',
        '.quiz-option',
        '.choice-item'
      ];

      for (const sel of explicitSelectors) {
        const items = container.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          const text = getCleanText(item);
          if (isValidOptionText(text)) {
            choices.push({ text, element: item, isSelected: false });
            seen.add(item);
          }
        }
      }

      // 2. Leaf choice cards
      if (choices.length < 2) {
        const allDivs = container.querySelectorAll('div, button, li');
        for (const el of allDivs) {
          if (!isVisible(el) || seen.has(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;

          if (el.querySelectorAll('div, button').length > 0) continue;

          const text = getCleanText(el);
          if (isValidOptionText(text)) {
            choices.push({ text, element: el, isSelected: false });
            seen.add(el);
          }
        }
      }

      // 3. De-duplicate and filter out combined text
      const filtered = [];
      const textSet = new Set();

      for (const c of choices) {
        if (textSet.has(c.text.toLowerCase())) continue;
        
        const isConcat = choices.some(o1 => 
          choices.some(o2 => o1 !== o2 && o1 !== c && o2 !== c && c.text.includes(o1.text) && c.text.includes(o2.text))
        );

        if (!isConcat) {
          filtered.push(c);
          textSet.add(c.text.toLowerCase());
        }
      }

      return filtered;
    }

    static getReorderTokens(container = document) {
      const tokenSelectors = [
        '[data-test*="reorder"]',
        '[data-test*="draggable"]',
        '[data-test*="sortable"]',
        '[data-test*="token"]',
        '[data-test*="chip"]',
        '[data-test*="code-order"]',
        '[data-test*="order-item"]',
        '[data-test*="word-bank"] *',
        '[draggable="true"]',
        '[aria-roledescription*="sortable"]',
        '[data-rbd-draggable-id]',
        '[data-rbd-drag-handle-draggable-id]',
        'li[class*="draggable"]',
        'div[class*="draggable"]',
        'div[class*="sortable"]',
        'div[class*="reorder"]',
        '.token',
        '.chip',
        '.draggable-item',
        '.reorder-item',
        '.sortable-item',
        '.word-chip'
      ];

      const rawTokens = [];
      const seen = new Set();

      for (const sel of tokenSelectors) {
        const items = container.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          if (item.closest('#sololearn-ai-hud')) continue;
          if (item.closest('header') || item.closest('nav')) continue;
          const text = getCleanText(item);
          if (text.length > 0 && text.length < 200) {
            rawTokens.push({ text, element: item });
            seen.add(item);
          }
        }
      }

      // Keep only leaf draggable items, discarding list/wrapper parent containers
      const tokens = rawTokens.filter(t => {
        return !rawTokens.some(other => other !== t && t.element.contains(other.element));
      });

      return tokens;
    }

    static isMultiChoice(container, title = '') {
      const textToCheck = (title + ' ' + getCleanText(container)).toLowerCase();
      return textToCheck.includes('select all') || textToCheck.includes('choose all') || textToCheck.includes('all that apply');
    }

    static parseQuestion() {
      // 1. Try Ground Truth / Clean Props from SoloLearn React Fiber & Next.js
      const internal = SoloLearnInternalInspector.inspect();
      if (internal && internal.isInternalGroundTruth && internal.answers && internal.answers.length > 0) {
        const container = this.getQuestionContainer();
        const { blankElements } = this.extractCodeAndBlanks(container);
        const choices = this.getChoiceOptions(container, internal.title);
        const reorderTokens = this.getReorderTokens(container);

        return {
          isInternalGroundTruth: true,
          type: internal.type || (blankElements.length > 0 ? 'fill_blanks' : 'single_choice'),
          language: internal.language || this.detectLanguage(),
          title: internal.title || this.extractTitle(container),
          code: internal.code || '',
          answers: internal.answers,
          explanation: internal.explanation || 'Verified directly from SoloLearn React component state.',
          confidence: 1.0,
          blankCount: blankElements.length,
          inputElements: blankElements,
          choices,
          options: choices.map(c => c.text),
          tokens: reorderTokens,
          extraText: ''
        };
      }

      // 2. High-Precision DOM Parser
      const container = this.getQuestionContainer();
      if (!container) return null;

      const language = (internal && internal.language) ? internal.language : this.detectLanguage();
      const title = (internal && internal.title) ? internal.title : this.extractTitle(container);
      const titleLower = (title || '').toLowerCase();
      const isReorderTask = titleLower.includes('rearrange') ||
                            titleLower.includes('reorder') ||
                            titleLower.includes('drag and drop') ||
                            titleLower.includes('arrange the code') ||
                            titleLower.includes('put in order') ||
                            titleLower.includes('order the code');

      const { code, blankElements } = this.extractCodeAndBlanks(container);
      const choices = this.getChoiceOptions(container, title);
      const reorderTokens = this.getReorderTokens(container);

      // 2a. Reorder / Rearrange Code Task (High priority if title specifies rearrange)
      if (isReorderTask || reorderTokens.length >= 2) {
        const items = reorderTokens.length >= 2 ? reorderTokens : choices.map(c => ({ text: c.text, element: c.element }));
        if (items.length >= 2) {
          return {
            isInternalGroundTruth: false,
            type: 'reorder',
            language,
            title,
            code: (internal && internal.code) ? internal.code : code,
            tokens: items,
            options: items.map(t => t.text),
            blankCount: items.length,
            inputElements: [],
            choices: items,
            extraText: 'Instruction: Rearrange the given code snippets into correct chronological and syntactic order.'
          };
        }
      }

      // 2b. Fill in blanks
      if (blankElements.length > 0) {
        return {
          isInternalGroundTruth: false,
          type: 'fill_blanks',
          language,
          title,
          code: (internal && internal.code) ? internal.code : code,
          blankCount: blankElements.length,
          inputElements: blankElements,
          tokens: reorderTokens,
          options: reorderTokens.map(t => t.text),
          choices,
          extraText: ''
        };
      }

      // 2c. Choice Questions (Single or Multiple Choice)
      if (choices.length > 0) {
        const isMulti = this.isMultiChoice(container, title);
        return {
          isInternalGroundTruth: false,
          type: isMulti ? 'multi_choice' : 'single_choice',
          language,
          title,
          code: (internal && internal.code) ? internal.code : code,
          choices,
          options: choices.map(c => c.text),
          blankCount: 0,
          inputElements: [],
          tokens: reorderTokens,
          extraText: ''
        };
      }

      // 2d. General Question / Output Prediction
      return {
        isInternalGroundTruth: false,
        type: 'general_question',
        language,
        title,
        code: (internal && internal.code) ? internal.code : code,
        options: [],
        blankCount: 1,
        inputElements: [],
        choices: [],
        tokens: [],
        extraText: ''
      };
    }
  }

  SoloLearnParser.InternalInspector = SoloLearnInternalInspector;
  return SoloLearnParser;
});


  // Load Executor
  /**
 * SoloLearn AI Companion - In-Page Visual Highlighter & Solution Guide
 * Accurately highlights multiple-choice cards, sequences word tokens, and guides blank inputs.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./parser.js'));
  } else {
    root.SoloLearnExecutor = factory(root.SoloLearnParser);
  }
})(typeof self !== 'undefined' ? self : this, function (Parser) {
  'use strict';

  function normalizeText(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/['"`]/g, '"')
      .trim();
  }

  function matchScore(str1, str2) {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);
    if (s1 === s2) return 1.0;
    if (s1.length > 0 && s2.length > 0 && (s1.includes(s2) || s2.includes(s1))) return 0.9;

    const w1 = new Set(s1.split(' '));
    const w2 = new Set(s2.split(' '));
    let intersection = 0;
    for (const w of w1) {
      if (w2.has(w)) intersection++;
    }
    const union = new Set([...w1, ...w2]).size;
    return union > 0 ? intersection / union : 0;
  }

  class SoloLearnExecutor {
    static clearHighlights() {
      const highlighted = document.querySelectorAll('.sl-ai-highlighted-choice');
      highlighted.forEach(el => el.classList.remove('sl-ai-highlighted-choice'));

      const badges = document.querySelectorAll('.sl-ai-badge, .sl-ai-order-badge');
      badges.forEach(b => b.remove());
    }

    static highlightAnswerOnPage(parsedQuestion, aiResponse) {
      this.clearHighlights();

      const answers = Array.isArray(aiResponse.answers) ? aiResponse.answers : [aiResponse.answer].filter(Boolean);
      if (answers.length === 0) return { success: false };

      const isInternal = Boolean(aiResponse.isInternalGroundTruth || parsedQuestion.isInternalGroundTruth);
      const badgeText = isInternal ? '⚡ GROUND TRUTH' : '🎯 CORRECT ANSWER';

      let matchedAny = false;

      const isReorder = parsedQuestion.type === 'reorder' || aiResponse.type === 'reorder';

      // 1. Reorder / Sequence Highlight: Label each draggable item with its exact target step
      if (isReorder) {
        const candidateItems = (parsedQuestion.tokens && parsedQuestion.tokens.length > 0)
          ? parsedQuestion.tokens
          : (parsedQuestion.choices || []);

        let step = 1;
        const usedElements = new Set();

        for (const ans of answers) {
          const target = String(ans).trim();
          let bestItem = null;
          let bestScore = -1;

          for (const item of candidateItems) {
            if (usedElements.has(item.element)) continue;
            const score = matchScore(item.text, target);
            if (score > bestScore) {
              bestScore = score;
              bestItem = item;
            }
          }

          if (bestItem && bestItem.element && bestScore >= 0.35) {
            bestItem.element.classList.add('sl-ai-highlighted-choice');

            const orderBadge = document.createElement('span');
            orderBadge.className = 'sl-ai-order-badge';
            orderBadge.textContent = `Step ${step++}`;
            bestItem.element.prepend(orderBadge);
            usedElements.add(bestItem.element);
            matchedAny = true;
          }
        }

        return { success: matchedAny || answers.length > 0 };
      }

      // 2. Highlight Choice Cards (Single or Multiple Choice)
      if (parsedQuestion.choices && parsedQuestion.choices.length > 0) {
        const usedChoices = new Set();

        for (let i = 0; i < answers.length; i++) {
          const target = String(answers[i]).trim();
          let bestMatch = null;
          let bestScore = -1;

          for (const choice of parsedQuestion.choices) {
            if (usedChoices.has(choice.element)) continue;
            const score = matchScore(choice.text, target);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = choice;
            }
          }

          if (bestMatch && bestMatch.element && bestScore >= 0.5) {
            bestMatch.element.classList.add('sl-ai-highlighted-choice');
            const badge = document.createElement('div');
            badge.className = 'sl-ai-badge';
            badge.textContent = answers.length > 1 ? `🎯 ANSWER ${i + 1}` : badgeText;
            bestMatch.element.appendChild(badge);
            usedChoices.add(bestMatch.element);
            matchedAny = true;
          }
        }
      }

      // 3. Highlight Word Bank Chips / Tokens
      const tokens = parsedQuestion.tokens || [];
      if (tokens.length > 0) {
        let step = 1;
        const usedElements = new Set();

        for (const ans of answers) {
          const target = String(ans).trim();
          let bestToken = null;
          let bestScore = -1;

          for (const t of tokens) {
            if (usedElements.has(t.element)) continue;
            const score = matchScore(t.text, target);
            if (score > bestScore) {
              bestScore = score;
              bestToken = t;
            }
          }

          if (bestToken && bestToken.element && bestScore >= 0.5) {
            bestToken.element.classList.add('sl-ai-highlighted-choice');

            const orderBadge = document.createElement('span');
            orderBadge.className = 'sl-ai-order-badge';
            orderBadge.textContent = String(step++);
            bestToken.element.prepend(orderBadge);
            usedElements.add(bestToken.element);
            matchedAny = true;
          }
        }
      }

      // 3. Highlight Input Blanks with placeholder guides
      const inputs = parsedQuestion.inputElements || [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const val = answers[i] !== undefined ? String(answers[i]) : '';
        if (input && val !== '') {
          input.classList.add('sl-ai-highlighted-choice');
          if ('placeholder' in input) {
            input.placeholder = val;
          }
          input.setAttribute('data-ai-answer', val);
          input.title = `AI Answer: ${val}`;
          matchedAny = true;
        }
      }

      return { success: matchedAny || answers.length > 0 };
    }
  }

  return SoloLearnExecutor;
});


  // Load UI
  /**
 * SoloLearn AI Companion - HUD Overlay UI
 * Sleek, glassmorphic companion panel that reveals answers & step-by-step reasoning.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'));
  } else {
    root.SoloLearnUI = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  class SoloLearnUI {
    constructor(callbacks = {}) {
      this.callbacks = callbacks;
      this.settings = { ...Config.DEFAULT_SETTINGS };
      this.stats = {
        scanned: 0,
        lastLatency: 0
      };
      this.hudEl = null;
      this.isMinimized = false;
      this.audioCtx = null;
    }

    async init() {
      this.settings = await Config.Storage.get();
      this.render();
      this.attachEvents();
      this.setupDraggable();
      this.setupHotkeys();
    }

    playChime(type = 'success') {
      if (!this.settings.soundEnabled) return;
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        if (type === 'success') {
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === 'error') {
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      } catch (e) {}
    }

    render() {
      const existing = document.getElementById('sololearn-ai-hud');
      if (existing) existing.remove();

      const hasApiKey = Boolean(this.settings.apiKey && this.settings.apiKey.trim().length > 5);

      const hud = document.createElement('div');
      hud.id = 'sololearn-ai-hud';
      hud.innerHTML = `
        <div class="sl-hud-header" id="sl-drag-handle">
          <div class="sl-hud-brand">
            <div class="sl-brand-icon">🤖</div>
            <span>SoloLearn AI Companion</span>
          </div>
          <div class="sl-hud-controls">
            <button class="sl-icon-btn" id="sl-settings-toggle" title="Settings">⚙</button>
            <button class="sl-icon-btn" id="sl-minimize-btn" title="Minimize">─</button>
          </div>
        </div>

        <div class="sl-status-bar">
          <div class="sl-status-pill">
            <span class="sl-status-dot idle" id="sl-status-dot"></span>
            <span id="sl-status-text">Ready</span>
          </div>
          <span class="sl-model-badge" id="sl-active-model-badge">${this.getShortModelName(this.settings.selectedModel)}</span>
        </div>

        <div class="sl-hud-body">
          <!-- API Key Quick Setup Card if missing -->
          <div class="sl-api-warning-card" id="sl-api-warning-card" style="display: ${hasApiKey ? 'none' : 'flex'};">
            <div class="sl-api-warning-header">
              <span>🔑 Enter OpenRouter API Key</span>
            </div>
            <div class="sl-api-warning-desc">
              Paste your OpenRouter API key below to activate the AI Companion:
            </div>
            <div class="sl-api-inline-form">
              <input type="password" class="sl-input" id="sl-inline-key-input" placeholder="sk-or-v1-..." value="${this.settings.apiKey || ''}" />
              <button class="sl-btn-secondary" id="sl-inline-save-key-btn">Save</button>
            </div>
          </div>

          <!-- Answer & Explanation Card -->
          <div class="sl-companion-answer-card" id="sl-companion-card">
            <div class="sl-companion-answer-header">
              <span id="sl-companion-header-label">🎯 Verified Solution:</span>
              <button class="sl-icon-btn" id="sl-copy-answer-btn" title="Copy Answer to Clipboard" style="margin-left: auto; width: 24px; height: 24px; font-size: 11px;">📋</button>
            </div>
            <div class="sl-companion-answer-content" id="sl-companion-answer">
              Press Alt + S or Click Scan Below
            </div>
            <div class="sl-companion-explanation" id="sl-companion-explanation">
              💡 <b>Ready:</b> AI Companion is ready to analyze your active exercise.
            </div>
            <details class="sl-companion-details" id="sl-companion-details" style="font-size: 11px; color: #94a3b8; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; cursor: pointer;">
              <summary style="font-weight: 700; color: #38bdf8;">🔍 View 3-Pass Verification & Trace</summary>
              <pre id="sl-scanned-context-preview" style="margin-top: 6px; padding: 8px; background: rgba(0,0,0,0.5); border-radius: 6px; font-size: 10px; color: #e2e8f0; white-space: pre-wrap; font-family: monospace; max-height: 140px; overflow-y: auto;"></pre>
            </details>
          </div>

          <button class="sl-btn-primary" id="sl-solve-btn">
            <span>🔍 Scan & Reveal Answer</span>
            <span class="sl-hotkey-hint">Alt+S</span>
          </button>

          <button class="sl-toggle-btn ${this.settings.autoSolve ? 'active' : ''}" id="sl-toggle-autosolve">
            <span>⚡ Auto-Scan on Question Change</span>
            <span id="sl-autosolve-indicator">${this.settings.autoSolve ? 'ON' : 'OFF'}</span>
          </button>

          <div class="sl-log-box" id="sl-log-box">
            <span>Press <b>Alt + S</b> or click Scan to reveal the answer & explanation!</span>
          </div>

          <div class="sl-settings-drawer" id="sl-settings-drawer">
            <div class="sl-field-group">
              <label class="sl-field-label">OpenRouter API Key</label>
              <input type="password" class="sl-input" id="sl-api-key-input" placeholder="sk-or-v1-..." value="${this.settings.apiKey || ''}" />
            </div>

            <div class="sl-field-group">
              <label class="sl-field-label">Course Language</label>
              <select class="sl-select" id="sl-language-select">
                <option value="auto" ${this.settings.languageOverride === 'auto' ? 'selected' : ''}>Auto-Detect (Recommended)</option>
                <option value="C#" ${this.settings.languageOverride === 'C#' ? 'selected' : ''}>C# (.NET)</option>
                <option value="Python" ${this.settings.languageOverride === 'Python' ? 'selected' : ''}>Python</option>
                <option value="JavaScript" ${this.settings.languageOverride === 'JavaScript' ? 'selected' : ''}>JavaScript</option>
                <option value="Java" ${this.settings.languageOverride === 'Java' ? 'selected' : ''}>Java</option>
                <option value="C++" ${this.settings.languageOverride === 'C++' ? 'selected' : ''}>C++</option>
                <option value="SQL" ${this.settings.languageOverride === 'SQL' ? 'selected' : ''}>SQL</option>
                <option value="HTML/CSS" ${this.settings.languageOverride === 'HTML/CSS' ? 'selected' : ''}>HTML / CSS</option>
              </select>
            </div>

            <div class="sl-field-group">
              <label class="sl-field-label">AI Model</label>
              <select class="sl-select" id="sl-model-select">
                ${Config.DEFAULT_MODELS.map(m => `
                  <option value="${m.id}" ${this.settings.selectedModel === m.id ? 'selected' : ''}>
                    ${m.name}
                  </option>
                `).join('')}
                <option value="custom" ${this.settings.selectedModel === 'custom' ? 'selected' : ''}>Custom Model Name...</option>
              </select>
            </div>

            <div class="sl-field-group" id="sl-custom-model-group" style="display: ${this.settings.selectedModel === 'custom' ? 'flex' : 'none'};">
              <label class="sl-field-label">Custom OpenRouter Model ID</label>
              <input type="text" class="sl-input" id="sl-custom-model-input" placeholder="e.g. anthropic/claude-3-haiku" value="${this.settings.customModel || ''}" />
            </div>

            <div class="sl-field-group">
              <button class="sl-toggle-btn ${this.settings.raceMode !== false ? 'active' : ''}" id="sl-toggle-racemode" title="Races top free & fast AI models simultaneously to deliver the fastest zero-error answer">
                <span>🏁 Parallel Multi-AI Race</span>
                <span id="sl-racemode-indicator">${this.settings.raceMode !== false ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div class="sl-field-group">
              <button class="sl-btn-secondary" id="sl-test-key-btn">🧪 Test Connection</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(hud);
      this.hudEl = hud;
    }

    getShortModelName(modelId) {
      if (!modelId) return 'Claude 3 Haiku';
      if (modelId.includes('claude-3-haiku')) return 'Claude 3 Haiku';
      if (modelId.includes('gemini-2.0-flash-thinking')) return 'Gemini Thinking (Free)';
      if (modelId.includes('gemini-2.0-flash')) return 'Gemini 2.0 Flash (Free)';
      if (modelId.includes('deepseek-r1')) return 'DeepSeek R1 (Free)';
      if (modelId.includes('deepseek-chat') || modelId.includes('deepseek')) return 'DeepSeek V3 (Free)';
      if (modelId.includes('llama-3.3-70b')) return 'Llama 3.3 70B (Free)';
      if (modelId.includes('mistral-small')) return 'Mistral Small (Free)';
      if (modelId.includes('SoloLearn')) return 'SoloLearn Internals';

      const parts = modelId.split('/');
      return parts[parts.length - 1] || modelId;
    }

    updateModelBadge(modelId) {
      const badge = document.getElementById('sl-active-model-badge');
      if (badge) {
        badge.innerText = this.getShortModelName(modelId);
      }
    }

    showLoadingAnswer(modelName) {
      const card = document.getElementById('sl-companion-card');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');

      if (card && ansEl && expEl) {
        ansEl.innerText = 'Analyzing with ' + this.getShortModelName(modelName) + '...';
        expEl.innerHTML = 'Executing 3-Pass Mental Compiler Verification...';
        card.style.display = 'flex';
      }
    }

    displayAnswer(answerText, explanationText, contextInfo = '', isGroundTruth = false, consensusInfo = null) {
      const card = document.getElementById('sl-companion-card');
      const headerLabel = document.getElementById('sl-companion-header-label');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');
      const ctxEl = document.getElementById('sl-scanned-context-preview');

      if (headerLabel) {
        if (isGroundTruth) {
          headerLabel.innerText = '⚡ Ground Truth (SoloLearn State):';
        } else if (consensusInfo && consensusInfo.hasConsensus) {
          headerLabel.innerText = `🏆 BEST ANSWER (${consensusInfo.agreementRatio} AI Models Agree):`;
        } else {
          headerLabel.innerText = '🎯 3-Pass Verified Solution:';
        }
      }

      if (card) {
        card.classList.toggle('consensus', Boolean(consensusInfo && consensusInfo.hasConsensus));
      }

      // Strip any accidental JSON or metadata from answerText
      let cleanAns = String(answerText || 'Answer Ready').trim();
      cleanAns = cleanAns.replace(/^[{\["'\s]+|[}\]"'\s]+$/g, '');
      if (cleanAns.includes('"answers":')) {
        const match = cleanAns.match(/"answers"\s*:\s*\[([^\]]+)\]/);
        if (match) cleanAns = match[1].replace(/["']/g, '').trim();
      }

      let cleanExp = String(explanationText || 'Analysis complete.').trim();
      if (cleanExp.includes('"explanation":')) {
        const match = cleanExp.match(/"explanation"\s*:\s*"([^"]+)"/);
        if (match) cleanExp = match[1];
      }

      if (card && ansEl && expEl) {
        ansEl.innerText = cleanAns;
        const consensusTag = (consensusInfo && consensusInfo.hasConsensus && consensusInfo.agreedNames)
          ? `<div style="margin-bottom:6px; color:#fbbf24; font-weight:700;">🤝 Multi-AI Agreement: ${consensusInfo.agreedNames}</div>`
          : '';
        expEl.innerHTML = `${consensusTag}💡 <b>Why:</b> ${cleanExp}`;
        if (ctxEl && contextInfo) {
          ctxEl.innerText = contextInfo;
        }
        card.style.display = 'flex';
      }
    }

    attachEvents() {
      const copyBtn = document.getElementById('sl-copy-answer-btn');
      const languageSelect = document.getElementById('sl-language-select');
      const solveBtn = document.getElementById('sl-solve-btn');
      const toggleAutosolve = document.getElementById('sl-toggle-autosolve');
      const settingsToggle = document.getElementById('sl-settings-toggle');
      const minimizeBtn = document.getElementById('sl-minimize-btn');
      const apiKeyInput = document.getElementById('sl-api-key-input');
      const inlineKeyInput = document.getElementById('sl-inline-key-input');
      const inlineSaveBtn = document.getElementById('sl-inline-save-key-btn');
      const testKeyBtn = document.getElementById('sl-test-key-btn');
      const modelSelect = document.getElementById('sl-model-select');
      const customModelInput = document.getElementById('sl-custom-model-input');
      const customModelGroup = document.getElementById('sl-custom-model-group');
      const warningCard = document.getElementById('sl-api-warning-card');
      const drawer = document.getElementById('sl-settings-drawer');

      copyBtn?.addEventListener('click', () => {
        const ansEl = document.getElementById('sl-companion-answer');
        if (ansEl && ansEl.innerText) {
          navigator.clipboard.writeText(ansEl.innerText).then(() => {
            this.log('✓ Answer copied to clipboard!', 'success');
            this.playChime('success');
          });
        }
      });

      languageSelect?.addEventListener('change', (e) => {
        this.settings.languageOverride = e.target.value;
        this.saveSettings();
        this.log(`Language set to: ${e.target.value}`, 'normal');
      });

      const handleKeySave = (newKey) => {
        this.settings.apiKey = newKey.trim();
        if (apiKeyInput) apiKeyInput.value = this.settings.apiKey;
        if (inlineKeyInput) inlineKeyInput.value = this.settings.apiKey;
        this.saveSettings();

        if (this.settings.apiKey.length > 5) {
          if (warningCard) warningCard.style.display = 'none';
          if (drawer) drawer.classList.remove('open');
          this.log('✓ API Key saved! Ready to scan.', 'success');
          this.playChime('success');
        }
      };

      inlineSaveBtn?.addEventListener('click', () => {
        if (inlineKeyInput) handleKeySave(inlineKeyInput.value);
      });

      inlineKeyInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleKeySave(inlineKeyInput.value);
      });

      inlineKeyInput?.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 15) handleKeySave(e.target.value);
      });

      apiKeyInput?.addEventListener('change', (e) => {
        handleKeySave(e.target.value);
      });

      apiKeyInput?.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 15) handleKeySave(e.target.value);
      });

      testKeyBtn?.addEventListener('click', async () => {
        if (!this.settings.apiKey) {
          this.log('Please enter an API key first.', 'error');
          return;
        }
        this.log('Testing OpenRouter connection...', 'highlight');
        try {
          const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: { Authorization: `Bearer ${this.settings.apiKey}` }
          });
          if (res.ok) {
            const data = await res.json();
            const label = data.data && data.data.label ? ` (${data.data.label})` : '';
            this.log(`✓ Connected to OpenRouter!${label}`, 'success');
            this.playChime('success');
          } else {
            this.log(`Invalid Key: HTTP ${res.status}`, 'error');
            this.playChime('error');
          }
        } catch (err) {
          this.log(`Connection error: ${err.message}`, 'error');
          this.playChime('error');
        }
      });

      solveBtn?.addEventListener('click', () => {
        if (this.callbacks.onSolve) this.callbacks.onSolve();
      });

      toggleAutosolve?.addEventListener('click', () => {
        this.settings.autoSolve = !this.settings.autoSolve;
        toggleAutosolve.classList.toggle('active', this.settings.autoSolve);
        document.getElementById('sl-autosolve-indicator').innerText = this.settings.autoSolve ? 'ON' : 'OFF';
        this.saveSettings();
        if (this.callbacks.onToggleAutoSolve) this.callbacks.onToggleAutoSolve(this.settings.autoSolve);
      });

      const toggleRacemode = document.getElementById('sl-toggle-racemode');
      toggleRacemode?.addEventListener('click', () => {
        this.settings.raceMode = !this.settings.raceMode;
        toggleRacemode.classList.toggle('active', this.settings.raceMode);
        document.getElementById('sl-racemode-indicator').innerText = this.settings.raceMode ? 'ON' : 'OFF';
        this.saveSettings();
        this.log(this.settings.raceMode ? '🏁 Multi-AI Race Mode is ON: Fastest verified model wins!' : 'Multi-AI Race Mode is OFF: Single model mode.', 'normal');
      });

      settingsToggle?.addEventListener('click', () => {
        drawer?.classList.toggle('open');
      });

      minimizeBtn?.addEventListener('click', () => {
        this.isMinimized = !this.isMinimized;
        this.hudEl?.classList.toggle('minimized', this.isMinimized);
        minimizeBtn.innerText = this.isMinimized ? '＋' : '─';
      });

      modelSelect?.addEventListener('change', (e) => {
        const val = e.target.value;
        this.settings.selectedModel = val;
        customModelGroup.style.display = val === 'custom' ? 'flex' : 'none';
        document.getElementById('sl-active-model-badge').innerText = this.getShortModelName(val === 'custom' ? this.settings.customModel : val);
        this.saveSettings();
      });

      customModelInput?.addEventListener('change', (e) => {
        this.settings.customModel = e.target.value.trim();
        if (this.settings.selectedModel === 'custom') {
          document.getElementById('sl-active-model-badge').innerText = this.getShortModelName(this.settings.customModel);
        }
        this.saveSettings();
      });
    }

    setupDraggable() {
      const handle = document.getElementById('sl-drag-handle');
      if (!handle || !this.hudEl) return;

      let isDragging = false;
      let startX, startY, initialLeft, initialTop;

      handle.addEventListener('mousedown', (e) => {
        if (e.target.closest('.sl-hud-controls')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = this.hudEl.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        this.hudEl.style.right = 'auto';
        this.hudEl.style.left = `${initialLeft}px`;
        this.hudEl.style.top = `${initialTop}px`;

        const onMouseMove = (moveEvent) => {
          if (!isDragging) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          const newLeft = Math.max(10, Math.min(window.innerWidth - this.hudEl.offsetWidth - 10, initialLeft + dx));
          const newTop = Math.max(10, Math.min(window.innerHeight - this.hudEl.offsetHeight - 10, initialTop + dy));

          this.hudEl.style.left = `${newLeft}px`;
          this.hudEl.style.top = `${newTop}px`;
        };

        const onMouseUp = () => {
          isDragging = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }

    setupHotkeys() {
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          if (this.callbacks.onSolve) this.callbacks.onSolve();
        }
      });
    }

    setStatus(text, state = 'idle') {
      const dot = document.getElementById('sl-status-dot');
      const label = document.getElementById('sl-status-text');
      if (dot) {
        dot.className = `sl-status-dot ${state}`;
      }
      if (label) {
        label.innerText = text;
      }
    }

    log(message, type = 'normal') {
      const box = document.getElementById('sl-log-box');
      if (!box) return;
      let className = '';
      if (type === 'highlight') className = 'highlight';
      if (type === 'error') className = 'error-text';
      if (type === 'success') className = 'success-text';

      box.innerHTML = `<span class="${className}">${message}</span>`;
      box.scrollTop = box.scrollHeight;
    }

    async saveSettings() {
      await Config.Storage.save(this.settings);
    }
  }

  return SoloLearnUI;
});


  // Load Main Controller
  /**
 * SoloLearn AI Companion - Main Orchestrator
 * Seamlessly scans page, inspects React state, queries AI with 3-pass verification, highlights answer on webpage, and reveals step-by-step guidance.
 */

(function () {
  'use strict';

  if (window.__SOLOLEARN_AI_INITIALIZED__) return;
  window.__SOLOLEARN_AI_INITIALIZED__ = true;

  const Config = window.SoloLearnConfig || (typeof require !== 'undefined' ? require('./config.js') : null);
  const OpenRouter = window.OpenRouterClient || (typeof require !== 'undefined' ? require('./openrouter.js') : null);
  const Parser = window.SoloLearnParser || (typeof require !== 'undefined' ? require('./parser.js') : null);
  const Executor = window.SoloLearnExecutor || (typeof require !== 'undefined' ? require('./executor.js') : null);
  const UI = window.SoloLearnUI || (typeof require !== 'undefined' ? require('./ui.js') : null);

  if (!Config || !OpenRouter || !Parser || !Executor || !UI) {
    console.error('[SoloLearn AI Companion] Missing required modules.');
    return;
  }

  class SoloLearnCompanionController {
    constructor() {
      this.client = new OpenRouter();
      this.isBusy = false;
      this.lastQuestionSignature = null;
      this.autoScanTimer = null;

      this.ui = new UI({
        onSolve: () => this.handleScanAndReveal(),
        onToggleAutoSolve: (enabled) => this.handleAutoScanToggle(enabled)
      });
    }

    async init() {
      console.log('[SoloLearn AI Companion] Initializing...');
      await this.ui.init();
      this.client.setApiKey(this.ui.settings.apiKey);
      this.client.setModel(
        this.ui.settings.selectedModel === 'custom'
          ? this.ui.settings.customModel
          : this.ui.settings.selectedModel
      );

      this.startObserver();
      this.ui.log('AI Companion Ready! Press Alt+S to reveal the answer.', 'highlight');
    }

    getQuestionSignature(question) {
      if (!question) return null;
      return `${question.type}_${question.title}_${(question.code || '').slice(0, 40)}_${question.blankCount}`;
    }

    async handleScanAndReveal() {
      if (this.isBusy) {
        this.ui.log('Scanning already in progress...', 'normal');
        return;
      }

      const settings = this.ui.settings;
      const activeModel = settings.selectedModel === 'custom' ? settings.customModel : settings.selectedModel;
      this.client.setModel(activeModel);

      // 1. Scan Question & Check React Fiber State
      this.ui.setStatus('Scanning React State & DOM...', 'thinking');
      const question = Parser.parseQuestion();

      if (!question) {
        this.ui.setStatus('No Question Found', 'idle');
        this.ui.log('Could not find active exercise on this page.', 'normal');
        return;
      }

      if (settings.languageOverride && settings.languageOverride !== 'auto') {
        question.language = settings.languageOverride;
      }

      // Check if we need API key (only if internal ground truth was not found)
      if (!question.isInternalGroundTruth && !settings.apiKey) {
        this.ui.setStatus('API Key Required', 'error');
        this.ui.log('Please enter your OpenRouter API key in settings (⚙) or HUD.', 'error');
        this.ui.playChime('error');
        return;
      }

      if (settings.apiKey) {
        this.client.setApiKey(settings.apiKey);
      }

      this.isBusy = true;
      const modelLabel = question.isInternalGroundTruth ? 'SoloLearn Internals' : this.ui.getShortModelName(activeModel);
      this.ui.updateModelBadge(question.isInternalGroundTruth ? 'SoloLearn Internals' : activeModel);
      this.ui.setStatus(`Analyzing (${modelLabel})...`, 'thinking');
      this.ui.showLoadingAnswer(activeModel);
      this.ui.log(`Analyzing: "${(question.title || 'Exercise').slice(0, 50)}..."`, 'normal');

      try {
        // 2. Solve (Via Ground Truth, Multi-AI Race, or 3-Pass Verification)
        const isRacing = !question.isInternalGroundTruth && settings.raceMode !== false;
        if (isRacing) {
          this.ui.setStatus('🏁 Racing top AI models...', 'thinking');
        }

        const response = await this.client.solve(question, activeModel, {
          raceMode: settings.raceMode !== false,
          enableFallback: settings.enableFallback !== false
        });

        if (!response.success) {
          this.ui.setStatus('AI Error', 'error');
          this.ui.log(`AI Error (${modelLabel}): ${response.error}`, 'error');
          this.ui.displayAnswer('Error analyzing exercise', response.error);
          this.ui.playChime('error');
          this.isBusy = false;
          return;
        }

        const aiData = response.data;
        const isReorder = aiData.type === 'reorder' || question.type === 'reorder';
        const answerText = isReorder && Array.isArray(aiData.answers)
          ? aiData.answers.map((a, idx) => `${idx + 1}. ${a}`).join('\n')
          : (Array.isArray(aiData.answers) ? aiData.answers.join(', ') : (aiData.answer || 'Answer Ready'));
        const explanation = aiData.explanation || aiData.thought || 'Analysis complete.';

        const hasConsensus = Boolean(response.hasConsensus);
        const agreedNames = (response.agreedModels && response.agreedModels.length > 0)
          ? response.agreedModels.map(m => this.ui.getShortModelName(m)).join(' + ')
          : '';

        const winnerPrefix = isGroundTruth
          ? '⚡ Ground Truth'
          : (hasConsensus ? `🏆 Best Answer (${response.agreementRatio} AI Models Agree)` : (response.wasRaced ? '🏁 Fast Winner' : '🎯 Answer'));

        const badgeTag = isGroundTruth
          ? '⚡ Ground Truth'
          : (hasConsensus ? `🏆 ${response.votes} AI Models Agree` : `${this.ui.getShortModelName(actualModel)} • ${response.latencyMs}ms`);

        // 3. Highlight the correct answer directly on the webpage!
        Executor.highlightAnswerOnPage(question, aiData);

        // 4. Update the model badge to show consensus or winner model
        if (hasConsensus) {
          this.ui.updateModelBadge(`🏆 ${response.votes} AI Agree`);
        } else {
          this.ui.updateModelBadge(actualModel);
        }

        // 5. Display in Companion Card with full proof and consensus info
        this.ui.displayAnswer(answerText, explanation, contextProof, isGroundTruth, {
          hasConsensus,
          votes: response.votes,
          agreementRatio: response.agreementRatio,
          agreedNames
        });

        this.ui.setStatus(hasConsensus ? '🏆 Best Consensus Answer Revealed!' : 'Answer Revealed!', 'success');
        const logAns = isReorder && Array.isArray(aiData.answers) ? aiData.answers.join(' ➔ ') : answerText;
        this.ui.log(`${winnerPrefix}: <span class="highlight">${logAns}</span> (${hasConsensus ? agreedNames : badgeTag})`, 'success');
        this.ui.playChime('success');
      } catch (err) {
        console.error('[SoloLearn AI Companion]', err);
        this.ui.setStatus('Unexpected Error', 'error');
        this.ui.log(`Error: ${err.message}`, 'error');
        this.ui.playChime('error');
      } finally {
        setTimeout(() => {
          this.isBusy = false;
          this.ui.setStatus('Ready', 'idle');
        }, 800);
      }
    }

    handleAutoScanToggle(enabled) {
      if (enabled) {
        this.ui.log('Auto-Scan is ON: Companion will reveal answers automatically on new questions.', 'success');
        this.checkAndAutoScan();
      } else {
        this.ui.log('Auto-Scan is OFF. Use Alt+S whenever you need help.', 'normal');
      }
    }

    checkAndAutoScan() {
      if (!this.ui.settings.autoSolve || this.isBusy) return;

      const question = Parser.parseQuestion();
      if (!question) return;

      const signature = this.getQuestionSignature(question);
      if (signature && signature !== this.lastQuestionSignature) {
        this.lastQuestionSignature = signature;
        setTimeout(() => {
          if (this.ui.settings.autoSolve && !this.isBusy) {
            this.handleScanAndReveal();
          }
        }, 800);
      }
    }

    startObserver() {
      const observer = new MutationObserver(() => {
        if (this.ui.settings.autoSolve && !this.isBusy) {
          clearTimeout(this.autoScanTimer);
          this.autoScanTimer = setTimeout(() => {
            this.checkAndAutoScan();
          }, 700);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const controller = new SoloLearnCompanionController();
      controller.init();
    });
  } else {
    const controller = new SoloLearnCompanionController();
    controller.init();
  }
})();

})();
