/**
 * SoloLearn AI Companion - Main Orchestrator
 * Seamlessly scans page, inspects React state, queries AI with 3-pass verification, highlights answer on webpage, and reveals step-by-step guidance.
 */

(function () {
  'use strict';

  if (window.__SOLOLEARN_AI_INITIALIZED__) return;
  window.__SOLOLEARN_AI_INITIALIZED__ = true;

  const Config = window.SoloLearnConfig || (typeof require !== 'undefined' ? require('./config.js') : null);
  const ConsensusEngine = window.MultiProviderConsensusEngine || (typeof require !== 'undefined' ? require('./consensus.js') : null);
  const Parser = window.SoloLearnParser || (typeof require !== 'undefined' ? require('./parser.js') : null);
  const Executor = window.SoloLearnExecutor || (typeof require !== 'undefined' ? require('./executor.js') : null);
  const UI = window.SoloLearnUI || (typeof require !== 'undefined' ? require('./ui.js') : null);

  if (!Config || !ConsensusEngine || !Parser || !Executor || !UI) {
    console.error('[SoloLearn AI Companion] Missing required modules.');
    return;
  }

  class SoloLearnCompanionController {
    constructor() {
      this.engine = new ConsensusEngine();
      this.isBusy = false;
      this.lastQuestionSignature = null;
      this.lastActiveQuestion = null;
      this.lastActiveResult = null;
      this.lastFeedbackProcessed = null;
      this.autoScanTimer = null;

      this.ui = new UI({
        onSolve: () => this.handleScanAndReveal(),
        onAutoFill: () => this.handleAutoFill(),
        onToggleAutoSolve: (enabled) => this.handleAutoScanToggle(enabled),
        onFeedbackCorrect: () => this.handleFeedbackCorrect(),
        onFeedbackWrong: (correction) => this.handleFeedbackWrong(correction),
        onClearMemory: () => this.handleClearMemory(),
        onExportMemory: () => this.handleExportMemory()
      });
    }

    async init() {
      console.log('[SoloLearn AI Companion] Initializing with Multi-Provider AI & Adaptive Learning Memory Engine...');
      await this.ui.init();
      this.engine.updateSettings(this.ui.settings);
      this.updateMemoryStats();

      this.startObserver();
      this.ui.log('Multi-Provider AI Companion Ready! Press Alt+S to scan, Alt+F to auto-fill.', 'highlight');
    }

    updateMemoryStats() {
      if (this.engine.memory) {
        const stats = this.engine.memory.getStats();
        this.ui.updateMemoryStats(stats);
      }
    }

    handleFeedbackCorrect() {
      if (this.lastActiveQuestion && this.lastActiveResult && this.engine.memory) {
        const ans = this.lastActiveResult.answers || [this.lastActiveResult.answer];
        this.engine.memory.learnCorrect(this.lastActiveQuestion, ans, 'manual_user_feedback');
        this.updateMemoryStats();
        this.ui.log('🧠 Confirmed & Mastered: Saved verified solution into Adaptive Memory Bank!', 'success');
        this.ui.playChime('success');
      } else {
        this.ui.log('Please scan an exercise first before confirming.', 'normal');
      }
    }

    handleFeedbackWrong(userCorrection) {
      if (this.lastActiveQuestion && this.engine.memory) {
        const wrongAns = this.lastActiveResult ? (this.lastActiveResult.answers || [this.lastActiveResult.answer]) : [];
        let rightAns = [userCorrection];
        if (userCorrection.includes('\n')) {
          rightAns = userCorrection.split('\n').map(s => s.trim()).filter(Boolean);
        } else if (userCorrection.includes(',') && !userCorrection.startsWith('"')) {
          rightAns = userCorrection.split(',').map(s => s.trim()).filter(Boolean);
        }

        const record = this.engine.memory.learnMistake(this.lastActiveQuestion, wrongAns, rightAns, 'manual_user_correction');
        this.updateMemoryStats();

        const ansText = rightAns.join(', ');
        this.ui.displayAnswer(ansText, record.reflection, record.reflection, false, {
          isLearnedMemory: true,
          isCorrected: true,
          consensusLabel: '🧠 ADAPTED (Self-Corrected)'
        });
        Executor.highlightAnswerOnPage(this.lastActiveQuestion, { answers: rightAns, type: this.lastActiveQuestion.type });

        this.ui.log(`🧠 Acknowledged Mistake: Analyzed error on "${wrongAns.join(', ')}". Adapted memory with correct answer: "${ansText}".`, 'success');
        this.ui.playChime('success');
      }
    }

    handleClearMemory() {
      if (this.engine.memory) {
        this.engine.memory.clear();
        this.updateMemoryStats();
        this.ui.log('🧠 Memory Bank reset to benchmark defaults.', 'normal');
      }
    }

    handleExportMemory() {
      if (this.engine.memory) {
        const json = this.engine.memory.exportJson();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(json).then(() => {
            this.ui.log('✓ Memory Bank JSON copied to clipboard!', 'success');
            this.ui.playChime('success');
          }).catch(() => {
            this.ui.log(`Memory Bank (${this.engine.memory.memories.size} records)`, 'normal');
          });
        }
      }
    }

    getQuestionSignature(question) {
      if (!question) return null;
      const url = (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '');
      const opts = (question.options || []).join('|');
      return `${url}__${question.type}__${question.title}__${opts}__${(question.code || '').slice(0, 60)}__${question.blankCount}`;
    }

    async handleAutoFill() {
      if (this.lastActiveQuestion && this.lastActiveResult) {
        const res = Executor.autoFillAnswer(this.lastActiveQuestion, this.lastActiveResult);
        if (res.success) {
          this.ui.log('✓ Auto-filled answers onto the page!', 'success');
          this.ui.playChime('success');
          return;
        }
      }

      // If not yet solved, solve first then fill
      await this.handleScanAndReveal(true);
      if (this.lastActiveQuestion && this.lastActiveResult) {
        const res = Executor.autoFillAnswer(this.lastActiveQuestion, this.lastActiveResult);
        if (res.success) {
          this.ui.log('✓ Scanned & Auto-filled answers onto the page!', 'success');
          this.ui.playChime('success');
        }
      }
    }

    async handleScanAndReveal(forceRefresh = true) {
      if (this.isBusy) {
        // If busy for more than 5s, force unlock
        this.isBusy = false;
      }

      if (forceRefresh) {
        this.engine.clearCache();
      }

      const settings = this.ui.settings;
      this.engine.updateSettings(settings);

      // 1. Scan Question & Check React Fiber State
      this.ui.setStatus('Scanning React State & DOM...', 'thinking');
      const question = Parser.parseQuestion();

      if (!question) {
        this.ui.setStatus('No Question Found', 'idle');
        this.ui.log('Could not find active exercise on this page.', 'normal');
        this.isBusy = false;
        return;
      }

      if (settings.languageOverride && settings.languageOverride !== 'auto') {
        question.language = settings.languageOverride;
      } else {
        const detectedLang = Parser.detectLanguage(question.code || '');
        if (detectedLang) question.language = detectedLang;
      }

      // Check if we need API key (only if internal ground truth was not found)
      const hasAnyKey = Boolean(settings.mistralApiKey || settings.apiKey || settings.geminiApiKey || settings.huggingfaceApiKey || settings.cerebrasApiKey || settings.openrouterApiKey || settings.groqApiKey);
      if (!question.isInternalGroundTruth && !hasAnyKey) {
        this.ui.setStatus('API Key Required', 'error');
        this.ui.log('Please enter your Mistral, Google AI Studio, or Hugging Face token in settings (⚙) or HUD.', 'error');
        this.ui.playChime('error');
        this.isBusy = false;
        return;
      }

      this.isBusy = true;
      const busyWatchdog = setTimeout(() => {
        if (this.isBusy) {
          this.isBusy = false;
          this.ui.setStatus('Ready', 'idle');
        }
      }, 15000);

      const isConsensus = Boolean(settings.consensusMode !== false);
      const activeLabel = question.isInternalGroundTruth ? 'SoloLearn State' : (isConsensus ? '3-AI Consensus' : 'AI Analysis');
      this.ui.updateModelBadge(question.isInternalGroundTruth ? '⚡ Ground Truth' : (isConsensus ? '🏆 Consensus' : 'AI Model'));
      this.ui.setStatus(`Analyzing ${question.language} (${activeLabel})...`, 'thinking');
      this.ui.showLoadingAnswer(activeLabel);
      this.ui.log(`🎯 Course: ${question.language} | Analyzing: "${(question.title || 'Exercise').slice(0, 40)}..."`, 'highlight');

      try {
        // 2. Solve (Via Ground Truth or Multi-Provider 4-Pass Verification)
        const response = await this.engine.solve(question, settings);

        if (!response.success) {
          this.ui.setStatus('AI Error', 'error');
          this.ui.log(`AI Error: ${response.error}`, 'error');
          this.ui.displayAnswer('Error analyzing exercise', response.error);
          this.ui.playChime('error');
          this.isBusy = false;
          clearTimeout(busyWatchdog);
          return;
        }

        const aiData = response.data;
        this.lastActiveQuestion = question;
        this.lastActiveResult = aiData;

        const isReorder = aiData.type === 'reorder' || question.type === 'reorder';
        const isFillBlanks = aiData.type === 'fill_blanks' || question.type === 'fill_blanks';

        let answerText;
        if (isReorder && Array.isArray(aiData.answers)) {
          answerText = aiData.answers.map((a, idx) => `Step ${idx + 1}: ${a}`).join('\n');
        } else if (isFillBlanks && Array.isArray(aiData.answers) && aiData.answers.length > 1) {
          answerText = aiData.answers.map((a, idx) => `[Blank ${idx + 1}]  ${a}`).join('\n');
        } else if (Array.isArray(aiData.answers)) {
          answerText = aiData.answers.join(', ');
        } else {
          answerText = aiData.answer || 'Answer Ready';
        }
        const explanation = aiData.explanation || aiData.thought || 'Analysis complete.';

        const isGroundTruth = Boolean(response.isInternalGroundTruth || question.isInternalGroundTruth);
        const contextProof = aiData.thought || (isGroundTruth ? 'Extracted directly from SoloLearn React Fiber internal state.' : (response.raw || '4-Pass Multi-AI Verified Solution'));

        const winnerPrefix = isGroundTruth
          ? '⚡ Ground Truth'
          : (response.consensusLabel || '🎯 Answer');

        const badgeTag = isGroundTruth
          ? '⚡ Ground Truth'
          : `${response.votes ? `🏆 ${response.votes}/${response.totalProviders} Agreed` : (response.model || 'AI')} • ${response.latencyMs}ms`;

        // 3. Highlight the correct answer directly on the webpage!
        Executor.highlightAnswerOnPage(question, aiData);

        // 4. If autoFill is enabled in settings, auto-fill immediately
        if (settings.autoFill) {
          Executor.autoFillAnswer(question, aiData);
        }

        // 5. Update the model badge
        this.ui.updateModelBadge(isGroundTruth ? '⚡ Ground Truth' : (response.hasConsensus ? `🏆 ${response.votes}/${response.totalProviders} Agree` : (response.model || 'AI')));

        // 6. Display in Companion Card with full proof & consensus breakdown
        this.ui.displayAnswer(answerText, explanation, contextProof, isGroundTruth, {
          hasConsensus: response.hasConsensus,
          consensusLabel: response.consensusLabel,
          votes: response.votes,
          totalProviders: response.totalProviders,
          breakdown: response.breakdown,
          agreedModels: (response.agreedModels || []).join(' + ')
        });

        this.ui.setStatus(response.hasConsensus ? '🏆 Consensus Answer Revealed!' : 'Answer Revealed!', 'success');
        const logAns = isReorder && Array.isArray(aiData.answers) ? aiData.answers.join(' ➔ ') : answerText;
        this.ui.log(`${winnerPrefix}: <span class="highlight">${logAns}</span> (${badgeTag})`, 'success');
        this.ui.playChime('success');
      } catch (err) {
        console.error('[SoloLearn AI Companion]', err);
        this.ui.setStatus('Unexpected Error', 'error');
        this.ui.log(`Error: ${err.message}`, 'error');
        this.ui.playChime('error');
      } finally {
        clearTimeout(busyWatchdog);
        setTimeout(() => {
          this.isBusy = false;
          this.ui.setStatus('Ready', 'idle');
        }, 500);
      }
    }

    handleAutoScanToggle(enabled) {
      if (enabled) {
        this.ui.log('⚡ Auto-Scan is ON: Companion will automatically scan and reveal answers as questions change.', 'success');
        this.lastQuestionSignature = null;
        this.checkAndAutoScan();
      } else {
        this.ui.log('Auto-Scan is OFF. Use Alt + S to scan on demand.', 'normal');
      }
    }

    checkAndAutoScan() {
      if (!this.ui.settings.autoSolve || this.isBusy) return;

      const question = Parser.parseQuestion();
      if (!question) return;

      const signature = this.getQuestionSignature(question);
      if (signature && signature !== this.lastQuestionSignature) {
        this.lastQuestionSignature = signature;
        this.handleScanAndReveal(false);
      }
    }

    checkSubmissionFeedback() {
      if (!Parser.FeedbackDetector || !this.lastActiveQuestion || !this.lastActiveResult || !this.engine.memory) return;
      const feedback = Parser.FeedbackDetector.detectSubmissionResult();
      if (!feedback || !feedback.isSubmitted) return;

      if (this.lastFeedbackProcessed === feedback.bannerElement && this.lastFeedbackProcessed !== null) return;
      this.lastFeedbackProcessed = feedback.bannerElement || true;

      const activeAnswers = this.lastActiveResult.answers || [this.lastActiveResult.answer];

      if (feedback.isCorrect) {
        this.engine.memory.learnCorrect(this.lastActiveQuestion, activeAnswers, feedback.source || 'dom_feedback');
        this.updateMemoryStats();
        this.ui.log('🧠 Result: CORRECT! Adapted and mastered this answer for the future.', 'success');
        this.ui.playChime('success');
      } else {
        const revealed = feedback.revealedAnswers;
        if (revealed && revealed.length > 0) {
          const record = this.engine.memory.learnMistake(this.lastActiveQuestion, activeAnswers, revealed, feedback.source || 'dom_feedback');
          this.updateMemoryStats();
          const ansText = revealed.join(', ');
          this.ui.displayAnswer(ansText, record.reflection, record.reflection, false, {
            isLearnedMemory: true,
            isCorrected: true,
            consensusLabel: '🧠 ADAPTED (Self-Corrected)'
          });
          Executor.highlightAnswerOnPage(this.lastActiveQuestion, { answers: revealed, type: this.lastActiveQuestion.type });
          this.ui.log(`🧠 Result: Incorrect. Analyzed mistake on "${activeAnswers.join(', ')}", adapted memory to "${ansText}". Ready for next time!`, 'highlight');
          this.ui.playChime('error');
        } else {
          this.ui.log('⚠️ Result: Incorrect. Click "👎 Correct Me" on the card to teach the AI the right answer.', 'error');
        }
      }
    }

    startObserver() {
      if (typeof document === 'undefined' || !document.body) return;

      // 1. Mutation Observer for DOM updates & feedback detection
      if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
          this.checkSubmissionFeedback();
          if (this.ui.settings.autoSolve && !this.isBusy) {
            clearTimeout(this.autoScanTimer);
            this.autoScanTimer = setTimeout(() => {
              this.checkAndAutoScan();
            }, 600);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }

      // 2. Continuous Polling Fallback (1000ms) for questions & submission feedback
      setInterval(() => {
        this.checkSubmissionFeedback();
        if (this.ui.settings.autoSolve && !this.isBusy) {
          this.checkAndAutoScan();
        }
      }, 1000);

      // 3. SPA Route Navigation Listeners
      if (typeof window !== 'undefined') {
        window.addEventListener('popstate', () => {
          if (this.ui.settings.autoSolve) {
            setTimeout(() => this.checkAndAutoScan(), 500);
          }
        });
        window.addEventListener('hashchange', () => {
          if (this.ui.settings.autoSolve) {
            setTimeout(() => this.checkAndAutoScan(), 500);
          }
        });
      }

      // Initial check on load
      if (this.ui.settings.autoSolve) {
        setTimeout(() => this.checkAndAutoScan(), 1000);
      }
    }
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = SoloLearnCompanionController;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const controller = new SoloLearnCompanionController();
        controller.init();
      });
    } else {
      const controller = new SoloLearnCompanionController();
      controller.init();
    }
  }
})();
