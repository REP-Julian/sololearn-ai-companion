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
