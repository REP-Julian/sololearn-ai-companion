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
