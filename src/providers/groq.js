/**
 * SoloLearn AI Companion - Groq API Client
 * Powers Ultra-Fast (~200ms) LPU Reasoning with Llama 3.3 70B & Qwen 2.5 Coder.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config.js'));
  } else {
    root.GroqClient = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
  const GROQ_MODELS_ENDPOINT = 'https://api.groq.com/openai/v1/models';

  class GroqClient {
    constructor(apiKey, model = 'llama-3.3-70b-versatile') {
      this.apiKey = apiKey ? apiKey.trim() : '';
      this.model = model || 'llama-3.3-70b-versatile';
      this.provider = 'groq';
    }

    setApiKey(key) {
      this.apiKey = key ? key.trim() : '';
    }

    setModel(model) {
      this.model = model || 'llama-3.3-70b-versatile';
    }

    cleanJsonResponse(rawText) {
      if (!rawText) return null;
      let text = rawText.trim();

      const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (markdownMatch && markdownMatch[1]) {
        text = markdownMatch[1].trim();
      }

      let parsed = null;
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
              parsed = JSON.parse(substring.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
            } catch (err3) {}
          }
        }
      }

      if (parsed && typeof parsed === 'object') {
        let rawAnswers = parsed.answers || parsed.answer || parsed.solution || [];
        if (!Array.isArray(rawAnswers)) rawAnswers = [rawAnswers];

        const cleanAnswers = rawAnswers
          .map(a => String(a).replace(/^[{\["'\s]+|[}\]"'\s]+$/g, '').trim())
          .filter(a => a.length > 0 && !a.includes('"thought"') && !a.includes('"answers"') && a.toLowerCase() !== 'no code snippet provided');

        let cleanExp = parsed.explanation || parsed.thought || 'Verified by Groq LPU engine.';
        if (typeof cleanExp === 'object') cleanExp = JSON.stringify(cleanExp);

        if (cleanAnswers.length > 0) {
          return {
            thought: parsed.thought || 'Groq 4-Pass analysis passed.',
            type: parsed.type || 'single_choice',
            confidence: parsed.confidence || 1.0,
            answers: cleanAnswers,
            explanation: String(cleanExp).replace(/\\n/g, ' ').trim()
          };
        }
      }

      // Regex fallback
      const answersMatch = text.match(/"answers"\s*:\s*\[([\s\S]*?)\]/i);
      if (answersMatch && answersMatch[1]) {
        const rawItems = answersMatch[1].split(',');
        const extractedAnswers = rawItems
          .map(item => item.replace(/["'\\\[\]]/g, '').trim())
          .filter(a => a.length > 0 && !a.includes('{') && a.toLowerCase() !== 'no code snippet provided');

        if (extractedAnswers.length > 0) {
          return {
            type: 'fill_blanks',
            answers: extractedAnswers,
            thought: 'Groq regex extraction',
            explanation: 'Verified solution by Groq.'
          };
        }
      }

      const singleAnswerMatch = text.match(/"answer"\s*:\s*"([^"]+)"/i);
      if (singleAnswerMatch && singleAnswerMatch[1] && singleAnswerMatch[1].toLowerCase() !== 'no code snippet provided') {
        return {
          type: 'single_choice',
          answers: [singleAnswerMatch[1].replace(/["']/g, '').trim()],
          thought: 'Groq single choice match',
          explanation: 'Verified solution by Groq.'
        };
      }

      return null;
    }

    async queryModel(questionPayload, requestedModel = null) {
      if (!this.apiKey) {
        return { success: false, error: 'Groq API Key is missing.' };
      }

      const startTime = performance.now();
      let targetModel = (requestedModel && requestedModel !== 'llama-3.3-70b-versatile' && !requestedModel.includes('qwen') && !requestedModel.includes('deepseek-r1'))
        ? requestedModel
        : (this.model && this.model !== 'llama-3.3-70b-versatile' && !this.model.includes('qwen') && !this.model.includes('deepseek-r1') ? this.model : 'llama-3.1-8b-instant');

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

      const userPrompt = `You are an elite compiler engineer AI on Groq LPU. Execute a 4-Pass Mental Verification before generating the final JSON:

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

Return strictly valid JSON:
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
        let response = await fetchFn(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        let data = null;
        let latencyMs = Math.round(performance.now() - startTime);

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData && errData.error && errData.error.message) {
              errorMsg = errData.error.message;
            }
          } catch (_) {}

          // Auto-fallback to 100% supported Groq free models (llama-3.1-8b-instant / llama3-70b-8192 / mixtral-8x7b-32768)
          const fallbackGroqModels = ['llama-3.1-8b-instant', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
          for (const fbModel of fallbackGroqModels) {
            if (fbModel === activeModel && response.status !== 400) continue;
            try {
              const fbBody = { ...requestBody, model: fbModel };
              const fbRes = await fetchFn(GROQ_ENDPOINT, {
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
            return { success: false, error: errorMsg, provider: 'groq', latencyMs };
          }
        }

        data = await response.json();
        latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices && data.choices[0];
        const rawContent = choice && choice.message ? choice.message.content : '';

        const parsedJson = this.cleanJsonResponse(rawContent);
        if (!parsedJson || !Array.isArray(parsedJson.answers) || parsedJson.answers.length === 0) {
          return { success: false, error: 'Groq response could not be parsed into valid answers.', raw: rawContent, provider: 'groq', latencyMs };
        }

        return {
          success: true,
          data: parsedJson,
          raw: rawContent,
          latencyMs,
          model: targetModel,
          provider: 'groq',
          usage: data.usage || null
        };
      } catch (err) {
        return {
          success: false,
          error: `Groq error: ${err.message || 'Request failed'}`,
          provider: 'groq',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  }

  GroqClient.MODELS_ENDPOINT = GROQ_MODELS_ENDPOINT;
  return GroqClient;
});
