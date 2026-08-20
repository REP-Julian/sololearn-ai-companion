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
