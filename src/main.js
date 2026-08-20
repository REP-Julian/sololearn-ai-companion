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
