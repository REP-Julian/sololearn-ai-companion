/**
 * SoloLearn AI Companion - Google AI Studio (Gemini) Client
 * Powers fast, highly-accurate multimodal & coding intelligence with Gemini 2.0 Flash and 1.5 Flash.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config.js'));
  } else {
    root.GeminiClient = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const WORKING_TEXT_OUT_MODELS = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];

  const NON_WORKING_OR_NON_TEXT_MODELS = [
    'gemini-2.5-pro',
    'gemini-3.1-pro',
    'gemini-2-flash',
    'gemini-2-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
  ];

  class GeminiClient {
    constructor(apiKey = '', model = 'gemini-3.7-flash') {
      this.apiKey = apiKey;
      this.model = model || 'gemini-3.7-flash';
      this.provider = 'gemini';
    }

    setApiKey(apiKey) {
      this.apiKey = apiKey ? apiKey.trim() : '';
    }

    setModel(model) {
      this.model = model || 'gemini-3.7-flash';
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
          thought: 'Extracted from raw Gemini JSON text.',
          type: tokens.length > 1 ? 'fill_blanks' : 'single_choice',
          confidence: 1.0,
          answers: tokens,
          explanation: 'Extracted via fallback parser.'
        };
      }

      return null;
    }

    async queryModel(questionPayload, requestedModel = null) {
      if (!this.apiKey) {
        return { success: false, error: 'Google AI Studio API Key is missing.' };
      }

      const startTime = performance.now();
      let targetModel = requestedModel || this.model || 'gemini-3.7-flash';
      // Normalize model string: strip 'models/' prefix if present
      targetModel = targetModel.replace(/^models\//, '');
      if (NON_WORKING_OR_NON_TEXT_MODELS.includes(targetModel)) {
        targetModel = 'gemini-3.7-flash';
      }

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
      const isMulti = questionPayload.type === 'multi_choice' ||
                      (questionPayload.title && /select all|choose all|all that apply|all correct|all matching/i.test(questionPayload.title)) ||
                      (questionPayload.extraText && /select all|choose all|all that apply|all correct|all matching/i.test(questionPayload.extraText));

      if (isFillBlanks && blankCount > 0) {
        specificInstruction = `CRITICAL SLOT REQUIREMENT: The code template contains EXACTLY ${blankCount} blanks ([BLANK_1] to [BLANK_${blankCount}]). Your 'answers' array MUST contain EXACTLY ${blankCount} strings corresponding to each blank in sequential order. If a WORD BANK is provided, prioritize selecting exact matching tokens from the word bank.`;
      } else if (isMulti) {
        specificInstruction = `CRITICAL MULTI-SELECT INSTRUCTION: This is a MULTI-CHOICE question where MULTIPLE answers are correct! You MUST evaluate EVERY choice independently against the question/pattern. Your 'answers' array MUST contain ALL choices that are correct (e.g. "answers": ["Choice 1", "Choice 2"]). Do NOT return only one option when multiple choices are valid!`;
      } else if (hasOptions) {
        specificInstruction = `CRITICAL CHOICE SELECTION: You MUST choose the correct answer strictly from the AVAILABLE CHOICES below. Your 'answers' array MUST contain the exact string(s) from the choices list.`;
      }

      const userPrompt = `You are an elite competitive programmer and compiler engineer AI on Google AI Studio. Execute a 4-Pass Mental Verification before generating the final JSON:

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
        systemInstruction: {
          parts: [{ text: Config.PROMPT_TEMPLATE.SYSTEM }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.0,
          responseMimeType: 'application/json'
        }
      };

      try {
        const fetchFn = (Config && Config.safeFetch) || fetch;
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
        
        let response = await fetchFn(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        let latencyMs = Math.round(performance.now() - startTime);

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData && errData.error && errData.error.message) {
              errorMsg = errData.error.message;
            }
          } catch (_) {}

          // 1. Fallback across all verified working Text-out models when token/quota is exhausted
          for (const fbModel of WORKING_TEXT_OUT_MODELS) {
            if (fbModel === targetModel) continue;
            try {
              const fbEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${fbModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
              const fbRes = await fetchFn(fbEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
              });
              if (fbRes.ok) {
                response = fbRes;
                targetModel = fbModel;
                break;
              }
            } catch (_) {}
          }

          // 2. If hardcoded list failed, dynamically query ModelService.ListModels on the user's key (filtering only Text-out models)
          if (!response.ok) {
            try {
              const listEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(this.apiKey)}`;
              const listRes = await fetchFn(listEndpoint);
              if (listRes.ok) {
                const listData = await listRes.json();
                if (listData && Array.isArray(listData.models)) {
                  const availableGenerateModels = listData.models
                    .filter(m => {
                      const name = (m.name || '').replace(/^models\//, '');
                      const isGenContent = Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent');
                      const isNonText = /embedding|robotics|banana|lyria|tts|image|audio|vision-preview|computer-use|deep-research/i.test(name);
                      const isKnownZero = NON_WORKING_OR_NON_TEXT_MODELS.includes(name);
                      return isGenContent && !isNonText && !isKnownZero;
                    })
                    .map(m => m.name.replace(/^models\//, ''));

                  for (const discModel of availableGenerateModels) {
                    try {
                      const discEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${discModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
                      const discRes = await fetchFn(discEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
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
            let isRateLimit = response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED');
            if (isRateLimit) {
              const timeUntilUtc = (Config && Config.getTimeUntilUtcMidnight) ? Config.getTimeUntilUtcMidnight() : '00:00 UTC';
              errorMsg = `Daily Token / Quota Limit Reached (HTTP 429). Free quota resets in ${timeUntilUtc} (00:00 UTC).`;
            }
            return { success: false, error: errorMsg, isRateLimit, provider: 'gemini', latencyMs };
          }
        }

        const data = await response.json();
        latencyMs = Math.round(performance.now() - startTime);

        const candidate = data.candidates && data.candidates[0];
        const rawContent = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] ? candidate.content.parts[0].text : '';

        const parsedJson = this.cleanJsonResponse(rawContent);
        if (!parsedJson || !Array.isArray(parsedJson.answers) || parsedJson.answers.length === 0) {
          return { success: false, error: 'Google Gemini response could not be parsed into valid answers.', raw: rawContent, provider: 'gemini', latencyMs };
        }

        return {
          success: true,
          data: parsedJson,
          raw: rawContent,
          latencyMs,
          model: targetModel,
          provider: 'gemini'
        };
      } catch (err) {
        return {
          success: false,
          error: `Google Gemini Error: ${err.message || 'Request failed'}`,
          provider: 'gemini',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  }

  return GeminiClient;
});
