/**
 * SoloLearn AI Companion - Hugging Face Inference Client
 * Connects to Hugging Face Serverless Chat Completion API (Qwen 2.5 Coder, Llama 3.3 70B, DeepSeek R1).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config.js'));
  } else {
    root.HuggingFaceClient = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const HF_ROUTER_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';
  const HF_API_INFERENCE_ENDPOINT = 'https://api-inference.huggingface.co/v1/chat/completions';

  class HuggingFaceClient {
    constructor(apiKey = '', model = 'Qwen/Qwen2.5-Coder-32B-Instruct') {
      this.apiKey = apiKey ? apiKey.trim() : '';
      this.model = model || 'Qwen/Qwen2.5-Coder-32B-Instruct';
      this.provider = 'huggingface';
    }

    setApiKey(apiKey) {
      this.apiKey = apiKey ? apiKey.trim() : '';
    }

    setModel(model) {
      this.model = model || 'Qwen/Qwen2.5-Coder-32B-Instruct';
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
          thought: 'Extracted from raw Hugging Face JSON text.',
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
        return { success: false, error: 'Hugging Face API Key / Token (hf_...) is missing.' };
      }

      const startTime = performance.now();
      let targetModel = requestedModel || this.model || 'Qwen/Qwen2.5-Coder-32B-Instruct';

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

      const userPrompt = `You are an elite competitive programmer and compiler engineer AI on Hugging Face Serverless Inference. Execute a 4-Pass Mental Verification before generating the final JSON:

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
        max_tokens: 1000
      };

      try {
        const fetchFn = (Config && Config.safeFetch) || fetch;
        let response = await fetchFn(HF_ROUTER_ENDPOINT, {
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
          try {
            const errData = await response.json();
            if (errData && errData.error) {
              errorMsg = typeof errData.error === 'string' ? errData.error : (errData.error.message || JSON.stringify(errData.error));
            }
          } catch (_) {}

          // Fallback models on Hugging Face
          const fallbackHFModels = [
            'Qwen/Qwen2.5-Coder-32B-Instruct',
            'meta-llama/Llama-3.3-70B-Instruct',
            'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
            'mistralai/Mistral-7B-Instruct-v0.3'
          ];

          for (const fbModel of fallbackHFModels) {
            if (fbModel === targetModel) continue;
            try {
              const fbBody = { ...requestBody, model: fbModel };
              const fbRes = await fetchFn(HF_ROUTER_ENDPOINT, {
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

          if (!response.ok) {
            let isRateLimit = response.status === 429 || errorMsg.toLowerCase().includes('rate limit');
            if (isRateLimit) {
              const timeUntilUtc = (Config && Config.getTimeUntilUtcMidnight) ? Config.getTimeUntilUtcMidnight() : '00:00 UTC';
              errorMsg = `Daily Token / Rate Limit Reached (HTTP 429). Free quota resets in ${timeUntilUtc} (00:00 UTC).`;
            }
            return { success: false, error: errorMsg, isRateLimit, provider: 'huggingface', latencyMs };
          }
        }

        const data = await response.json();
        latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices && data.choices[0];
        const rawContent = choice && choice.message ? choice.message.content : '';

        const parsedJson = this.cleanJsonResponse(rawContent);
        if (!parsedJson || !Array.isArray(parsedJson.answers) || parsedJson.answers.length === 0) {
          return { success: false, error: 'Hugging Face response could not be parsed into valid answers.', raw: rawContent, provider: 'huggingface', latencyMs };
        }

        return {
          success: true,
          data: parsedJson,
          raw: rawContent,
          latencyMs,
          model: targetModel,
          provider: 'huggingface',
          usage: data.usage || null
        };
      } catch (err) {
        return {
          success: false,
          error: `Hugging Face Error: ${err.message || 'Request failed'}`,
          provider: 'huggingface',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  }

  return HuggingFaceClient;
});
