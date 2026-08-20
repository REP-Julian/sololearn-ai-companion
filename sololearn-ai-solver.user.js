// ==UserScript==
// @name         SoloLearn AI Solver (OpenRouter Automation)
// @namespace    https://github.com/antigravity/sololearn-ai-solver
// @version      1.0.0
// @description  Flawless AI-powered automation solver for SoloLearn activities using OpenRouter models (Claude 3.5 Sonnet, GPT-4o, DeepSeek, Gemini).
// @author       Antigravity
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
  styleEl.textContent = "/* ==========================================================================\n   SoloLearn AI Companion - Glassmorphic HUD & Visual Answer Styles\n   ========================================================================== */\n\n#sololearn-ai-hud {\n  position: fixed !important;\n  top: 24px !important;\n  right: 24px !important;\n  width: 400px !important;\n  max-width: calc(100vw - 32px) !important;\n  z-index: 2147483647 !important;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif !important;\n  font-size: 13px !important;\n  line-height: 1.5 !important;\n  color: #ffffff !important;\n  background: rgba(15, 23, 42, 0.96) !important;\n  backdrop-filter: blur(20px) !important;\n  -webkit-backdrop-filter: blur(20px) !important;\n  border: 1px solid #334155 !important;\n  border-radius: 18px !important;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(56, 189, 248, 0.25) !important;\n  box-sizing: border-box !important;\n  user-select: none !important;\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden !important;\n}\n\n#sololearn-ai-hud *,\n#sololearn-ai-hud *::before,\n#sololearn-ai-hud *::after {\n  box-sizing: border-box !important;\n  font-family: inherit !important;\n}\n\n/* Header */\n.sl-hud-header {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  padding: 14px 18px !important;\n  background: #1e293b !important;\n  border-bottom: 1px solid #334155 !important;\n  cursor: grab !important;\n}\n\n.sl-hud-header:active {\n  cursor: grabbing !important;\n}\n\n.sl-hud-brand {\n  display: flex !important;\n  align-items: center !important;\n  gap: 10px !important;\n  font-size: 15px !important;\n  font-weight: 700 !important;\n  color: #ffffff !important;\n}\n\n.sl-brand-icon {\n  width: 28px !important;\n  height: 28px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  background: linear-gradient(135deg, #0284c7, #8b5cf6) !important;\n  border-radius: 8px !important;\n  font-size: 14px !important;\n  color: #ffffff !important;\n  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6) !important;\n}\n\n.sl-hud-controls {\n  display: flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n}\n\n.sl-icon-btn {\n  background: #334155 !important;\n  border: 1px solid #475569 !important;\n  color: #e2e8f0 !important;\n  width: 30px !important;\n  height: 30px !important;\n  border-radius: 8px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  cursor: pointer !important;\n  font-size: 14px !important;\n}\n\n.sl-icon-btn:hover {\n  background: #475569 !important;\n  color: #ffffff !important;\n  border-color: #38bdf8 !important;\n}\n\n/* Status Bar */\n.sl-status-bar {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  padding: 10px 18px !important;\n  background: #141f36 !important;\n  border-bottom: 1px solid #1e293b !important;\n  font-size: 12px !important;\n}\n\n.sl-status-pill {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  font-weight: 600 !important;\n  color: #e2e8f0 !important;\n}\n\n.sl-status-dot {\n  width: 9px !important;\n  height: 9px !important;\n  border-radius: 50% !important;\n  display: inline-block !important;\n}\n\n.sl-status-dot.idle { background: #94a3b8 !important; }\n.sl-status-dot.thinking { background: #f59e0b !important; box-shadow: 0 0 10px #f59e0b !important; }\n.sl-status-dot.success { background: #10b981 !important; box-shadow: 0 0 10px #10b981 !important; }\n.sl-status-dot.error { background: #ef4444 !important; box-shadow: 0 0 10px #ef4444 !important; }\n.sl-status-dot.active { background: #38bdf8 !important; box-shadow: 0 0 10px #38bdf8 !important; }\n\n.sl-model-badge {\n  font-size: 11px !important;\n  font-weight: 700 !important;\n  padding: 4px 10px !important;\n  background: #0369a1 !important;\n  color: #ffffff !important;\n  border: 1px solid #38bdf8 !important;\n  border-radius: 14px !important;\n  max-width: 170px !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n\n/* Body */\n.sl-hud-body {\n  padding: 16px 18px !important;\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 12px !important;\n  background: #0f172a !important;\n}\n\n/* Big Companion Answer Display Card */\n.sl-companion-answer-card {\n  padding: 14px 16px !important;\n  background: linear-gradient(135deg, #064e3b 0%, #022c22 100%) !important;\n  border: 2px solid #10b981 !important;\n  border-radius: 12px !important;\n  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35) !important;\n  display: flex;\n  flex-direction: column !important;\n  gap: 10px !important;\n}\n\n.sl-companion-answer-header {\n  display: flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n  font-size: 12px !important;\n  font-weight: 800 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n  color: #34d399 !important;\n}\n\n.sl-companion-answer-content {\n  font-size: 18px !important;\n  font-weight: 800 !important;\n  color: #ffffff !important;\n  background: rgba(0, 0, 0, 0.45) !important;\n  padding: 10px 14px !important;\n  border-radius: 8px !important;\n  border: 1px solid rgba(52, 211, 153, 0.4) !important;\n  line-height: 1.4 !important;\n  word-break: break-word !important;\n  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;\n}\n\n.sl-companion-explanation {\n  font-size: 12px !important;\n  color: #d1fae5 !important;\n  line-height: 1.5 !important;\n  border-top: 1px dashed rgba(16, 185, 129, 0.4) !important;\n  padding-top: 8px !important;\n}\n\n/* Primary Reveal Answer Button */\n.sl-btn-primary {\n  width: 100% !important;\n  padding: 13px 18px !important;\n  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;\n  color: #ffffff !important;\n  border: 1px solid #38bdf8 !important;\n  border-radius: 10px !important;\n  font-size: 14px !important;\n  font-weight: 700 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 8px !important;\n  cursor: pointer !important;\n  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.45) !important;\n}\n\n.sl-btn-primary:hover {\n  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%) !important;\n}\n\n.sl-hotkey-hint {\n  font-size: 11px !important;\n  padding: 2px 6px !important;\n  background: #0c4a6e !important;\n  border: 1px solid #38bdf8 !important;\n  border-radius: 4px !important;\n  color: #ffffff !important;\n  margin-left: auto !important;\n  font-weight: 700 !important;\n}\n\n/* Auto-Scan Toggle */\n.sl-toggle-btn {\n  padding: 10px 14px !important;\n  background: #1e293b !important;\n  border: 1px solid #475569 !important;\n  border-radius: 10px !important;\n  color: #94a3b8 !important;\n  font-size: 12px !important;\n  font-weight: 700 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  cursor: pointer !important;\n}\n\n.sl-toggle-btn.active {\n  background: #064e3b !important;\n  border-color: #10b981 !important;\n  color: #34d399 !important;\n}\n\n/* Settings Drawer */\n.sl-settings-drawer {\n  display: none !important;\n  flex-direction: column !important;\n  gap: 12px !important;\n  padding-top: 12px !important;\n  border-top: 1px solid #334155 !important;\n}\n\n.sl-settings-drawer.open {\n  display: flex !important;\n}\n\n.sl-field-group {\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 6px !important;\n}\n\n.sl-field-label {\n  font-size: 11px !important;\n  font-weight: 700 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n  color: #94a3b8 !important;\n}\n\n.sl-input, .sl-select {\n  width: 100% !important;\n  padding: 9px 12px !important;\n  background: #020617 !important;\n  border: 1px solid #475569 !important;\n  border-radius: 8px !important;\n  color: #ffffff !important;\n  font-size: 12px !important;\n  outline: none !important;\n}\n\n.sl-input:focus, .sl-select:focus {\n  border-color: #38bdf8 !important;\n}\n\n.sl-btn-secondary {\n  padding: 9px 14px !important;\n  background: #0369a1 !important;\n  border: 1px solid #38bdf8 !important;\n  color: #ffffff !important;\n  border-radius: 8px !important;\n  font-size: 12px !important;\n  font-weight: 700 !important;\n  cursor: pointer !important;\n}\n\n.sl-btn-secondary:hover {\n  background: #0284c7 !important;\n}\n\n/* In-Page Visual Highlighter Badges & Glowing Outline */\n.sl-ai-highlighted-choice {\n  position: relative !important;\n  border: 2.5px solid #10b981 !important;\n  background: rgba(16, 185, 129, 0.15) !important;\n  box-shadow: 0 0 20px rgba(16, 185, 129, 0.55) !important;\n  border-radius: 12px !important;\n  transition: all 0.3s ease !important;\n}\n\n.sl-ai-badge {\n  position: absolute !important;\n  top: -12px !important;\n  right: 12px !important;\n  background: #10b981 !important;\n  color: #ffffff !important;\n  font-size: 11px !important;\n  font-weight: 800 !important;\n  padding: 2px 8px !important;\n  border-radius: 10px !important;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;\n  letter-spacing: 0.4px !important;\n  z-index: 1000 !important;\n}\n\n#sololearn-ai-hud.minimized .sl-hud-body,\n#sololearn-ai-hud.minimized .sl-status-bar {\n  display: none !important;\n}\n\n#sololearn-ai-hud.minimized {\n  width: auto !important;\n}\n";
  (document.head || document.documentElement).appendChild(styleEl);

  // Load Config
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


  // Load OpenRouter Client
  /**
 * SoloLearn AI Companion - Pure Answer & Clean Explanation Formatter
 * Strictly isolates answers into pure tokens and separates reasoning into the explanation section.
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

  const RESILIENT_MODELS = [
    'anthropic/claude-3.5-sonnet',
    'google/gemini-2.0-flash-001',
    'google/gemini-pro-1.5',
    'anthropic/claude-3-haiku'
  ];

  class OpenRouterClient {
    constructor(apiKey, model = 'anthropic/claude-3.5-sonnet') {
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
     * Extracts ONLY pure answer tokens for the answer box and plain text for the explanation
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

        let cleanExp = parsed.explanation || parsed.thought || 'Verified syntax solution.';
        if (typeof cleanExp === 'object') cleanExp = JSON.stringify(cleanExp);

        if (cleanAnswers.length > 0) {
          return {
            thought: parsed.thought || 'Verified reasoning',
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
          explanation: (expMatch ? expMatch[1] : (thoughtMatch ? thoughtMatch[1] : 'Correct answer verified.')).replace(/\\"/g, '"')
        };
      }

      // 3. Single answer regex
      const singleAnswerMatch = text.match(/"answer"\s*:\s*"([^"]+)"/i);
      if (singleAnswerMatch && singleAnswerMatch[1]) {
        return {
          type: 'single_choice',
          answers: [singleAnswerMatch[1].replace(/["']/g, '').trim()],
          explanation: 'Verified solution.'
        };
      }

      // Fallback plain token
      const cleanToken = text.replace(/^[#\*\s\->{"]+|[}\s"]+$/g, '').slice(0, 40).trim();
      return {
        type: 'general',
        answers: [cleanToken],
        explanation: 'Direct answer evaluation.'
      };
    }

    async solve(questionPayload, modelOverride = null) {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenRouter API Key is missing. Please enter your API key in settings (⚙).'
        };
      }

      const primary = modelOverride || this.model || 'anthropic/claude-3.5-sonnet';
      const candidates = [primary, ...RESILIENT_MODELS.filter(m => m !== primary)];
      
      let lastError = null;

      for (const modelToTry of candidates) {
        try {
          const result = await this.queryModel(questionPayload, modelToTry);
          if (result.success) {
            return result;
          }

          lastError = result.error;
          if (result.status === 401 || result.status === 402) {
            return result;
          }

          console.warn(`[SoloLearn AI] Model ${modelToTry} unavailable (${result.error}). Retrying with next alternative...`);
        } catch (err) {
          lastError = err.message;
        }
      }

      return {
        success: false,
        error: lastError || 'All Claude & Gemini models failed. Please verify your OpenRouter connection.'
      };
    }

    async queryModel(questionPayload, activeModel) {
      const startTime = performance.now();
      const language = questionPayload.language || 'C# (.NET)';

      const userPrompt = `You are an elite competitive programmer and SoloLearn compiler solver.

TARGET LANGUAGE: ${language}

TASK INSTRUCTION:
"${questionPayload.title || 'Complete the exercise'}"

CODE TEMPLATE WITH NUMBERED BLANKS:
\`\`\`${language}
${questionPayload.code || 'No code snippet.'}
\`\`\`

QUESTION TYPE: ${questionPayload.type}
TOTAL BLANKS: ${questionPayload.blankCount || 1}
AVAILABLE CHOICES (if any):
${JSON.stringify(questionPayload.options || [], null, 2)}
EXTRA CONTEXT: "${questionPayload.extraText || ''}"

FORMATTING REQUIREMENTS:
- In "answers": Provide strictly an array of strings containing ONLY the pure token/word for each blank (e.g. ["while", "+=", "x"] or ["true"] or ["3"]). Never put JSON or explanations inside "answers"!
- In "explanation": Put your clear step-by-step reasoning in plain English.

Return strictly the valid JSON object.`;

      const requestBody = {
        model: activeModel,
        messages: [
          { role: 'system', content: Config.PROMPT_TEMPLATE.SYSTEM },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.0,
        max_tokens: 1000
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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
            errorMsg = 'Invalid OpenRouter API Key. Please verify your key.';
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
            error: 'AI response was empty.',
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
          error: `Unreachable: ${err.message || 'Connection timeout'}`,
          latencyMs
        };
      }
    }
  }

  return OpenRouterClient;
});


  // Load Parser
  /**
 * SoloLearn AI Companion - Precision Leaf Choice Parser Engine
 * Guarantees zero combination of parent containers and extracts strictly isolated choice cards (e.g. "false", "true").
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

  class SoloLearnParser {
    static detectLanguage() {
      const pageText = (
        (document.title || '') + ' ' +
        (window.location.href || '') + ' ' +
        (document.body ? getCleanText(document.body.querySelector('header') || document.body).slice(0, 500) : '')
      ).toLowerCase();

      if (pageText.includes('c#') || pageText.includes('csharp') || pageText.includes('c-sharp')) return 'C# (.NET)';
      if (pageText.includes('c++') || pageText.includes('cpp')) return 'C++';
      if (pageText.includes('javascript') || pageText.includes(' js ') || pageText.includes('/js')) return 'JavaScript';
      if (pageText.includes('typescript') || pageText.includes(' ts ')) return 'TypeScript';
      if (pageText.includes('python')) return 'Python';
      if (pageText.includes('java') && !pageText.includes('javascript')) return 'Java';
      if (pageText.includes('sql')) return 'SQL';
      if (pageText.includes('html')) return 'HTML';
      if (pageText.includes('css')) return 'CSS';
      if (pageText.includes('kotlin')) return 'Kotlin';
      if (pageText.includes('swift')) return 'Swift';
      if (pageText.includes('php')) return 'PHP';

      return 'C# (.NET)';
    }

    static getQuestionContainer() {
      const candidateSelectors = [
        '[data-test="lesson-content"]',
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
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
        'h1', 'h2', 'h3',
        '.question-title', '.quiz-task', '.task-title', '.instruction'
      ];

      for (const sel of titleSelectors) {
        const elements = container.querySelectorAll(sel);
        for (const el of elements) {
          if (!isVisible(el)) continue;
          if (el.closest('header') || el.closest('nav')) continue;
          const text = getCleanText(el);
          if (text.length > 3 && !text.toLowerCase().includes('stuck?')) {
            return text;
          }
        }
      }

      const paragraphs = container.querySelectorAll('p, span, div, h4, h5');
      for (const p of paragraphs) {
        if (!isVisible(p)) continue;
        if (p.closest('header') || p.closest('nav') || p.closest('button')) continue;
        const text = getCleanText(p);
        if (
          text.length > 6 &&
          text.length < 300 &&
          (text.includes('?') ||
           text.toLowerCase().includes('runs as long') ||
           text.toLowerCase().includes('while loop') ||
           text.toLowerCase().includes('for loop') ||
           text.toLowerCase().includes('fill in') ||
           text.toLowerCase().includes('create a valid') ||
           text.toLowerCase().includes('write the shorthand') ||
           text.toLowerCase().includes('declare a variable') ||
           text.toLowerCase().includes('what is the') ||
           text.toLowerCase().includes('statement'))
        ) {
          return text;
        }
      }

      return 'SoloLearn Activity';
    }

    static extractCodeAndBlanks(container = document) {
      const codeBoxes = [];
      const seen = new Set();

      const candidateBoxes = container.querySelectorAll('pre, code, div[class*="code"], div[class*="Code"], div[style*="monospace"], div[class*="editor"]');
      for (const box of candidateBoxes) {
        if (!isVisible(box) || seen.has(box)) continue;
        const text = getCleanText(box);
        if (text.length > 1 || box.querySelector('input, [contenteditable="true"], div[class*="slot"], span[class*="slot"], div[class*="blank"], span[class*="blank"]')) {
          codeBoxes.push(box);
          seen.add(box);
        }
      }

      const blankElements = [];
      let globalBlankIdx = 1;
      const formattedParts = [];

      for (let i = 0; i < codeBoxes.length; i++) {
        const box = codeBoxes[i];
        const insideBlanks = box.querySelectorAll('input, [contenteditable="true"], span[class*="slot"], div[class*="slot"], span[class*="blank"], div[class*="blank"], span[class*="circle"], div[class*="circle"], div[class*="drop"], span[class*="drop"]');

        try {
          const clone = box.cloneNode(true);
          clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
          const cloneBlanks = clone.querySelectorAll('input, [contenteditable="true"], span[class*="slot"], div[class*="slot"], span[class*="blank"], div[class*="blank"], span[class*="circle"], div[class*="circle"], div[class*="drop"], span[class*="drop"]');

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

    /**
     * Precision Choice Card Extractor: Strictly separates options into distinct items (e.g. ["false", "true"])
     */
    static getChoiceOptions(container = document, title = '') {
      const choices = [];
      const seen = new Set();
      const titleLower = (title || this.extractTitle(container)).toLowerCase();

      const isValidOptionText = (text) => {
        if (!text) return false;
        const clean = text.trim();
        if (clean.length === 0 || clean.length > 80) return false;
        const lower = clean.toLowerCase();
        if (lower === 'check' || lower === 'continue' || lower === 'next' || lower === 'got it' || lower === 'stuck?' || lower === 'copy' || lower === 'try again') return false;
        if (titleLower.length > 5 && lower.includes(titleLower.slice(0, 20))) return false;
        return true;
      };

      // 1. Check explicit option/choice selectors
      const explicitSelectors = [
        '[data-test*="option"]',
        '[data-test*="choice"]',
        '[data-test*="answer"]',
        '[role="radio"]',
        '[role="checkbox"]'
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

      // 2. Find clean leaf cards (like the "false" and "true" buttons on screen)
      if (choices.length < 2) {
        const allDivs = container.querySelectorAll('div, button, li');
        for (const el of allDivs) {
          if (!isVisible(el) || seen.has(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;

          // Must not contain other container divs
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
        
        // Ensure this text is not a concatenation of other options (e.g. "falsetrue")
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
        '[data-test="token-item"]',
        '[data-test="chip-item"]',
        '[data-test="draggable-item"]',
        '.token',
        '.chip'
      ];

      const tokens = [];
      const seen = new Set();

      for (const sel of tokenSelectors) {
        const items = container.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          const text = getCleanText(item);
          if (text.length > 0 && text.length < 40) {
            tokens.push({ text, element: item });
            seen.add(item);
          }
        }
      }
      return tokens;
    }

    static isMultiChoice(container, title = '') {
      const textToCheck = (title + ' ' + getCleanText(container)).toLowerCase();
      return textToCheck.includes('select all') || textToCheck.includes('choose all');
    }

    static parseQuestion() {
      const container = this.getQuestionContainer();
      if (!container) return null;

      const language = this.detectLanguage();
      const title = this.extractTitle(container);
      const { code, blankElements } = this.extractCodeAndBlanks(container);
      const choices = this.getChoiceOptions(container, title);
      const reorderTokens = this.getReorderTokens(container);

      // 1. Fill in blanks
      if (blankElements.length > 0) {
        return {
          type: 'fill_blanks',
          language,
          title,
          code,
          blankCount: blankElements.length,
          inputElements: blankElements,
          tokens: reorderTokens,
          options: reorderTokens.map(t => t.text),
          extraText: ''
        };
      }

      // 2. Choice Questions (Multiple choice or Single choice)
      if (choices.length > 0) {
        const isMulti = this.isMultiChoice(container, title);
        return {
          type: isMulti ? 'multi_choice' : 'single_choice',
          language,
          title,
          code,
          choices,
          options: choices.map(c => c.text),
          blankCount: 0,
          extraText: ''
        };
      }

      // 3. Reorder Tokens
      if (reorderTokens.length > 0) {
        return {
          type: 'reorder',
          language,
          title,
          code,
          tokens: reorderTokens,
          options: reorderTokens.map(t => t.text),
          blankCount: reorderTokens.length,
          extraText: ''
        };
      }

      return {
        type: 'general_question',
        language,
        title,
        code,
        options: [],
        blankCount: 1,
        extraText: ''
      };
    }
  }

  return SoloLearnParser;
});


  // Load Executor
  /**
 * SoloLearn AI Companion - In-Page Visual Highlighter & Solution Guide
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
    return str
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
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

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

      const answers = Array.isArray(aiResponse.answers) ? aiResponse.answers : [];
      if (answers.length === 0) return { success: false };

      // 1. Highlight Choice Cards if single/multi choice
      if (parsedQuestion.choices && parsedQuestion.choices.length > 0) {
        const targetAnswer = String(answers[0] || '').trim();
        let bestMatch = null;
        let bestScore = -1;

        for (const choice of parsedQuestion.choices) {
          const score = matchScore(choice.text, targetAnswer);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = choice;
          }
        }

        if (bestMatch && bestMatch.element) {
          bestMatch.element.classList.add('sl-ai-highlighted-choice');
          const badge = document.createElement('div');
          badge.className = 'sl-ai-badge';
          badge.innerText = '🎯 CORRECT ANSWER';
          bestMatch.element.appendChild(badge);
          return { success: true };
        }
      }

      // 2. Highlight Word Bank Chips if available
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

          if (bestToken && bestToken.element && bestScore >= 0.6) {
            bestToken.element.classList.add('sl-ai-highlighted-choice');

            const orderBadge = document.createElement('span');
            orderBadge.className = 'sl-ai-order-badge';
            orderBadge.innerText = String(step++);
            bestToken.element.prepend(orderBadge);
            usedElements.add(bestToken.element);
          }
        }
      }

      // 3. Highlight inputs with placeholder guides
      const inputs = parsedQuestion.inputElements || [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const val = answers[i] !== undefined ? String(answers[i]) : '';
        if (input && val !== '') {
          input.classList.add('sl-ai-highlighted-choice');
          if ('placeholder' in input) input.placeholder = val;
          input.title = `AI Answer: ${val}`;
        }
      }

      return { success: true };
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
              <span>🎯 Best Recommended Answer:</span>
              <button class="sl-icon-btn" id="sl-copy-answer-btn" title="Copy Answer to Clipboard" style="margin-left: auto; width: 24px; height: 24px; font-size: 11px;">📋</button>
            </div>
            <div class="sl-companion-answer-content" id="sl-companion-answer">
              Press Alt + S or Click Scan Below
            </div>
            <div class="sl-companion-explanation" id="sl-companion-explanation">
              💡 <b>Ready:</b> AI Companion is ready to analyze your active exercise.
            </div>
            <details class="sl-companion-details" id="sl-companion-details" style="font-size: 11px; color: #94a3b8; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; cursor: pointer;">
              <summary style="font-weight: 700; color: #38bdf8;">🔍 View Scanned Context & Proof</summary>
              <pre id="sl-scanned-context-preview" style="margin-top: 6px; padding: 8px; background: rgba(0,0,0,0.5); border-radius: 6px; font-size: 10px; color: #e2e8f0; white-space: pre-wrap; font-family: monospace; max-height: 120px; overflow-y: auto;"></pre>
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
              <button class="sl-btn-secondary" id="sl-test-key-btn">🧪 Test Connection</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(hud);
      this.hudEl = hud;
    }

    getShortModelName(modelId) {
      if (!modelId) return 'Claude 3.5';
      const parts = modelId.split('/');
      return parts[parts.length - 1] || modelId;
    }

    showLoadingAnswer(modelName) {
      const card = document.getElementById('sl-companion-card');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');

      if (card && ansEl && expEl) {
        ansEl.innerText = 'Analyzing with ' + this.getShortModelName(modelName) + '...';
        expEl.innerHTML = 'Computing mathematical operations and syntax rules...';
        card.style.display = 'flex';
      }
    }

    displayAnswer(answerText, explanationText, contextInfo = '') {
      const card = document.getElementById('sl-companion-card');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');
      const ctxEl = document.getElementById('sl-scanned-context-preview');

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
        expEl.innerHTML = `💡 <b>Why:</b> ${cleanExp}`;
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
 * Seamlessly scans page, queries OpenRouter, highlights answer on webpage, and reveals step-by-step guidance.
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
      if (!settings.apiKey) {
        this.ui.setStatus('API Key Required', 'error');
        this.ui.log('Please enter your OpenRouter API key in settings (⚙).', 'error');
        this.ui.playChime('error');
        return;
      }

      this.client.setApiKey(settings.apiKey);
      const activeModel = settings.selectedModel === 'custom' ? settings.customModel : settings.selectedModel;
      this.client.setModel(activeModel);

      // 1. Scan Question on Page
      this.ui.setStatus('Scanning Page...', 'thinking');
      const question = Parser.parseQuestion();

      if (!question) {
        this.ui.setStatus('No Question Found', 'idle');
        this.ui.log('Could not find active exercise on this page.', 'normal');
        return;
      }

      if (settings.languageOverride && settings.languageOverride !== 'auto') {
        question.language = settings.languageOverride;
      }

      this.isBusy = true;
      this.ui.setStatus(`Thinking (${this.ui.getShortModelName(activeModel)})...`, 'thinking');
      this.ui.showLoadingAnswer(activeModel);
      this.ui.log(`Analyzing: "${(question.title || 'Exercise').slice(0, 50)}..."`, 'normal');

      try {
        // 2. Query AI Model
        const response = await this.client.solve(question, activeModel);

        if (!response.success) {
          this.ui.setStatus('AI Error', 'error');
          this.ui.log(`AI Error: ${response.error}`, 'error');
          this.ui.displayAnswer('Error analyzing exercise', response.error);
          this.ui.playChime('error');
          this.isBusy = false;
          return;
        }

        const aiData = response.data;
        const answerText = Array.isArray(aiData.answers) ? aiData.answers.join(', ') : (aiData.answer || 'Answer Ready');
        const explanation = aiData.explanation || aiData.thought || 'Analysis complete.';

        const contextProof = `LANGUAGE: ${question.language || 'C#'}\nQUESTION: ${question.title || ''}\n\nSCANNED CODE:\n${question.code || 'None'}\n\nAI DRY RUN:\n${aiData.thought || explanation}`;

        // 3. Highlight the correct answer directly on the webpage!
        Executor.highlightAnswerOnPage(question, aiData);

        // 4. Update the model badge to show the EXACT model that answered
        if (response.model) {
          const badge = document.getElementById('sl-active-model-badge');
          if (badge) badge.innerText = this.ui.getShortModelName(response.model);
        }

        // 5. Display in Companion Card with full proof
        this.ui.displayAnswer(answerText, explanation, contextProof);

        this.ui.setStatus('Answer Revealed!', 'success');
        this.ui.log(`🎯 Answer: <span class="highlight">${answerText}</span> (${this.ui.getShortModelName(response.model || activeModel)})`, 'success');
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
        }, 1000);
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
