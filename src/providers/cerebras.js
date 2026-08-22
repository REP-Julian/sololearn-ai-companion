/**
 * SoloLearn AI Companion - Cerebras AI Client
 * Powers world-record speed (2,000+ tokens/sec) inference with Cerebras Wafer-Scale Engine (WSE).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config.js'));
  } else {
    root.CerebrasClient = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const CEREBRAS_ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';

  class CerebrasClient {
    constructor(apiKey = '', model = 'gpt-oss-120b') {
      this.apiKey = apiKey;
      this.model = model || 'gpt-oss-120b';
      this.provider = 'cerebras';
    }

    setApiKey(apiKey) {
      this.apiKey = apiKey ? apiKey.trim() : '';
    }

    setModel(model) {
      this.model = model || 'gpt-oss-120b';
    }

    cleanJsonResponse(rawText) {
      if (!rawText) return null;
      let text = String(rawText).trim();

      // Pass 1: Strip markdown fences
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      // Pass 2: Direct JSON parse
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (_) {}

      // Pass 3: Extract outermost JSON object { ... }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const candidate = text.slice(firstBrace, lastBrace + 1);
        try {
          const parsed = JSON.parse(candidate);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch (_) {}
      }

      // Pass 4: Fallback regex extraction of answers
      const answersMatch = text.match(/"answers"\s*:\s*\[([^\]]+)\]/);
      if (answersMatch) {
        const tokens = answersMatch[1]
          .split(',')
          .map(t => t.replace(/["']/g, '').trim())
          .filter(Boolean);
        return {
          thought: 'Extracted from raw Cerebras JSON text.',
          type: tokens.length > 1 ? 'fill_blanks' : 'single_choice',
          confidence: 1.0,
          answers: tokens,
          explanation: 'Extracted via Cerebras fallback parser.'
        };
      }

      return null;
    }

    async queryModel(questionPayload, requestedModel = null) {
      if (!this.apiKey) {
        return { success: false, error: 'Cerebras API Key is missing.' };
      }

      const startTime = performance.now();
      let targetModel = requestedModel || this.model || 'gpt-oss-120b';

      const language = questionPayload.language || 'Java';
      const blankCount = questionPayload.blankCount || 0;
      const isFillBlanks = questionPayload.type === 'fill_blanks' || blankCount > 0;
      const hasCode = Boolean(questionPayload.code && questionPayload.code.trim().length > 0);
      const hasOptions = Array.isArray(questionPayload.options) && questionPayload.options.length > 0;

      let codeSection = '';
      if (hasCode) {
        codeSection = `\nCODE TEMPLATE (WITH NUMBERED BLANK SLOTS):\n\`\`\`${language}\n${questionPayload.code}\n\`\`\`\n`;
      } else {
        codeSection = `\nEXERCISE TYPE: Conceptual / Language Syntax Question (No code snippet required).\n`;
      }

      let specificInstruction = '';
      if (isFillBlanks && blankCount > 0) {
        specificInstruction = `CRITICAL SLOT REQUIREMENT: The code template contains EXACTLY ${blankCount} blanks ([BLANK_1] to [BLANK_${blankCount}]). Your 'answers' array MUST contain EXACTLY ${blankCount} strings corresponding to each blank in sequential order. If a WORD BANK is provided, prioritize selecting exact matching tokens from the word bank.`;
      } else if (hasOptions) {
        specificInstruction = `CRITICAL CHOICE SELECTION: You MUST choose the correct answer strictly from the AVAILABLE CHOICES below. Your 'answers' array MUST contain the exact string(s) from the choices list.`;
      }

      const userPrompt = `You are an ultra-high-speed compiler engineer and programming AI running on Cerebras Wafer-Scale Engine. Execute a 4-Pass Mental Verification before generating the final JSON:

TARGET PROGRAMMING LANGUAGE: ${language}

TASK OBJECTIVE:
"${questionPayload.title || 'Answer the question'}"
${codeSection}
QUESTION CATEGORY: ${questionPayload.type}
TOTAL BLANKS/SLOTS TO FILL: ${blankCount}
AVAILABLE CHOICES / WORD BANK (if any):
${JSON.stringify(questionPayload.options || [], null, 2)}
EXTRA CONTEXT: "${questionPayload.extraText || ''}"

${specificInstruction}

MANDATORY 4-PASS VERIFICATION (Populate into "thought"):
- Pass 1 (Language Syntax & Conventions): Analyze comments, keywords, types, and language rules.
- Pass 2 (Mental Code Trace): Step through logic or syntax rules to evaluate runtime values.
- Pass 3 (Word Bank / Option Matching): Select the exact matching choice from the available choices.
- Pass 4 (Sanitization Check): Ensure 'answers' contains ONLY the exact winning token or choice string without duplicate surrounding punctuation.

Return strictly valid JSON matching this schema:
{
  "thought": "Pass 1: ...\\nPass 2: ...\\nPass 3: ...\\nPass 4: ...",
  "type": "${questionPayload.type || 'fill_blanks'}",
  "confidence": 1.0,
  "answers": ["..."],
  "explanation": "..."
}`;

      const requestBody = {
        model: targetModel,
        messages: [
          { role: 'system', content: Config.PROMPT_TEMPLATE.SYSTEM },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.0,
        response_format: { type: 'json_object' }
      };

      try {
        const fetchFn = (Config && Config.safeFetch) || fetch;
        let response = await fetchFn(CEREBRAS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        let latencyMs = Math.round(performance.now() - startTime);

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status} ${response.statusText}`;
          if (response.status === 402) {
            errorMsg = 'Payment Required (Out of Credits / Add payment method at cloud.cerebras.ai)';
          }
          try {
            const errData = await response.json();
            if (errData && errData.error && errData.error.message) {
              errorMsg = errData.error.message;
            }
          } catch (_) {}

          // 1. Fallback models on Cerebras
          const fallbackCerebrasModels = ['gpt-oss-120b', 'kimi-k2.6', 'glm-5.1', 'minimax-m2.5', 'gemma-4-31b', 'llama-3.3-70b', 'llama3.1-8b', 'llama3.1-70b'];
          for (const fbModel of fallbackCerebrasModels) {
            if (fbModel === targetModel) continue;
            try {
              const fbBody = { ...requestBody, model: fbModel };
              const fbRes = await fetchFn(CEREBRAS_ENDPOINT, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(fbBody)
              });
              if (fbRes.ok) {
                response = fbRes;
                targetModel = fbModel;
                break;
              }
            } catch (_) {}
          }

          // 2. If hardcoded list failed, dynamically query Cerebras /models endpoint
          if (!response.ok) {
            try {
              const modelsRes = await fetchFn('https://api.cerebras.ai/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
              });
              if (modelsRes.ok) {
                const modelsData = await modelsRes.json();
                if (modelsData && Array.isArray(modelsData.data)) {
                  const discoveredModels = modelsData.data.map(m => m.id);
                  for (const discModel of discoveredModels) {
                    try {
                      const discBody = { ...requestBody, model: discModel };
                      const discRes = await fetchFn(CEREBRAS_ENDPOINT, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${this.apiKey}`,
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify(discBody)
                      });
                      if (discRes.ok) {
                        response = discRes;
                        targetModel = discModel;
                        break;
                      }
                    } catch (_) {}
                  }
                }
              }
            } catch (_) {}
          }

          if (!response.ok) {
            return { success: false, error: errorMsg, provider: 'cerebras', latencyMs };
          }
        }

        const data = await response.json();
        latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices && data.choices[0];
        const rawContent = choice && choice.message ? choice.message.content : '';

        const parsedJson = this.cleanJsonResponse(rawContent);
        if (!parsedJson || !Array.isArray(parsedJson.answers) || parsedJson.answers.length === 0) {
          return { success: false, error: 'Cerebras response could not be parsed into valid answers.', raw: rawContent, provider: 'cerebras', latencyMs };
        }

        return {
          success: true,
          data: parsedJson,
          raw: rawContent,
          latencyMs,
          model: targetModel,
          provider: 'cerebras',
          usage: data.usage || null
        };
      } catch (err) {
        return {
          success: false,
          error: `Cerebras Error: ${err.message || 'Request failed'}`,
          provider: 'cerebras',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  }

  return CerebrasClient;
});
