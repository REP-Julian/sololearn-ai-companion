/**
 * SoloLearn AI Companion - Fair & Synchronized Multi-Model Consensus Engine
 * - Runs all active models in parallel and strictly waits for ALL models to finish.
 * - Fair & Square voting across all models with no preset favoritism.
 * - Compares answers and rewards matching solutions with the Golden Consensus Highlight.
 * - Auto-expands to a 3-model internal race if only 1 provider API key is provided.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./config.js'),
      require('./memory.js'),
      require('./mistral.js'),
      require('./providers/gemini.js'),
      require('./providers/huggingface.js')
    );
  } else {
    root.MultiProviderConsensusEngine = factory(
      root.SoloLearnConfig,
      root.SoloLearnMemory,
      root.MistralClient,
      root.GeminiClient,
      root.HuggingFaceClient
    );
  }
})(typeof self !== 'undefined' ? self : this, function (Config, SoloLearnMemory, MistralClient, GeminiClient, HuggingFaceClient) {
  'use strict';

  class MultiProviderConsensusEngine {
    constructor(settings = {}) {
      this.memory = SoloLearnMemory ? new SoloLearnMemory() : null;
      this.mistral = new MistralClient(settings.mistralApiKey || settings.apiKey, settings.mistralModel || 'codestral-latest');
      this.gemini = new GeminiClient(settings.geminiApiKey || settings.groqApiKey, settings.geminiModel || 'gemini-3.7-flash');
      this.huggingface = new HuggingFaceClient(settings.huggingfaceApiKey || settings.cerebrasApiKey || settings.openrouterApiKey, settings.huggingfaceModel || 'Qwen/Qwen2.5-Coder-32B-Instruct');
      this.cache = new Map();
      this.updateSettings(settings);
    }

    updateSettings(settings) {
      if (!settings) return;
      if (settings.mistralApiKey || settings.apiKey) {
        this.mistral.setApiKey(settings.mistralApiKey || settings.apiKey);
      }
      if (settings.mistralModel) {
        this.mistral.setModel(settings.mistralModel);
      }

      if (settings.geminiApiKey || settings.groqApiKey) {
        this.gemini.setApiKey(settings.geminiApiKey || settings.groqApiKey);
      }
      if (settings.geminiModel) {
        this.gemini.setModel(settings.geminiModel);
      }

      if (settings.huggingfaceApiKey || settings.cerebrasApiKey || settings.openrouterApiKey) {
        this.huggingface.setApiKey(settings.huggingfaceApiKey || settings.cerebrasApiKey || settings.openrouterApiKey);
      }
      if (settings.huggingfaceModel) {
        this.huggingface.setModel(settings.huggingfaceModel);
      }
    }

    clearCache() {
      this.cache.clear();
    }

    getCacheKey(questionPayload) {
      if (!questionPayload) return null;
      const t = questionPayload.title || '';
      const c = (questionPayload.code || '').slice(0, 100);
      const ty = questionPayload.type || '';
      const bc = questionPayload.blankCount || 0;
      const opts = Array.isArray(questionPayload.options) ? questionPayload.options.join(',') : '';
      return `${ty}_${bc}_${t}_${c}_${opts}`;
    }

    normalizeSignature(answers, questionType = '') {
      if (!answers) return '';
      const arr = Array.isArray(answers) ? answers : [answers];
      const cleaned = arr.map(a => String(a).toLowerCase().trim().replace(/[\r\n\t]/g, ' ').replace(/['"`]/g, ''));
      // Only sort for multi_choice (where checkbox selection order does not matter).
      // For fill_blanks, reorder, and slot tasks, DO NOT sort! Sequential slot order is critical!
      if (questionType === 'multi_choice') {
        return cleaned.slice().sort().join('|||');
      }
      return cleaned.join('|||');
    }

    /**
     * Builds a fair, balanced pool of 3 distinct models to race.
     * If 3 providers have keys -> 1 model from each (Mistral + Google AI Studio + Hugging Face).
     * If 2 providers have keys -> 2 models from primary, 1 from secondary.
     * If 1 provider has key -> 3 distinct top models from that single provider.
     */
    buildModelPool(settings = {}) {
      const pool = [];
      const hasMistral = Boolean(this.mistral.apiKey);
      const hasGemini = Boolean(this.gemini.apiKey);
      const hasHuggingFace = Boolean(this.huggingface.apiKey);

      const activeProviderCount = [hasMistral, hasGemini, hasHuggingFace].filter(Boolean).length;

      if (activeProviderCount === 0) return pool;

      // Case A: All 3 Providers Configured (Mistral + Google AI Studio + Hugging Face)
      if (hasMistral && hasGemini && hasHuggingFace) {
        pool.push({ providerName: 'Mistral (Codestral)', client: this.mistral, model: settings.mistralModel || 'codestral-latest' });
        pool.push({ providerName: 'Google AI Studio (Gemini)', client: this.gemini, model: settings.geminiModel || 'gemini-3.7-flash' });
        pool.push({ providerName: 'Hugging Face (Qwen Coder)', client: this.huggingface, model: settings.huggingfaceModel || 'Qwen/Qwen2.5-Coder-32B-Instruct' });
        return pool;
      }

      // Case B: Exactly 2 Providers Configured
      if (hasMistral && hasGemini) {
        pool.push({ providerName: 'Codestral', client: this.mistral, model: 'codestral-latest' });
        pool.push({ providerName: 'Mistral Large', client: this.mistral, model: 'mistral-large-latest' });
        pool.push({ providerName: 'Google Gemini Flash', client: this.gemini, model: settings.geminiModel || 'gemini-3.7-flash' });
        return pool;
      }

      if (hasMistral && hasHuggingFace) {
        pool.push({ providerName: 'Codestral', client: this.mistral, model: 'codestral-latest' });
        pool.push({ providerName: 'Mistral Large', client: this.mistral, model: 'mistral-large-latest' });
        pool.push({ providerName: 'Hugging Face (Qwen Coder)', client: this.huggingface, model: settings.huggingfaceModel || 'Qwen/Qwen2.5-Coder-32B-Instruct' });
        return pool;
      }

      if (hasGemini && hasHuggingFace) {
        pool.push({ providerName: 'Gemini 3.7 Flash', client: this.gemini, model: settings.geminiModel || 'gemini-3.7-flash' });
        pool.push({ providerName: 'Gemini 3.5 Flash Lite', client: this.gemini, model: 'gemini-3.5-flash-lite' });
        pool.push({ providerName: 'Hugging Face (Qwen Coder)', client: this.huggingface, model: settings.huggingfaceModel || 'Qwen/Qwen2.5-Coder-32B-Instruct' });
        return pool;
      }

      // Case C: Single Provider Configured (Auto-expand into 3-Model Intra-Provider Race)
      if (hasMistral) {
        pool.push({ providerName: 'Codestral', client: this.mistral, model: 'codestral-latest' });
        pool.push({ providerName: 'Mistral Large', client: this.mistral, model: 'mistral-large-latest' });
        pool.push({ providerName: 'Mistral Small', client: this.mistral, model: 'mistral-small-latest' });
        return pool;
      }

      if (hasGemini) {
        pool.push({ providerName: 'Gemini 3.7 Flash', client: this.gemini, model: settings.geminiModel || 'gemini-3.7-flash' });
        pool.push({ providerName: 'Gemini 3.5 Flash Lite', client: this.gemini, model: 'gemini-3.5-flash-lite' });
        pool.push({ providerName: 'Gemini 3.1 Flash Lite', client: this.gemini, model: 'gemini-3.1-flash-lite' });
        return pool;
      }

      if (hasHuggingFace) {
        pool.push({ providerName: 'Hugging Face (Qwen 2.5 Coder)', client: this.huggingface, model: 'Qwen/Qwen2.5-Coder-32B-Instruct' });
        pool.push({ providerName: 'Hugging Face (Llama 3.3)', client: this.huggingface, model: 'meta-llama/Llama-3.3-70B-Instruct' });
        pool.push({ providerName: 'Hugging Face (DeepSeek R1)', client: this.huggingface, model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B' });
        return pool;
      }

      return pool;
    }

    async solve(questionPayload, settings = {}) {
      this.updateSettings(settings);

      // 1. Check Adaptive Learning & Self-Correction Memory Bank (0ms, 0 Tokens)
      if (this.memory && settings.memoryEnabled !== false && !questionPayload._forceAiQuery) {
        const learned = this.memory.get(questionPayload);
        if (learned && Array.isArray(learned.answers) && learned.answers.length > 0) {
          const isCorrected = learned.status === 'corrected';
          const badge = isCorrected ? '🧠 Self-Corrected' : '🧠 Learned Memory';
          const label = isCorrected ? '🧠 ADAPTED MEMORY (Learned from Mistake)' : '🧠 LEARNED KNOWLEDGE BANK (100% Verified)';
          
          return {
            success: true,
            data: {
              type: learned.type || questionPayload.type,
              confidence: 1.0,
              answers: learned.answers,
              explanation: learned.reflection || (isCorrected ? 'Solution adapted from verified self-correction.' : 'Solution recalled from continuous learning memory bank.'),
              thought: learned.reflection || `Recalled from Adaptive Memory Bank (${learned.status || 'mastered'}). 0 Tokens, 0ms latency.`
            },
            model: isCorrected ? '🧠 Adapted Memory (Self-Corrected)' : '🧠 Learned Knowledge Bank',
            isLearnedMemory: true,
            isMastered: learned.status === 'mastered',
            isCorrected: isCorrected,
            reflection: learned.reflection,
            latencyMs: 1,
            votes: 1,
            totalProviders: 1,
            hasConsensus: true,
            isGoldenMatch: true,
            consensusLabel: label
          };
        }
      }

      // 2. Direct Ground Truth from SoloLearn React Fiber State (0ms, 0 Tokens)
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
          latencyMs: 1,
          votes: 1,
          totalProviders: 1,
          hasConsensus: true,
          isGoldenMatch: true,
          consensusLabel: '⚡ Ground Truth'
        };
      }

      const cacheKey = this.getCacheKey(questionPayload);
      if (settings.cacheEnabled !== false && cacheKey && this.cache.has(cacheKey) && !questionPayload._retryAttempt) {
        const cached = this.cache.get(cacheKey);
        return { ...cached, isCached: true, latencyMs: 1 };
      }

      // 2. Build the synchronized 3-model race pool
      const pool = this.buildModelPool(settings);
      if (pool.length === 0) {
        return {
          success: false,
          error: 'No AI API keys configured. Please add your Mistral AI, Google AI Studio, or Hugging Face token in settings (⚙).'
        };
      }

      // 3. Strict Synchronized Execution: Fire all queries in parallel and WAIT FOR ALL TO COMPLETE
      const queryPromises = pool.map(async (p) => {
        try {
          const res = await p.client.queryModel(questionPayload, p.model);
          return { ...res, providerName: p.providerName, targetModel: p.model };
        } catch (err) {
          return { success: false, error: err.message, providerName: p.providerName, targetModel: p.model };
        }
      });

      // WAITS FOR ALL MODELS TO COMPLETE (Synchronized evaluation)
      const settledResults = await Promise.allSettled(queryPromises);

      const successfulResults = settledResults
        .filter(r => r.status === 'fulfilled' && r.value && r.value.success && r.value.data)
        .map(r => r.value);

      if (successfulResults.length === 0) {
        const firstError = settledResults.find(r => r.status === 'fulfilled' && !r.value.success);
        return {
          success: false,
          error: firstError ? firstError.value.error : 'All racing AI models failed to return a solution.'
        };
      }

      // 4. Fair & Square Comparison & Majority Grouping with Word Bank Compliance
      const validOptions = Array.isArray(questionPayload.options) && questionPayload.options.length > 0
        ? questionPayload.options.map(o => String(o).trim().toLowerCase())
        : [];
      const expectedSlotCount = questionPayload.blankCount || 0;

      const scoreGroup = (grp) => {
        let score = grp.votes * 100;
        const answers = Array.isArray(grp.winner.data.answers) ? grp.winner.data.answers : [grp.winner.data.answer].filter(Boolean);
        
        // Exact slot count compliance
        if (expectedSlotCount > 0 && answers.length === expectedSlotCount) {
          score += 50;
        } else if (expectedSlotCount > 0 && answers.length !== expectedSlotCount) {
          score -= 50;
        }

        // Word bank compliance
        if (validOptions.length > 0 && answers.length > 0) {
          let matches = 0;
          for (const ans of answers) {
            const cleanAns = String(ans).trim().toLowerCase();
            if (validOptions.includes(cleanAns)) {
              matches++;
            }
          }
          const complianceRatio = matches / answers.length;
          score += complianceRatio * 50;
        }

        // Multi-choice completeness bonus: in multi-choice questions ("Select all"), reward evaluating and selecting multiple valid choices
        if (questionPayload.type === 'multi_choice' && answers.length > 1) {
          score += 40;
        }

        return score;
      };

      const groupMap = new Map();
      for (const item of successfulResults) {
        const sig = this.normalizeSignature(item.data.answers || item.data.answer, questionPayload ? questionPayload.type : '');
        if (!groupMap.has(sig)) {
          groupMap.set(sig, {
            votes: 0,
            providers: [],
            models: [],
            winner: item
          });
        }
        const grp = groupMap.get(sig);
        grp.votes++;
        grp.providers.push(item.providerName);
        grp.models.push(`${item.providerName}`);
      }

      // Find the group with the highest votes & highest word-bank compliance
      let bestGroup = null;
      let bestScore = -Infinity;
      for (const grp of groupMap.values()) {
        const score = scoreGroup(grp);
        if (!bestGroup || score > bestScore) {
          bestGroup = grp;
          bestScore = score;
        }
      }

      const winner = bestGroup.winner;
      const totalVoters = successfulResults.length;
      const votes = bestGroup.votes;

      // 5. Automatic Consensus Re-scan on Disagreement: If models disagreed on pass 1, re-evaluate automatically!
      if (totalVoters >= 2 && votes < 2 && (!questionPayload._retryAttempt || questionPayload._retryAttempt < 2)) {
        const nextAttempt = (questionPayload._retryAttempt || 0) + 1;
        const retryPayload = {
          ...questionPayload,
          _retryAttempt: nextAttempt,
          extraText: `${questionPayload.extraText || ''} [CONSENSUS RE-SCAN PASS ${nextAttempt}]: Models had a tie/disagreement on pass 1. Re-analyze available choices strictly to reach consensus.`
        };
        const retryResult = await this.solve(retryPayload, settings);
        if (retryResult && retryResult.hasConsensus) {
          return retryResult;
        }
      }

      const hasConsensus = votes >= 2;
      const isUnanimous = votes === pool.length && votes >= 2;
      const isGoldenMatch = hasConsensus && votes >= 2;

      let consensusLabel = '';
      if (isUnanimous) {
        consensusLabel = `🏆 UNANIMOUS GOLDEN MATCH (${votes}/${votes} Models Agree)`;
      } else if (votes >= 2) {
        consensusLabel = `🏆 MAJORITY GOLDEN MATCH (${votes}/${totalVoters} Models Agree)`;
      } else {
        consensusLabel = `⚠️ No Agreement (${totalVoters} Models Raced - Tie)`;
      }

      const maxLatency = Math.max(...successfulResults.map(r => r.latencyMs || 0));

      const finalResult = {
        success: true,
        data: winner.data,
        raw: winner.raw,
        model: winner.model,
        provider: winner.providerName || winner.provider,
        latencyMs: maxLatency,
        votes,
        totalProviders: totalVoters,
        hasConsensus,
        isUnanimous,
        isGoldenMatch,
        consensusLabel,
        agreedModels: bestGroup.models,
        agreedProviders: bestGroup.providers,
        breakdown: settledResults.map((r, idx) => {
          const target = pool[idx] || {};
          if (r.status === 'fulfilled' && r.value && r.value.success && r.value.data) {
            return {
              provider: r.value.providerName || target.providerName,
              model: target.model,
              answers: r.value.data.answers,
              latencyMs: r.value.latencyMs,
              success: true
            };
          } else {
            const err = (r.status === 'fulfilled' && r.value && r.value.error) ? r.value.error : (r.reason ? r.reason.message : 'No response');
            const isRateLimit = Boolean(r.status === 'fulfilled' && r.value && r.value.isRateLimit);
            return {
              provider: target.providerName || 'AI Model',
              model: target.model,
              error: err,
              isRateLimit,
              success: false
            };
          }
        })
      };

      if (cacheKey && hasConsensus && !questionPayload._retryAttempt) {
        this.cache.set(cacheKey, finalResult);
      }
      return finalResult;
    }
  }

  return MultiProviderConsensusEngine;
});
