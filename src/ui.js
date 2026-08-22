/**
 * SoloLearn AI Companion - HUD Overlay UI
 * Sleek, glassmorphic companion panel that reveals answers & step-by-step reasoning.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'));
  } else {
    root.SoloLearnUI = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  class SoloLearnUI {
    constructor(callbacks = {}) {
      this.callbacks = callbacks;
      this.settings = { ...Config.DEFAULT_SETTINGS };
      this.stats = {
        scanned: 0,
        lastLatency: 0
      };
      this.hudEl = null;
      this.isMinimized = false;
      this.audioCtx = null;
    }

    async init() {
      this.settings = await Config.Storage.get();
      this.render();
      this.attachEvents();
      this.setupDraggable();
      this.setupHotkeys();
    }

    playChime(type = 'success') {
      if (!this.settings.soundEnabled) return;
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        if (type === 'success') {
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === 'error') {
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      } catch (e) {}
    }

    render() {
      const existing = document.getElementById('sololearn-ai-hud');
      if (existing) existing.remove();

      const hud = document.createElement('div');
      hud.id = 'sololearn-ai-hud';
      hud.innerHTML = `
        <div class="sl-hud-header" id="sl-drag-handle">
          <div class="sl-hud-brand">
            <div class="sl-brand-icon">⚡</div>
            <span>SoloLearn Companion</span>
          </div>
          <div class="sl-hud-controls">
            <button class="sl-icon-btn" id="sl-settings-toggle" title="Settings">⚙</button>
            <button class="sl-icon-btn" id="sl-minimize-btn" title="Minimize">─</button>
          </div>
        </div>

        <div class="sl-status-bar">
          <div class="sl-status-pill">
            <span class="sl-status-dot idle" id="sl-status-dot"></span>
            <span id="sl-status-text">Ready</span>
          </div>
          <span class="sl-model-badge" id="sl-active-model-badge">${this.settings.consensusMode !== false ? '🏆 3-AI Consensus' : this.getShortModelName(this.settings.selectedModel)}</span>
        </div>

        <div class="sl-hud-body">
          <!-- Answer & Explanation Card -->
          <div class="sl-companion-answer-card" id="sl-companion-card">
            <div class="sl-companion-answer-header">
              <span id="sl-companion-header-label">🎯 Verified Solution:</span>
              <button class="sl-icon-btn" id="sl-copy-answer-btn" title="Copy Answer to Clipboard" style="margin-left: auto; width: 24px; height: 24px; font-size: 11px;">📋</button>
            </div>
            <div class="sl-companion-answer-content" id="sl-companion-answer">
              Press Alt + S or Click Scan Below
            </div>
            <div class="sl-companion-explanation" id="sl-companion-explanation">
              💡 <b>Ready:</b> Multi-Provider AI Companion is ready to analyze your active exercise.
            </div>
            <details class="sl-companion-details" id="sl-companion-details" style="font-size: 11px; color: #94a3b8; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; cursor: pointer;">
              <summary style="font-weight: 700; color: #38bdf8;">🔍 View Multi-AI Trace & Proof</summary>
              <pre id="sl-scanned-context-preview" style="margin-top: 6px; padding: 8px; background: rgba(0,0,0,0.5); border-radius: 6px; font-size: 10px; color: #e2e8f0; white-space: pre-wrap; font-family: monospace; max-height: 140px; overflow-y: auto;"></pre>
            </details>

            <!-- Adaptive Learning Feedback Actions -->
            <div class="sl-feedback-actions" id="sl-feedback-actions" style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.12);">
              <button class="sl-feedback-btn sl-feedback-correct" id="sl-feedback-correct-btn" title="Confirm answer is correct & adapt memory">
                <span>👍 Learned (Correct)</span>
              </button>
              <button class="sl-feedback-btn sl-feedback-wrong" id="sl-feedback-wrong-btn" title="Acknowledge mistake & teach correct answer">
                <span>👎 Correct Me</span>
              </button>
            </div>

            <!-- Mistake Correction Drawer -->
            <div class="sl-correction-drawer" id="sl-correction-drawer" style="display: none; flex-direction: column; gap: 6px; margin-top: 6px; padding: 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 8px;">
              <div style="font-size: 10px; font-weight: 700; color: #fca5a5;">🧠 Acknowledge Mistake & Teach Right Answer:</div>
              <input type="text" class="sl-input" id="sl-correction-input" placeholder="Type or paste the true correct answer..." style="margin-bottom: 2px;" />
              <div style="display: flex; gap: 6px;">
                <button class="sl-btn-mini" id="sl-submit-correction-btn" style="flex: 1; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; border: none; border-radius: 5px; padding: 5px; font-weight: 700; cursor: pointer; font-size: 11px;">🧠 Adapt Memory</button>
                <button class="sl-btn-mini" id="sl-cancel-correction-btn" style="background: rgba(255,255,255,0.1); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.2); border-radius: 5px; padding: 5px 8px; cursor: pointer; font-size: 11px;">Cancel</button>
              </div>
            </div>
          </div>

          <div class="sl-action-row" style="display: flex; gap: 8px;">
            <button class="sl-btn-primary" id="sl-solve-btn" style="flex: 1;">
              <span>🔍 Scan & Reveal</span>
              <span class="sl-hotkey-hint">Alt+S</span>
            </button>
            <button class="sl-btn-secondary sl-autofill-btn" id="sl-autofill-btn" title="Auto-fill blanks or select choices on page" style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 0 14px; font-weight: 700;">
              <span>⚡ Auto-Fill</span>
              <span class="sl-hotkey-hint" style="background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.2);">Alt+F</span>
            </button>
          </div>

          <button class="sl-toggle-btn ${this.settings.autoSolve ? 'active' : ''}" id="sl-toggle-autosolve">
            <span>⚡ Auto-Scan on Question Change</span>
            <span id="sl-autosolve-indicator">${this.settings.autoSolve ? 'ON' : 'OFF'}</span>
          </button>

          <div class="sl-log-box" id="sl-log-box">
            <span>Press <b>Alt + S</b> to scan, <b>Alt + F</b> to auto-fill!</span>
          </div>

          <div class="sl-settings-drawer" id="sl-settings-drawer">
            <!-- Memory Bank Section -->
            <div class="sl-provider-section" style="border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
              <div style="font-weight: 700; color: #34d399; font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span>🧠 Adaptive Memory Bank</span>
                <span id="sl-memory-stats-badge" style="font-size: 10px; color: #6ee7b7; background: rgba(16, 185, 129, 0.2); padding: 2px 6px; border-radius: 6px; font-weight: 800;">Pre-Seeded</span>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="sl-btn-mini" id="sl-clear-memory-btn" style="flex: 1; padding: 4px 6px; font-size: 10px; background: rgba(239, 68, 68, 0.25); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; border-radius: 4px; cursor: pointer;">Reset Memory</button>
                <button class="sl-btn-mini" id="sl-export-memory-btn" style="padding: 4px 8px; font-size: 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px; cursor: pointer;">Export</button>
              </div>
            </div>

            <div class="sl-field-group">
              <button class="sl-toggle-btn ${this.settings.consensusMode !== false ? 'active' : ''}" id="sl-toggle-consensus" title="Runs Mistral AI, Google Gemini, and OpenRouter simultaneously and compares their answers with majority voting">
                <span>🏆 3-Provider Consensus Mode</span>
                <span id="sl-consensus-indicator">${this.settings.consensusMode !== false ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <!-- Provider 1: Mistral AI -->
            <div class="sl-provider-section" style="border: 1px solid rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.08); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
              <div style="font-weight: 700; color: #c084fc; font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span>🟣 Mistral AI (Codestral)</span>
                <button class="sl-btn-mini" id="sl-test-mistral-btn" style="padding: 2px 8px; font-size: 10px; background: #7e22ce; border: none; color: #fff; border-radius: 4px; cursor: pointer;">Test</button>
              </div>
              <input type="password" class="sl-input" id="sl-mistral-key-input" placeholder="Mistral API Key..." value="${this.settings.mistralApiKey || this.settings.apiKey || ''}" style="margin-bottom: 6px;" />
              <select class="sl-select" id="sl-mistral-model-select">
                ${Config.MISTRAL_MODELS.map(m => `<option value="${m.id}" ${(this.settings.mistralModel || 'codestral-latest') === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>

            <!-- Provider 2: Google AI Studio (Gemini) -->
            <div class="sl-provider-section" style="border: 1px solid rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.08); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
              <div style="font-weight: 700; color: #60a5fa; font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span>🔷 Google AI Studio (Gemini)</span>
                <button class="sl-btn-mini" id="sl-test-gemini-btn" style="padding: 2px 8px; font-size: 10px; background: #2563eb; border: none; color: #fff; border-radius: 4px; cursor: pointer;">Test</button>
              </div>
              <input type="password" class="sl-input" id="sl-gemini-key-input" placeholder="Google AI Studio API Key (AIzaSy...)" value="${this.settings.geminiApiKey || this.settings.groqApiKey || ''}" style="margin-bottom: 6px;" />
              <select class="sl-select" id="sl-gemini-model-select">
                ${Config.GEMINI_MODELS.map(m => `<option value="${m.id}" ${(this.settings.geminiModel || 'gemini-3.7-flash') === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>
            
            <!-- Provider 3: Hugging Face -->
            <div class="sl-provider-section" style="border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.08); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
              <div style="font-weight: 700; color: #fbbf24; font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span>🤗 Hugging Face (Qwen Coder 32B)</span>
                <button class="sl-btn-mini" id="sl-test-huggingface-btn" style="padding: 2px 8px; font-size: 10px; background: #d97706; border: none; color: #fff; border-radius: 4px; cursor: pointer;">Test</button>
              </div>
              <input type="password" class="sl-input" id="sl-huggingface-key-input" placeholder="Hugging Face User Access Token (hf_...)" value="${this.settings.huggingfaceApiKey || this.settings.cerebrasApiKey || this.settings.openrouterApiKey || ''}" style="margin-bottom: 6px;" />
              <select class="sl-select" id="sl-huggingface-model-select">
                ${Config.HUGGINGFACE_MODELS.map(m => `<option value="${m.id}" ${(this.settings.huggingfaceModel || 'Qwen/Qwen2.5-Coder-32B-Instruct') === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>

            <div class="sl-field-group">
              <label class="sl-field-label">Course Language</label>
              <select class="sl-select" id="sl-language-select">
                <option value="auto" ${this.settings.languageOverride === 'auto' ? 'selected' : ''}>Auto-Detect (Recommended)</option>
                <option value="C#" ${this.settings.languageOverride === 'C#' ? 'selected' : ''}>C# (.NET)</option>
                <option value="Java" ${this.settings.languageOverride === 'Java' ? 'selected' : ''}>Java</option>
                <option value="Python" ${this.settings.languageOverride === 'Python' ? 'selected' : ''}>Python</option>
                <option value="JavaScript" ${this.settings.languageOverride === 'JavaScript' ? 'selected' : ''}>JavaScript</option>
                <option value="C++" ${this.settings.languageOverride === 'C++' ? 'selected' : ''}>C++</option>
                <option value="C" ${this.settings.languageOverride === 'C' ? 'selected' : ''}>C</option>
                <option value="SQL" ${this.settings.languageOverride === 'SQL' ? 'selected' : ''}>SQL</option>
                <option value="HTML/CSS" ${this.settings.languageOverride === 'HTML/CSS' ? 'selected' : ''}>HTML / CSS</option>
              </select>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(hud);
      this.hudEl = hud;
    }

    getShortModelName(modelId) {
      if (!modelId) return '3-AI Consensus';
      if (modelId.includes('Learned Knowledge') || modelId.includes('Learned Memory')) return '🧠 Learned Memory';
      if (modelId.includes('Adapted Memory') || modelId.includes('Self-Corrected')) return '🧠 Self-Corrected';
      if (modelId.includes('Consensus')) return '3-AI Consensus';
      if (modelId.includes('codestral')) return 'Codestral';
      if (modelId.includes('gemini-3.7')) return 'Gemini 3.7 Flash';
      if (modelId.includes('gemini-3.6')) return 'Gemini 3.6 Flash';
      if (modelId.includes('gemini-3.5-flash-lite')) return 'Gemini 3.5 Lite';
      if (modelId.includes('gemini-3.5')) return 'Gemini 3.5 Flash';
      if (modelId.includes('gemini-3.1-flash-lite')) return 'Gemini 3.1 Lite';
      if (modelId.includes('gemini-3-flash') || modelId.includes('gemini-3.0')) return 'Gemini 3 Flash';
      if (modelId.includes('gemini-2.5-flash-lite')) return 'Gemini 2.5 Lite';
      if (modelId.includes('gemini-2.5')) return 'Gemini 2.5 Flash';
      if (modelId.includes('gemini')) return 'Gemini Flash';
      if (modelId.includes('Qwen') || modelId.includes('huggingface')) return 'Qwen 2.5 Coder';
      if (modelId.includes('Llama')) return 'Llama 3.3';
      if (modelId.includes('DeepSeek')) return 'DeepSeek R1';
      if (modelId.includes('mistral-large')) return 'Mistral Large';
      if (modelId.includes('SoloLearn')) return 'Ground Truth';

      const parts = modelId.split('/');
      return parts[parts.length - 1] || modelId;
    }

    updateModelBadge(modelId) {
      const badge = document.getElementById('sl-active-model-badge');
      if (badge) {
        badge.innerText = this.getShortModelName(modelId);
      }
    }

    updateMemoryStats(stats) {
      const badge = document.getElementById('sl-memory-stats-badge');
      if (badge && stats) {
        badge.innerText = `${stats.mastered || 0} Mastered • ${stats.corrected || 0} Corrected`;
      }
    }

    showLoadingAnswer(modelName) {
      const card = document.getElementById('sl-companion-card');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');

      if (card && ansEl && expEl) {
        ansEl.innerText = this.settings.consensusMode !== false ? 'Racing Mistral + Gemini + Hugging Face...' : 'Analyzing with ' + this.getShortModelName(modelName) + '...';
        expEl.innerHTML = 'Executing 4-Pass Mental Verification in parallel...';
        card.style.display = 'flex';
      }
    }

    displayAnswer(answerText, explanationText, contextInfo = '', isGroundTruth = false, consensusInfo = null) {
      const card = document.getElementById('sl-companion-card');
      const headerLabel = document.getElementById('sl-companion-header-label');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');
      const ctxEl = document.getElementById('sl-scanned-context-preview');
      const correctionDrawer = document.getElementById('sl-correction-drawer');

      if (correctionDrawer) correctionDrawer.style.display = 'none';

      const isLearned = Boolean(consensusInfo && consensusInfo.isLearnedMemory);
      const isCorrected = Boolean(consensusInfo && consensusInfo.isCorrected);

      if (headerLabel) {
        if (isCorrected) {
          headerLabel.innerText = '🧠 Adapted Memory (Learned from Mistake):';
        } else if (isLearned) {
          headerLabel.innerText = '🧠 Learned Knowledge Bank (Verified):';
        } else if (isGroundTruth) {
          headerLabel.innerText = '⚡ Ground Truth (SoloLearn State):';
        } else if (consensusInfo && consensusInfo.hasConsensus) {
          headerLabel.innerText = `${consensusInfo.consensusLabel}:`;
        } else {
          headerLabel.innerText = '🎯 4-Pass Verified Solution:';
        }
      }

      if (card) {
        const isGolden = Boolean((consensusInfo && (consensusInfo.isGoldenMatch || consensusInfo.hasConsensus)) || isGroundTruth || isLearned);
        card.classList.toggle('golden-match', isGolden);
        card.classList.toggle('consensus', isGolden);
        card.classList.toggle('learned-memory', isLearned);
        card.classList.toggle('corrected-memory', isCorrected);
      }

      // Format answerText cleanly without stripping leading square brackets of [Blank 1]
      let cleanAns = String(answerText || 'Answer Ready').trim();
      if (!cleanAns.startsWith('[Blank ') && !cleanAns.startsWith('Step ')) {
        cleanAns = cleanAns.replace(/^[{"'\s]+|[}"'\s]+$/g, '');
      }
      if (cleanAns.includes('"answers":')) {
        const match = cleanAns.match(/"answers"\s*:\s*\[([^\]]+)\]/);
        if (match) cleanAns = match[1].replace(/["']/g, '').trim();
      }

      let cleanExp = String(explanationText || 'Analysis complete.').trim();
      if (cleanExp.includes('"explanation":')) {
        const match = cleanExp.match(/"explanation"\s*:\s*"([^"]+)"/);
        if (match) cleanExp = match[1];
      }

      if (card && ansEl && expEl) {
        ansEl.innerText = cleanAns;
        let consensusTag = '';
        if (consensusInfo && consensusInfo.breakdown && consensusInfo.breakdown.length > 0) {
          const breakdownItems = consensusInfo.breakdown
            .map(b => {
              if (b.success) {
                return `<span style="display:inline-flex; align-items:center; gap:4px; margin-right:6px; margin-bottom:4px; padding:3px 8px; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.12); border-radius:6px; font-size:10px; color:#e2e8f0;"><b>${b.provider}</b>: <span style="color:#38bdf8; font-weight:700;">${Array.isArray(b.answers) ? b.answers.join(', ') : b.answers}</span> <span style="color:#94a3b8; font-size:9px;">(${b.latencyMs}ms)</span></span>`;
              } else if (b.isRateLimit || (b.error && (b.error.includes('429') || b.error.includes('00:00 UTC') || b.error.includes('Quota')))) {
                return `<span style="display:inline-flex; align-items:center; gap:4px; margin-right:6px; margin-bottom:4px; padding:3px 8px; background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.5); border-radius:6px; font-size:10px; color:#fde68a;"><b>${b.provider}</b>: ⏳ Daily Quota Used (Resets 00:00 UTC)</span>`;
              } else {
                return `<span style="display:inline-flex; align-items:center; gap:4px; margin-right:6px; margin-bottom:4px; padding:3px 8px; background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.4); border-radius:6px; font-size:10px; color:#fca5a5;"><b>${b.provider}</b>: ⚠️ ${b.error || 'Failed'}</span>`;
              }
            })
            .join('');
          consensusTag = `<div style="margin-bottom:8px; color:#fbbf24; font-size:11px;"><b>🤝 Multi-AI Breakdown (${consensusInfo.breakdown.length} Models Raced):</b><div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:4px;">${breakdownItems}</div></div>`;
        }

        let learnedTag = '';
        if (isCorrected) {
          learnedTag = `<div style="margin-bottom:6px; padding:4px 8px; background:rgba(245,158,11,0.2); border-left:3px solid #f59e0b; border-radius:4px; font-size:11px; color:#fef08a;"><b>🧠 Adapted Knowledge:</b> Error analyzed & permanently corrected.</div>`;
        } else if (isLearned) {
          learnedTag = `<div style="margin-bottom:6px; padding:4px 8px; background:rgba(16,185,129,0.2); border-left:3px solid #10b981; border-radius:4px; font-size:11px; color:#6ee7b7;"><b>🧠 Memory Match:</b> 100% Verified Answer from Knowledge Bank.</div>`;
        }

        expEl.innerHTML = `${consensusTag}${learnedTag}💡 <b>Why:</b> ${cleanExp}`;
        if (ctxEl && contextInfo) {
          ctxEl.innerText = contextInfo;
        }
        card.style.display = 'flex';
      }
    }

    attachEvents() {
      const copyBtn = document.getElementById('sl-copy-answer-btn');
      const languageSelect = document.getElementById('sl-language-select');
      const solveBtn = document.getElementById('sl-solve-btn');
      const autoFillBtn = document.getElementById('sl-autofill-btn');
      const toggleAutosolve = document.getElementById('sl-toggle-autosolve');
      const toggleConsensus = document.getElementById('sl-toggle-consensus');
      const settingsToggle = document.getElementById('sl-settings-toggle');
      const minimizeBtn = document.getElementById('sl-minimize-btn');
      const drawer = document.getElementById('sl-settings-drawer');

      // Adaptive Learning Elements
      const feedbackCorrectBtn = document.getElementById('sl-feedback-correct-btn');
      const feedbackWrongBtn = document.getElementById('sl-feedback-wrong-btn');
      const correctionDrawer = document.getElementById('sl-correction-drawer');
      const correctionInput = document.getElementById('sl-correction-input');
      const submitCorrectionBtn = document.getElementById('sl-submit-correction-btn');
      const cancelCorrectionBtn = document.getElementById('sl-cancel-correction-btn');
      const clearMemoryBtn = document.getElementById('sl-clear-memory-btn');
      const exportMemoryBtn = document.getElementById('sl-export-memory-btn');

      // Feedback Listeners
      feedbackCorrectBtn?.addEventListener('click', () => {
        if (this.callbacks.onFeedbackCorrect) {
          this.callbacks.onFeedbackCorrect();
        }
      });

      feedbackWrongBtn?.addEventListener('click', () => {
        if (!correctionDrawer) return;
        const isOpen = correctionDrawer.style.display === 'flex';
        correctionDrawer.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen && correctionInput) {
          correctionInput.focus();
        }
      });

      submitCorrectionBtn?.addEventListener('click', () => {
        const text = correctionInput ? correctionInput.value.trim() : '';
        if (!text) {
          this.log('Please enter the true correct answer in the box.', 'error');
          return;
        }
        if (this.callbacks.onFeedbackWrong) {
          this.callbacks.onFeedbackWrong(text);
        }
        if (correctionDrawer) correctionDrawer.style.display = 'none';
        if (correctionInput) correctionInput.value = '';
      });

      cancelCorrectionBtn?.addEventListener('click', () => {
        if (correctionDrawer) correctionDrawer.style.display = 'none';
      });

      clearMemoryBtn?.addEventListener('click', () => {
        if (confirm('Reset Adaptive Learning Memory Bank back to historical benchmark defaults?')) {
          if (this.callbacks.onClearMemory) {
            this.callbacks.onClearMemory();
          }
        }
      });

      exportMemoryBtn?.addEventListener('click', () => {
        if (this.callbacks.onExportMemory) {
          this.callbacks.onExportMemory();
        }
      });

      // Key Inputs
      const mistralKeyInput = document.getElementById('sl-mistral-key-input');
      const geminiKeyInput = document.getElementById('sl-gemini-key-input');
      const huggingfaceKeyInput = document.getElementById('sl-huggingface-key-input');

      // Model Selectors
      const mistralModelSelect = document.getElementById('sl-mistral-model-select');
      const geminiModelSelect = document.getElementById('sl-gemini-model-select');
      const huggingfaceModelSelect = document.getElementById('sl-huggingface-model-select');

      // Test Buttons
      const testMistralBtn = document.getElementById('sl-test-mistral-btn');
      const testGeminiBtn = document.getElementById('sl-test-gemini-btn');
      const testHuggingfaceBtn = document.getElementById('sl-test-huggingface-btn');

      copyBtn?.addEventListener('click', () => {
        const ansEl = document.getElementById('sl-companion-answer');
        if (ansEl && ansEl.innerText) {
          navigator.clipboard.writeText(ansEl.innerText).then(() => {
            this.log('✓ Answer copied to clipboard!', 'success');
            this.playChime('success');
          });
        }
      });

      languageSelect?.addEventListener('change', (e) => {
        this.settings.languageOverride = e.target.value;
        this.saveSettings();
        this.log(`Language set to: ${e.target.value}`, 'normal');
      });

      toggleConsensus?.addEventListener('click', () => {
        this.settings.consensusMode = !this.settings.consensusMode;
        toggleConsensus.classList.toggle('active', this.settings.consensusMode);
        document.getElementById('sl-consensus-indicator').innerText = this.settings.consensusMode ? 'ON' : 'OFF';
        this.saveSettings();
        this.log(this.settings.consensusMode ? '🏆 3-Provider Consensus Mode is ON: Parallel Majority Voting!' : 'Single Provider Mode is ON.', 'normal');
      });

      const handleKeySave = (provider, keyVal) => {
        const clean = keyVal.trim();
        if (provider === 'mistral') {
          this.settings.mistralApiKey = clean;
          this.settings.apiKey = clean;
        } else if (provider === 'gemini') {
          this.settings.geminiApiKey = clean;
        } else if (provider === 'huggingface') {
          this.settings.huggingfaceApiKey = clean;
        }
        this.saveSettings();
        this.log(`✓ ${provider.toUpperCase()} API key saved!`, 'success');
        this.playChime('success');
      };

      const bindKeyInput = (inputEl, provider) => {
        if (!inputEl) return;
        ['change', 'input', 'paste', 'blur'].forEach(evt => {
          inputEl.addEventListener(evt, (e) => {
            const val = e.target.value.trim();
            if (val.length > 5 || e.type === 'change' || e.type === 'blur') {
              handleKeySave(provider, val);
            }
          });
        });
      };

      bindKeyInput(mistralKeyInput, 'mistral');
      bindKeyInput(geminiKeyInput, 'gemini');
      bindKeyInput(huggingfaceKeyInput, 'huggingface');

      mistralModelSelect?.addEventListener('change', (e) => {
        this.settings.mistralModel = e.target.value;
        this.saveSettings();
      });

      geminiModelSelect?.addEventListener('change', (e) => {
        this.settings.geminiModel = e.target.value;
        this.saveSettings();
      });

      huggingfaceModelSelect?.addEventListener('change', (e) => {
        this.settings.huggingfaceModel = e.target.value;
        this.saveSettings();
      });

      const fetchFn = (Config && Config.safeFetch) || fetch;

      testMistralBtn?.addEventListener('click', async () => {
        const key = (this.settings.mistralApiKey || this.settings.apiKey || '').trim();
        if (!key) return this.log('Please enter Mistral API key in the box above.', 'error');
        this.log('Testing Mistral AI connection and verifying models...', 'highlight');
        try {
          const res = await fetchFn('https://api.mistral.ai/v1/models', { headers: { 'Authorization': `Bearer ${key}`, 'Accept': 'application/json' } });
          if (res.ok) {
            const data = await res.json();
            let modelCount = 0;
            let availableTextNames = [];
            if (data && Array.isArray(data.data)) {
              modelCount = data.data.length;
              availableTextNames = data.data
                .map(m => m.id)
                .filter(id => id && !/embed|moderation|ocr|audio|image|vision/i.test(id));
            }
            const hasCodestral = availableTextNames.some(id => id.includes('codestral'));
            const summaryList = availableTextNames.slice(0, 4).join(', ');
            this.log(`✓ Connected to Mistral AI! (${availableTextNames.length} text models ready: ${summaryList}${hasCodestral ? ' • Codestral Active' : ''})`, 'success');
            this.playChime('success');
          } else {
            this.log(`Mistral Key Error: HTTP ${res.status} (Check console.mistral.ai)`, 'error');
            this.playChime('error');
          }
        } catch (e) {
          this.log(`Mistral Error: ${e.message}`, 'error');
          this.playChime('error');
        }
      });

      testGeminiBtn?.addEventListener('click', async () => {
        const key = (this.settings.geminiApiKey || '').trim();
        if (!key) return this.log('Please enter Google AI Studio API key in the box above.', 'error');
        this.log('Testing Google AI Studio (Gemini) connection...', 'highlight');
        try {
          const res = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
          if (res.ok) { this.log('✓ Connected to Google AI Studio (Gemini Active)!', 'success'); this.playChime('success'); }
          else { this.log(`Google AI Key Error: HTTP ${res.status}`, 'error'); this.playChime('error'); }
        } catch (e) { this.log(`Google AI Error: ${e.message}`, 'error'); }
      });

      testHuggingfaceBtn?.addEventListener('click', async () => {
        const key = (this.settings.huggingfaceApiKey || '').trim();
        if (!key) return this.log('Please enter Hugging Face token in the box above.', 'error');
        this.log('Testing Hugging Face connection...', 'highlight');
        try {
          const res = await fetchFn('https://huggingface.co/api/whoami-v2', { headers: { 'Authorization': `Bearer ${key}` } });
          if (res.ok) { this.log('✓ Connected to Hugging Face (Qwen 2.5 Coder Active)!', 'success'); this.playChime('success'); }
          else { this.log(`Hugging Face Token Error: HTTP ${res.status}`, 'error'); this.playChime('error'); }
        } catch (e) { this.log(`Hugging Face Error: ${e.message}`, 'error'); }
      });

      solveBtn?.addEventListener('click', () => {
        if (this.callbacks.onSolve) this.callbacks.onSolve();
      });

      autoFillBtn?.addEventListener('click', () => {
        if (this.callbacks.onAutoFill) this.callbacks.onAutoFill();
      });

      toggleAutosolve?.addEventListener('click', () => {
        this.settings.autoSolve = !this.settings.autoSolve;
        toggleAutosolve.classList.toggle('active', this.settings.autoSolve);
        document.getElementById('sl-autosolve-indicator').innerText = this.settings.autoSolve ? 'ON' : 'OFF';
        this.saveSettings();
        if (this.callbacks.onToggleAutoSolve) this.callbacks.onToggleAutoSolve(this.settings.autoSolve);
      });

      settingsToggle?.addEventListener('click', () => {
        drawer?.classList.toggle('open');
      });

      minimizeBtn?.addEventListener('click', () => {
        this.isMinimized = !this.isMinimized;
        this.hudEl?.classList.toggle('minimized', this.isMinimized);
        minimizeBtn.innerText = this.isMinimized ? '＋' : '─';
      });
    }

    setupDraggable() {
      const handle = document.getElementById('sl-drag-handle');
      if (!handle || !this.hudEl) return;

      let isDragging = false;
      let startX, startY, initialLeft, initialTop;

      handle.addEventListener('mousedown', (e) => {
        if (e.target.closest('.sl-hud-controls')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = this.hudEl.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        this.hudEl.style.right = 'auto';
        this.hudEl.style.left = `${initialLeft}px`;
        this.hudEl.style.top = `${initialTop}px`;

        const onMouseMove = (moveEvent) => {
          if (!isDragging) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          const newLeft = Math.max(10, Math.min(window.innerWidth - this.hudEl.offsetWidth - 10, initialLeft + dx));
          const newTop = Math.max(10, Math.min(window.innerHeight - this.hudEl.offsetHeight - 10, initialTop + dy));

          this.hudEl.style.left = `${newLeft}px`;
          this.hudEl.style.top = `${newTop}px`;
        };

        const onMouseUp = () => {
          isDragging = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }

    setupHotkeys() {
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          if (this.callbacks.onSolve) this.callbacks.onSolve();
        } else if (e.altKey && (e.key === 'f' || e.key === 'F')) {
          e.preventDefault();
          if (this.callbacks.onAutoFill) this.callbacks.onAutoFill();
        } else if (e.altKey && (e.key === 'c' || e.key === 'C')) {
          e.preventDefault();
          const ansEl = document.getElementById('sl-companion-answer');
          if (ansEl && ansEl.innerText && navigator.clipboard) {
            navigator.clipboard.writeText(ansEl.innerText).then(() => {
              this.log('✓ Answer copied to clipboard! (Alt+C)', 'success');
              this.playChime('success');
            }).catch(() => {});
          }
        }
      });
    }

    setStatus(text, state = 'idle') {
      const dot = document.getElementById('sl-status-dot');
      const label = document.getElementById('sl-status-text');
      if (dot) {
        dot.className = `sl-status-dot ${state}`;
      }
      if (label) {
        label.innerText = text;
      }
    }

    log(message, type = 'normal') {
      const box = document.getElementById('sl-log-box');
      if (!box) return;
      let className = '';
      if (type === 'highlight') className = 'highlight';
      if (type === 'error') className = 'error-text';
      if (type === 'success') className = 'success-text';

      box.innerHTML = `<span class="${className}">${message}</span>`;
      box.scrollTop = box.scrollHeight;
    }

    async saveSettings() {
      await Config.Storage.save(this.settings);
    }
  }

  return SoloLearnUI;
});
