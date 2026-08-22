/**
 * SoloLearn AI Companion - Native Mistral AI & Codestral Configuration
 * Powers 100% Accurate SoloLearn Solving with Codestral, Mistral Large, and 3-Pass Compiler Verification.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SoloLearnConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Multi-Provider Model Rosters
  const MISTRAL_MODELS = [
    { id: 'codestral-latest', name: 'Codestral Latest (Mistral AI Dedicated Code Model)', badge: 'Codestral', provider: 'mistral', recommended: true },
    { id: 'mistral-small-latest', name: 'Mistral Small Latest (Fast & Lightweight)', badge: 'Mistral Small', provider: 'mistral' },
    { id: 'open-mistral-nemo', name: 'Mistral NeMo 12B (Fast Free Tier)', badge: 'Mistral NeMo', provider: 'mistral' },
    { id: 'ministral-8b-latest', name: 'Ministral 8B Latest (Ultra Efficient)', badge: 'Ministral 8B', provider: 'mistral' },
    { id: 'mistral-large-latest', name: 'Mistral Large Latest (Flagship 123B SOTA)', badge: 'Mistral Large', provider: 'mistral' }
  ];

  const GEMINI_MODELS = [
    { id: 'gemini-3.7-flash', name: 'Google Gemini 3.7 Flash (Flagship Fast Reasoning)', badge: 'Gemini 3.7 Flash', provider: 'gemini', recommended: true },
    { id: 'gemini-3.6-flash', name: 'Google Gemini 3.6 Flash (Next-Gen Intelligence)', badge: 'Gemini 3.6 Flash', provider: 'gemini' },
    { id: 'gemini-3.5-flash-lite', name: 'Google Gemini 3.5 Flash Lite (High Quota 500 RPD)', badge: 'Gemini 3.5 Lite', provider: 'gemini' },
    { id: 'gemini-3.1-flash-lite', name: 'Google Gemini 3.1 Flash Lite (High Quota 500 RPD)', badge: 'Gemini 3.1 Lite', provider: 'gemini' },
    { id: 'gemini-3.5-flash', name: 'Google Gemini 3.5 Flash (Ultra Fast & Stable)', badge: 'Gemini 3.5 Flash', provider: 'gemini' },
    { id: 'gemini-3-flash', name: 'Google Gemini 3 Flash (Fast & Reliable)', badge: 'Gemini 3 Flash', provider: 'gemini' },
    { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash', badge: 'Gemini 2.5 Flash', provider: 'gemini' },
    { id: 'gemini-2.5-flash-lite', name: 'Google Gemini 2.5 Flash Lite', badge: 'Gemini 2.5 Lite', provider: 'gemini' }
  ];

  const HUGGINGFACE_MODELS = [
    { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B (SOTA Coding)', badge: 'Qwen Coder', provider: 'huggingface', recommended: true },
    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct (Flagship)', badge: 'Llama 3.3', provider: 'huggingface' },
    { id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', name: 'DeepSeek R1 Distill Qwen 32B (Reasoning)', badge: 'DeepSeek R1', provider: 'huggingface' },
    { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B Instruct (Fast)', badge: 'Mistral 7B', provider: 'huggingface' }
  ];

  const DEFAULT_SETTINGS = {
    // Multi-Provider API Keys (Saved securely in browser local storage)
    mistralApiKey: '',
    geminiApiKey: '',
    huggingfaceApiKey: '',
    apiKey: '',

    // Provider Active Models
    mistralModel: 'codestral-latest',
    geminiModel: 'gemini-3.7-flash',
    huggingfaceModel: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    selectedModel: 'codestral-latest',

    // Engine & Consensus Mode
    consensusMode: true, // Parallel 3-Provider Majority Voting
    singleProvider: 'mistral', // 'mistral' | 'gemini' | 'huggingface' (when consensusMode is off)

    // General Settings
    languageOverride: 'auto',
    cacheEnabled: true,
    enableFallback: true,
    autoSolve: false,
    autoFill: false,
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

  const STORAGE_KEY = 'sololearn_ai_solver_settings_v2';

  function sanitizeLoadedSettings(raw) {
    const s = { ...DEFAULT_SETTINGS, ...raw };
    if (s.apiKey && !s.mistralApiKey) s.mistralApiKey = s.apiKey;
    if (raw.groqApiKey && !s.geminiApiKey) s.geminiApiKey = raw.groqApiKey;
    if (raw.cerebrasApiKey && !s.huggingfaceApiKey) s.huggingfaceApiKey = raw.cerebrasApiKey;
    if (raw.openrouterApiKey && !s.huggingfaceApiKey) s.huggingfaceApiKey = raw.openrouterApiKey;
    const validGeminiIds = GEMINI_MODELS.map(m => m.id);
    if (!s.geminiModel || !validGeminiIds.includes(s.geminiModel)) {
      s.geminiModel = 'gemini-3.7-flash';
    }
    if (!s.huggingfaceModel) s.huggingfaceModel = 'Qwen/Qwen2.5-Coder-32B-Instruct';
    return s;
  }

  const Storage = {
    async get() {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
              if (result && result[STORAGE_KEY]) {
                resolve(sanitizeLoadedSettings(result[STORAGE_KEY]));
              } else {
                const local = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sololearn_ai_solver_settings_v1');
                const parsed = local ? JSON.parse(local) : {};
                resolve(sanitizeLoadedSettings(parsed));
              }
            });
          });
        }
      } catch (e) {}

      try {
        const local = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sololearn_ai_solver_settings_v1');
        const parsed = local ? JSON.parse(local) : {};
        return sanitizeLoadedSettings(parsed);
      } catch (err) {
        return { ...DEFAULT_SETTINGS };
      }
    },

    async save(settings) {
      const merged = sanitizeLoadedSettings(settings);
      if (merged.mistralApiKey) merged.apiKey = merged.mistralApiKey;
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
    SYSTEM: `You are an Elite Grandmaster Compiler Architect & Competitive Programming AI (ACM-ICPC World Finalist level).
Your absolute goal is 100% MATHEMATICAL, LOGICAL, AND SYNTACTIC PERFECTION on every coding exercise.

YOU MUST EXECUTE A DEEP 4-PASS VERIFICATION BEFORE GENERATING THE JSON RESPONSE:

=======================================================
=== PASS 1: AST, LANGUAGE GRAMMAR & SCOPE ANALYSIS ===
=======================================================
1. Target Language Conventions:
   - Java:
     * Variable & String Concatenation: 'String msg = [BLANK_1] + [BLANK_2];' -> [BLANK_1] is "Hello, " (or the literal string), [BLANK_2] is the variable name (e.g. 'name').
     * Output statement: 'System.out.println( [BLANK_3] );' -> [BLANK_3] is 'msg' (or 'System.out.print').
     * Class declaration: '[BLANK_1] Sum {' -> [BLANK_1] is 'class' (NEVER 'Sum'!).
     * Main method: 'public static void [BLANK_2] (String[] args)' -> [BLANK_2] is 'main'.
     * Print output: 'System. [BLANK_3] .println(a [BLANK_4] b);' -> [BLANK_3] is 'out', [BLANK_4] is '+'.
   - C# (.NET):
     * Class declaration: '[BLANK_1] Program {' -> [BLANK_1] is 'class' (NEVER 'Program'!).
     * Main method: 'static void [BLANK_2] (string[] args)' -> [BLANK_2] is 'Main' (or 'main').
     * Output statement: 'Console.Write [BLANK_3] (a [BLANK_4] b);' -> [BLANK_3] is 'Line' (for Console.WriteLine), [BLANK_4] is '+' (for addition).
     * Semicolon required at end of statements.
   - Python: Indentation semantics, 0-indexed slicing (start:end exclusive), integer division '//' vs float '/', 'def', 'self', 'return'.
   - JavaScript / TypeScript: 'let', 'const', arrow functions, strict equality '===', template literals.
   - C++: 'std::cout', 'std::cin', stream operators '<<' / '>>', pointers '*', references '&', semicolons.
    - SQL:
      * Clause order: 'SELECT [columns] FROM [table] WHERE [condition] GROUP BY [cols] HAVING [cond] ORDER BY [cols]'.
      * Multi-column selection: multiple columns in the SELECT clause MUST be separated by commas (e.g. 'SELECT [BLANK_1] , [BLANK_2] FROM table').
      * Table source: the table name is specified in the FROM clause (e.g. '[BLANK_3] orders').
      * Fixed Code Invariant: Words already visible in the code template (such as 'id' or 'orders') are ALREADY part of the query. Do NOT repeat existing code tokens in the 'answers' array!
2. Scope & Variable Tracking:
   - Identify all declared variables and types in the code (e.g. 'String name = "James";' or 'int a = 5; int b = 10;').
   - Ensure variables used in later expressions strictly match declared names and types.

=======================================================
=== PASS 2: MENTAL INTERPRETER & CODE SIMULATION ===
=======================================================
1. Trace execution step-by-step:
   - Simulate line-by-line runtime execution with variables, string concatenation, arithmetic, and logic flow.
   - For string concatenation (e.g. "Hello, " + name): verify resulting output matches the task objective (e.g. "Hello, James").
   - For loops/conditions: trace boundary conditions, loop variables, termination, and output statements.
   - For SQL queries: mentally reconstruct the complete query from the template + your proposed answers and verify it forms 100% syntactically valid and logically correct SQL.

=======================================================
=== PASS 3: WORD BANK & OPTION CHIP VALIDATION ===
=======================================================
1. Strict Word Bank Rule:
   - If an "AVAILABLE CHOICES / WORD BANK" list is provided, EVERY answer token for blanks MUST be chosen from the provided word bank options.
   - Do NOT invent new tokens or pick tokens outside the word bank if the word bank is provided.
   - Ensure the casing and spelling match the word bank chip exactly (e.g. 'SELECT', 'FROM', ',', 'date').

=======================================================
=== PASS 4: EXACT SLOT COUNT & BOUNDARY SANITIZATION ===
=======================================================
1. Exact Slot Count Invariant:
   - If TOTAL BLANKS/SLOTS TO FILL is N, your 'answers' array MUST contain EXACTLY N strings, one corresponding to each [BLANK_1]..[BLANK_N] in strict sequential order.
   - NEVER put multiple slot answers into one slot.
2. Punctuation Boundary Check:
   - NEVER duplicate quotes, parentheses, brackets, commas, or semicolons that are already present outside the blank slot in the code template!

=======================================================
=== REQUIRED OUTPUT JSON FORMAT ===
=======================================================
{
  "thought": "Pass 1 (Scope & AST): ...\\nPass 2 (Mental Trace): ...\\nPass 3 (Word Bank Match): ...\\nPass 4 (Boundary Check): ...",
  "type": "fill_blanks" | "single_choice" | "multi_choice" | "reorder" | "general_question",
  "confidence": 1.0,
  "answers": [
    // Array of exact strings matching each slot [BLANK_1]..[BLANK_N] or selected choices
  ],
  "explanation": "Clear, concise 1-2 sentence explanation of the solution."
}`
  };

  function safeFetch(url, options = {}) {
    const gmRequest = (typeof GM_xmlhttpRequest === 'function')
      ? GM_xmlhttpRequest
      : ((typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function') ? GM.xmlHttpRequest : null);

    if (gmRequest) {
      return new Promise((resolve, reject) => {
        gmRequest({
          method: options.method || 'GET',
          url: url,
          headers: options.headers || {},
          data: options.body || null,
          timeout: 30000,
          onload: (res) => {
            resolve({
              ok: res.status >= 200 && res.status < 300,
              status: res.status,
              statusText: res.statusText,
              json: async () => {
                try {
                  return JSON.parse(res.responseText);
                } catch (e) {
                  return { error: { message: res.responseText || 'Invalid JSON' } };
                }
              },
              text: async () => res.responseText
            });
          },
          onerror: (err) => reject(new Error(err.statusText || 'Network error via GM_xmlhttpRequest')),
          ontimeout: () => reject(new Error('Request timed out after 30s'))
        });
      });
    }

    return fetch(url, options);
  }

  function getTimeUntilUtcMidnight() {
    const now = new Date();
    const nextUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diffMs = Math.max(0, nextUtc - now);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }

  return {
    MISTRAL_MODELS,
    GEMINI_MODELS,
    HUGGINGFACE_MODELS,
    DEFAULT_MODELS: MISTRAL_MODELS,
    DEFAULT_SETTINGS,
    STORAGE_KEY,
    Storage,
    PROMPT_TEMPLATE,
    safeFetch,
    getTimeUntilUtcMidnight
  };
});

