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

      const hasApiKey = Boolean(this.settings.apiKey && this.settings.apiKey.trim().length > 5);

      const hud = document.createElement('div');
      hud.id = 'sololearn-ai-hud';
      hud.innerHTML = `
        <div class="sl-hud-header" id="sl-drag-handle">
          <div class="sl-hud-brand">
            <div class="sl-brand-icon">🤖</div>
            <span>SoloLearn AI Companion</span>
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
          <span class="sl-model-badge" id="sl-active-model-badge">${this.getShortModelName(this.settings.selectedModel)}</span>
        </div>

        <div class="sl-hud-body">
          <!-- API Key Quick Setup Card if missing -->
          <div class="sl-api-warning-card" id="sl-api-warning-card" style="display: ${hasApiKey ? 'none' : 'flex'};">
            <div class="sl-api-warning-header">
              <span>🔑 Enter OpenRouter API Key</span>
            </div>
            <div class="sl-api-warning-desc">
              Paste your OpenRouter API key below to activate the AI Companion:
            </div>
            <div class="sl-api-inline-form">
              <input type="password" class="sl-input" id="sl-inline-key-input" placeholder="sk-or-v1-..." value="${this.settings.apiKey || ''}" />
              <button class="sl-btn-secondary" id="sl-inline-save-key-btn">Save</button>
            </div>
          </div>

          <!-- Answer & Explanation Card -->
          <div class="sl-companion-answer-card" id="sl-companion-card">
            <div class="sl-companion-answer-header">
              <span>🎯 Best Recommended Answer:</span>
              <button class="sl-icon-btn" id="sl-copy-answer-btn" title="Copy Answer to Clipboard" style="margin-left: auto; width: 24px; height: 24px; font-size: 11px;">📋</button>
            </div>
            <div class="sl-companion-answer-content" id="sl-companion-answer">
              Press Alt + S or Click Scan Below
            </div>
            <div class="sl-companion-explanation" id="sl-companion-explanation">
              💡 <b>Ready:</b> AI Companion is ready to analyze your active exercise.
            </div>
            <details class="sl-companion-details" id="sl-companion-details" style="font-size: 11px; color: #94a3b8; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; cursor: pointer;">
              <summary style="font-weight: 700; color: #38bdf8;">🔍 View Scanned Context & Proof</summary>
              <pre id="sl-scanned-context-preview" style="margin-top: 6px; padding: 8px; background: rgba(0,0,0,0.5); border-radius: 6px; font-size: 10px; color: #e2e8f0; white-space: pre-wrap; font-family: monospace; max-height: 120px; overflow-y: auto;"></pre>
            </details>
          </div>

          <button class="sl-btn-primary" id="sl-solve-btn">
            <span>🔍 Scan & Reveal Answer</span>
            <span class="sl-hotkey-hint">Alt+S</span>
          </button>

          <button class="sl-toggle-btn ${this.settings.autoSolve ? 'active' : ''}" id="sl-toggle-autosolve">
            <span>⚡ Auto-Scan on Question Change</span>
            <span id="sl-autosolve-indicator">${this.settings.autoSolve ? 'ON' : 'OFF'}</span>
          </button>

          <div class="sl-log-box" id="sl-log-box">
            <span>Press <b>Alt + S</b> or click Scan to reveal the answer & explanation!</span>
          </div>

          <div class="sl-settings-drawer" id="sl-settings-drawer">
            <div class="sl-field-group">
              <label class="sl-field-label">OpenRouter API Key</label>
              <input type="password" class="sl-input" id="sl-api-key-input" placeholder="sk-or-v1-..." value="${this.settings.apiKey || ''}" />
            </div>

            <div class="sl-field-group">
              <label class="sl-field-label">Course Language</label>
              <select class="sl-select" id="sl-language-select">
                <option value="auto" ${this.settings.languageOverride === 'auto' ? 'selected' : ''}>Auto-Detect (Recommended)</option>
                <option value="C#" ${this.settings.languageOverride === 'C#' ? 'selected' : ''}>C# (.NET)</option>
                <option value="Python" ${this.settings.languageOverride === 'Python' ? 'selected' : ''}>Python</option>
                <option value="JavaScript" ${this.settings.languageOverride === 'JavaScript' ? 'selected' : ''}>JavaScript</option>
                <option value="Java" ${this.settings.languageOverride === 'Java' ? 'selected' : ''}>Java</option>
                <option value="C++" ${this.settings.languageOverride === 'C++' ? 'selected' : ''}>C++</option>
                <option value="SQL" ${this.settings.languageOverride === 'SQL' ? 'selected' : ''}>SQL</option>
                <option value="HTML/CSS" ${this.settings.languageOverride === 'HTML/CSS' ? 'selected' : ''}>HTML / CSS</option>
              </select>
            </div>

            <div class="sl-field-group">
              <label class="sl-field-label">AI Model</label>
              <select class="sl-select" id="sl-model-select">
                ${Config.DEFAULT_MODELS.map(m => `
                  <option value="${m.id}" ${this.settings.selectedModel === m.id ? 'selected' : ''}>
                    ${m.name}
                  </option>
                `).join('')}
                <option value="custom" ${this.settings.selectedModel === 'custom' ? 'selected' : ''}>Custom Model Name...</option>
              </select>
            </div>

            <div class="sl-field-group" id="sl-custom-model-group" style="display: ${this.settings.selectedModel === 'custom' ? 'flex' : 'none'};">
              <label class="sl-field-label">Custom OpenRouter Model ID</label>
              <input type="text" class="sl-input" id="sl-custom-model-input" placeholder="e.g. anthropic/claude-3-haiku" value="${this.settings.customModel || ''}" />
            </div>

            <div class="sl-field-group">
              <button class="sl-btn-secondary" id="sl-test-key-btn">🧪 Test Connection</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(hud);
      this.hudEl = hud;
    }

    getShortModelName(modelId) {
      if (!modelId) return 'Claude 3.5';
      const parts = modelId.split('/');
      return parts[parts.length - 1] || modelId;
    }

    showLoadingAnswer(modelName) {
      const card = document.getElementById('sl-companion-card');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');

      if (card && ansEl && expEl) {
        ansEl.innerText = 'Analyzing with ' + this.getShortModelName(modelName) + '...';
        expEl.innerHTML = 'Computing mathematical operations and syntax rules...';
        card.style.display = 'flex';
      }
    }

    displayAnswer(answerText, explanationText, contextInfo = '') {
      const card = document.getElementById('sl-companion-card');
      const ansEl = document.getElementById('sl-companion-answer');
      const expEl = document.getElementById('sl-companion-explanation');
      const ctxEl = document.getElementById('sl-scanned-context-preview');

      // Strip any accidental JSON or metadata from answerText
      let cleanAns = String(answerText || 'Answer Ready').trim();
      cleanAns = cleanAns.replace(/^[{\["'\s]+|[}\]"'\s]+$/g, '');
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
        expEl.innerHTML = `💡 <b>Why:</b> ${cleanExp}`;
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
      const toggleAutosolve = document.getElementById('sl-toggle-autosolve');
      const settingsToggle = document.getElementById('sl-settings-toggle');
      const minimizeBtn = document.getElementById('sl-minimize-btn');
      const apiKeyInput = document.getElementById('sl-api-key-input');
      const inlineKeyInput = document.getElementById('sl-inline-key-input');
      const inlineSaveBtn = document.getElementById('sl-inline-save-key-btn');
      const testKeyBtn = document.getElementById('sl-test-key-btn');
      const modelSelect = document.getElementById('sl-model-select');
      const customModelInput = document.getElementById('sl-custom-model-input');
      const customModelGroup = document.getElementById('sl-custom-model-group');
      const warningCard = document.getElementById('sl-api-warning-card');
      const drawer = document.getElementById('sl-settings-drawer');

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

      const handleKeySave = (newKey) => {
        this.settings.apiKey = newKey.trim();
        if (apiKeyInput) apiKeyInput.value = this.settings.apiKey;
        if (inlineKeyInput) inlineKeyInput.value = this.settings.apiKey;
        this.saveSettings();

        if (this.settings.apiKey.length > 5) {
          if (warningCard) warningCard.style.display = 'none';
          if (drawer) drawer.classList.remove('open');
          this.log('✓ API Key saved! Ready to scan.', 'success');
          this.playChime('success');
        }
      };

      inlineSaveBtn?.addEventListener('click', () => {
        if (inlineKeyInput) handleKeySave(inlineKeyInput.value);
      });

      inlineKeyInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleKeySave(inlineKeyInput.value);
      });

      inlineKeyInput?.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 15) handleKeySave(e.target.value);
      });

      apiKeyInput?.addEventListener('change', (e) => {
        handleKeySave(e.target.value);
      });

      apiKeyInput?.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 15) handleKeySave(e.target.value);
      });

      testKeyBtn?.addEventListener('click', async () => {
        if (!this.settings.apiKey) {
          this.log('Please enter an API key first.', 'error');
          return;
        }
        this.log('Testing OpenRouter connection...', 'highlight');
        try {
          const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: { Authorization: `Bearer ${this.settings.apiKey}` }
          });
          if (res.ok) {
            const data = await res.json();
            const label = data.data && data.data.label ? ` (${data.data.label})` : '';
            this.log(`✓ Connected to OpenRouter!${label}`, 'success');
            this.playChime('success');
          } else {
            this.log(`Invalid Key: HTTP ${res.status}`, 'error');
            this.playChime('error');
          }
        } catch (err) {
          this.log(`Connection error: ${err.message}`, 'error');
          this.playChime('error');
        }
      });

      solveBtn?.addEventListener('click', () => {
        if (this.callbacks.onSolve) this.callbacks.onSolve();
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

      modelSelect?.addEventListener('change', (e) => {
        const val = e.target.value;
        this.settings.selectedModel = val;
        customModelGroup.style.display = val === 'custom' ? 'flex' : 'none';
        document.getElementById('sl-active-model-badge').innerText = this.getShortModelName(val === 'custom' ? this.settings.customModel : val);
        this.saveSettings();
      });

      customModelInput?.addEventListener('change', (e) => {
        this.settings.customModel = e.target.value.trim();
        if (this.settings.selectedModel === 'custom') {
          document.getElementById('sl-active-model-badge').innerText = this.getShortModelName(this.settings.customModel);
        }
        this.saveSettings();
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
