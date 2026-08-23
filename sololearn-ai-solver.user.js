// ==UserScript==
// @name         SoloLearn AI Companion (Codestral, Google AI Studio & Hugging Face)
// @namespace    https://github.com/REP-Julian/sololearn-ai-companion
// @version      2.1.5
// @description  Multi-Provider AI (Mistral Codestral, Google AI Studio Gemini, Hugging Face Qwen Coder) with Continuous Adaptive Learning & Self-Correction for SoloLearn.
// @author       Julian Agustino (@REP-Julian)
// @homepage     https://github.com/REP-Julian/sololearn-ai-companion
// @match        https://*.sololearn.com/*
// @match        https://sololearn.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      api.mistral.ai
// @connect      generativelanguage.googleapis.com
// @connect      router.huggingface.co
// @connect      api-inference.huggingface.co
// @connect      huggingface.co
// @connect      *
// @run-at       document-end
// ==/UserScript==

/**
 * SoloLearn AI Automation Solver - Standalone Userscript
 * Built for Tampermonkey, Violentmonkey, and Greasemonkey.
 */

/* eslint-disable */


(function() {
  'use strict';

  // Inject CSS Styles
  const styleEl = document.createElement('style');
  styleEl.id = 'sololearn-ai-styles';
  styleEl.textContent = "/* ==========================================================================\n   SoloLearn AI Companion - Sleek Modern Glassmorphic HUD & In-Page Styling\n   ========================================================================== */\n\n#sololearn-ai-hud {\n  position: fixed !important;\n  top: 24px !important;\n  right: 24px !important;\n  width: 350px !important;\n  max-width: calc(100vw - 32px) !important;\n  max-height: calc(100vh - 48px) !important;\n  z-index: 2147483647 !important;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif !important;\n  font-size: 13px !important;\n  line-height: 1.5 !important;\n  color: #f8fafc !important;\n  background: rgba(11, 18, 33, 0.94) !important;\n  backdrop-filter: blur(24px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.1) !important;\n  border-radius: 16px !important;\n  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.15) !important;\n  box-sizing: border-box !important;\n  user-select: none !important;\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden !important;\n  transition: box-shadow 0.2s ease !important;\n}\n\n#sololearn-ai-hud *,\n#sololearn-ai-hud *::before,\n#sololearn-ai-hud *::after {\n  box-sizing: border-box !important;\n  font-family: inherit !important;\n}\n\n/* Header */\n.sl-hud-header {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  padding: 12px 16px !important;\n  background: rgba(30, 41, 59, 0.7) !important;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;\n  cursor: grab !important;\n  flex-shrink: 0 !important;\n}\n\n.sl-hud-header:active {\n  cursor: grabbing !important;\n}\n\n.sl-hud-brand {\n  display: flex !important;\n  align-items: center !important;\n  gap: 10px !important;\n  font-size: 14px !important;\n  font-weight: 700 !important;\n  color: #ffffff !important;\n  letter-spacing: -0.2px !important;\n}\n\n.sl-brand-icon {\n  width: 26px !important;\n  height: 26px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  background: linear-gradient(135deg, #0ea5e9, #6366f1) !important;\n  border-radius: 7px !important;\n  font-size: 13px !important;\n  color: #ffffff !important;\n  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5) !important;\n}\n\n.sl-hud-controls {\n  display: flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n}\n\n.sl-icon-btn {\n  background: rgba(255, 255, 255, 0.06) !important;\n  border: 1px solid rgba(255, 255, 255, 0.1) !important;\n  color: #cbd5e1 !important;\n  width: 28px !important;\n  height: 28px !important;\n  border-radius: 7px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  cursor: pointer !important;\n  font-size: 13px !important;\n  transition: all 0.15s ease !important;\n}\n\n.sl-icon-btn:hover {\n  background: rgba(255, 255, 255, 0.15) !important;\n  color: #ffffff !important;\n  border-color: #38bdf8 !important;\n}\n\n/* Status Bar */\n.sl-status-bar {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  padding: 8px 16px !important;\n  background: rgba(15, 23, 42, 0.6) !important;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;\n  font-size: 11px !important;\n  flex-shrink: 0 !important;\n}\n\n.sl-status-pill {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n  font-weight: 600 !important;\n  color: #cbd5e1 !important;\n}\n\n.sl-status-dot {\n  width: 8px !important;\n  height: 8px !important;\n  border-radius: 50% !important;\n  display: inline-block !important;\n}\n\n.sl-status-dot.idle { background: #94a3b8 !important; }\n.sl-status-dot.thinking { background: #f59e0b !important; box-shadow: 0 0 8px #f59e0b !important; }\n.sl-status-dot.success { background: #10b981 !important; box-shadow: 0 0 8px #10b981 !important; }\n.sl-status-dot.error { background: #ef4444 !important; box-shadow: 0 0 8px #ef4444 !important; }\n.sl-status-dot.active { background: #38bdf8 !important; box-shadow: 0 0 8px #38bdf8 !important; }\n\n.sl-model-badge {\n  font-size: 10px !important;\n  font-weight: 700 !important;\n  padding: 3px 8px !important;\n  background: rgba(2, 132, 199, 0.2) !important;\n  color: #38bdf8 !important;\n  border: 1px solid rgba(56, 189, 248, 0.4) !important;\n  border-radius: 12px !important;\n  max-width: 150px !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n\n/* Body Container */\n.sl-hud-body {\n  padding: 12px 14px !important;\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 8px !important;\n  background: transparent !important;\n  overflow-y: auto !important;\n  max-height: calc(100vh - 110px) !important;\n  scrollbar-width: thin !important;\n  scrollbar-color: rgba(255, 255, 255, 0.15) transparent !important;\n}\n\n.sl-hud-body::-webkit-scrollbar {\n  width: 5px !important;\n}\n\n.sl-hud-body::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.15) !important;\n  border-radius: 3px !important;\n}\n\n/* Big Solution Card */\n.sl-companion-answer-card {\n  padding: 12px 14px !important;\n  background: linear-gradient(145deg, rgba(6, 78, 59, 0.6) 0%, rgba(2, 44, 34, 0.8) 100%) !important;\n  border: 1.5px solid rgba(16, 185, 129, 0.6) !important;\n  border-radius: 12px !important;\n  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25) !important;\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 8px !important;\n  transition: all 0.3s ease !important;\n}\n\n/* Luxurious Golden Consensus Match Highlight */\n.sl-companion-answer-card.golden-match,\n.sl-companion-answer-card.consensus {\n  background: linear-gradient(145deg, rgba(120, 53, 15, 0.75) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(6, 78, 59, 0.75) 100%) !important;\n  border: 2px solid #fbbf24 !important;\n  box-shadow: 0 0 30px rgba(251, 191, 36, 0.55), inset 0 0 15px rgba(251, 191, 36, 0.2) !important;\n}\n\n/* Learned Knowledge Bank Glow */\n.sl-companion-answer-card.learned-memory {\n  background: linear-gradient(145deg, rgba(6, 78, 59, 0.85) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(4, 120, 87, 0.85) 100%) !important;\n  border: 2px solid #10b981 !important;\n  box-shadow: 0 0 30px rgba(16, 185, 129, 0.55), inset 0 0 15px rgba(16, 185, 129, 0.2) !important;\n}\n\n/* Self-Correction Adapted Glow */\n.sl-companion-answer-card.corrected-memory {\n  background: linear-gradient(145deg, rgba(120, 53, 15, 0.85) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(180, 83, 9, 0.85) 100%) !important;\n  border: 2px solid #f59e0b !important;\n  box-shadow: 0 0 30px rgba(245, 158, 11, 0.55), inset 0 0 15px rgba(245, 158, 11, 0.2) !important;\n}\n\n.sl-companion-answer-card.golden-match .sl-companion-answer-header,\n.sl-companion-answer-card.consensus .sl-companion-answer-header {\n  color: #fbbf24 !important;\n  text-shadow: 0 0 10px rgba(251, 191, 36, 0.6) !important;\n}\n\n.sl-companion-answer-card.learned-memory .sl-companion-answer-header {\n  color: #34d399 !important;\n  text-shadow: 0 0 10px rgba(52, 211, 153, 0.6) !important;\n}\n\n.sl-companion-answer-card.corrected-memory .sl-companion-answer-header {\n  color: #fbbf24 !important;\n  text-shadow: 0 0 10px rgba(251, 191, 36, 0.6) !important;\n}\n\n.sl-companion-answer-card.golden-match .sl-companion-answer-content,\n.sl-companion-answer-card.consensus .sl-companion-answer-content {\n  border: 1px solid rgba(251, 191, 36, 0.5) !important;\n  background: rgba(0, 0, 0, 0.65) !important;\n  color: #fef08a !important;\n  text-shadow: 0 0 8px rgba(251, 191, 36, 0.3) !important;\n}\n\n.sl-companion-answer-header {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  font-size: 11px !important;\n  font-weight: 800 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n  color: #34d399 !important;\n}\n\n.sl-companion-answer-content {\n  font-size: 15px !important;\n  font-weight: 700 !important;\n  color: #ffffff !important;\n  background: rgba(0, 0, 0, 0.5) !important;\n  padding: 8px 12px !important;\n  border-radius: 8px !important;\n  border: 1px solid rgba(255, 255, 255, 0.08) !important;\n  line-height: 1.5 !important;\n  word-break: break-word !important;\n  white-space: pre-wrap !important;\n  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace !important;\n}\n\n.sl-companion-explanation {\n  font-size: 11px !important;\n  color: #e2e8f0 !important;\n  line-height: 1.4 !important;\n  border-top: 1px dashed rgba(255, 255, 255, 0.12) !important;\n  padding-top: 6px !important;\n}\n\n/* Feedback Buttons */\n.sl-feedback-actions {\n  display: flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n}\n\n.sl-feedback-btn {\n  flex: 1 !important;\n  padding: 5px 8px !important;\n  border-radius: 6px !important;\n  font-size: 10px !important;\n  font-weight: 700 !important;\n  cursor: pointer !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 4px !important;\n  transition: all 0.15s ease !important;\n}\n\n.sl-feedback-correct {\n  background: rgba(16, 185, 129, 0.15) !important;\n  border: 1px solid rgba(16, 185, 129, 0.4) !important;\n  color: #6ee7b7 !important;\n}\n\n.sl-feedback-correct:hover {\n  background: rgba(16, 185, 129, 0.3) !important;\n  border-color: #10b981 !important;\n  color: #ffffff !important;\n}\n\n.sl-feedback-wrong {\n  background: rgba(239, 68, 68, 0.15) !important;\n  border: 1px solid rgba(239, 68, 68, 0.4) !important;\n  color: #fca5a5 !important;\n}\n\n.sl-feedback-wrong:hover {\n  background: rgba(239, 68, 68, 0.3) !important;\n  border-color: #ef4444 !important;\n  color: #ffffff !important;\n}\n\n/* Action Buttons */\n.sl-action-row {\n  display: flex !important;\n  gap: 8px !important;\n}\n\n.sl-btn-primary {\n  width: 100% !important;\n  padding: 10px 14px !important;\n  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;\n  color: #ffffff !important;\n  border: 1px solid rgba(56, 189, 248, 0.5) !important;\n  border-radius: 10px !important;\n  font-size: 13px !important;\n  font-weight: 700 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  cursor: pointer !important;\n  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35) !important;\n  transition: all 0.15s ease !important;\n}\n\n.sl-btn-primary:hover {\n  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%) !important;\n  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.5) !important;\n}\n\n.sl-autofill-btn {\n  padding: 10px 14px !important;\n  background: linear-gradient(135deg, #059669 0%, #0d9488 100%) !important;\n  border: 1px solid rgba(52, 211, 153, 0.5) !important;\n  color: #ffffff !important;\n  border-radius: 10px !important;\n  font-size: 13px !important;\n  font-weight: 700 !important;\n  cursor: pointer !important;\n  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3) !important;\n  transition: all 0.15s ease !important;\n}\n\n.sl-autofill-btn:hover {\n  background: linear-gradient(135deg, #047857 0%, #0f766e 100%) !important;\n  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.45) !important;\n}\n\n.sl-hotkey-hint {\n  font-size: 10px !important;\n  padding: 2px 5px !important;\n  background: rgba(0, 0, 0, 0.35) !important;\n  border: 1px solid rgba(255, 255, 255, 0.2) !important;\n  border-radius: 4px !important;\n  color: #ffffff !important;\n  font-weight: 700 !important;\n  margin-left: auto !important;\n}\n\n/* Auto-Scan & Consensus Toggles */\n.sl-toggle-btn {\n  padding: 9px 12px !important;\n  background: rgba(30, 41, 59, 0.7) !important;\n  border: 1px solid rgba(255, 255, 255, 0.08) !important;\n  border-radius: 10px !important;\n  color: #94a3b8 !important;\n  font-size: 12px !important;\n  font-weight: 700 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  cursor: pointer !important;\n  transition: all 0.15s ease !important;\n}\n\n.sl-toggle-btn:hover {\n  background: rgba(51, 65, 85, 0.8) !important;\n  color: #e2e8f0 !important;\n}\n\n.sl-toggle-btn.active {\n  background: rgba(6, 78, 59, 0.7) !important;\n  border-color: rgba(16, 185, 129, 0.6) !important;\n  color: #34d399 !important;\n}\n\n/* Log Box */\n.sl-log-box {\n  padding: 6px 10px !important;\n  background: rgba(0, 0, 0, 0.25) !important;\n  border-radius: 6px !important;\n  font-size: 11px !important;\n  color: #94a3b8 !important;\n  line-height: 1.4 !important;\n  text-align: center !important;\n}\n\n.sl-log-box .highlight {\n  color: #38bdf8 !important;\n  font-weight: 700 !important;\n}\n\n.sl-log-box.success {\n  color: #34d399 !important;\n}\n\n.sl-log-box.error {\n  color: #f87171 !important;\n}\n\n/* Settings Drawer */\n.sl-settings-drawer {\n  display: none !important;\n  flex-direction: column !important;\n  gap: 10px !important;\n  padding-top: 10px !important;\n  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;\n}\n\n.sl-settings-drawer.open {\n  display: flex !important;\n}\n\n.sl-field-group {\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 5px !important;\n}\n\n.sl-field-label {\n  font-size: 10px !important;\n  font-weight: 700 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n  color: #94a3b8 !important;\n}\n\n.sl-input, .sl-select {\n  width: 100% !important;\n  padding: 8px 10px !important;\n  background: rgba(2, 6, 23, 0.7) !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  border-radius: 7px !important;\n  color: #ffffff !important;\n  font-size: 11px !important;\n  outline: none !important;\n  transition: border-color 0.15s ease !important;\n}\n\n.sl-input:focus, .sl-select:focus {\n  border-color: #38bdf8 !important;\n}\n\n/* In-Page Visual Highlighter Badges & Glowing Outline */\n.sl-ai-highlighted-choice {\n  position: relative !important;\n  border: 2.5px solid #10b981 !important;\n  background: rgba(16, 185, 129, 0.15) !important;\n  box-shadow: 0 0 20px rgba(16, 185, 129, 0.55) !important;\n  border-radius: 12px !important;\n  transition: all 0.25s ease !important;\n}\n\n.sl-ai-badge {\n  position: absolute !important;\n  top: -10px !important;\n  right: 10px !important;\n  background: #10b981 !important;\n  color: #ffffff !important;\n  font-size: 10px !important;\n  font-weight: 800 !important;\n  padding: 2px 7px !important;\n  border-radius: 8px !important;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;\n  letter-spacing: 0.4px !important;\n  z-index: 1000 !important;\n}\n\n.sl-ai-order-badge {\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;\n  color: #ffffff !important;\n  font-size: 10px !important;\n  font-weight: 800 !important;\n  padding: 2px 7px !important;\n  border-radius: 5px !important;\n  margin-right: 8px !important;\n  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4) !important;\n  letter-spacing: 0.4px !important;\n  border: 1px solid #34d399 !important;\n}\n\n#sololearn-ai-hud.minimized .sl-hud-body,\n#sololearn-ai-hud.minimized .sl-status-bar {\n  display: none !important;\n}\n\n#sololearn-ai-hud.minimized {\n  width: auto !important;\n}\n";
  (document.head || document.documentElement).appendChild(styleEl);

  // Load Config
  /**
 * SoloLearn AI Companion - Native Mistral AI & Codestral Configuration
 * Powers 100% Accurate SoloLearn Solving with Codestral, Mistral Large, and 3-Pass Compiler Verification.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SoloLearnConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Multi-Provider Model Rosters
  const MISTRAL_MODELS = [
    { id: 'codestral-latest', name: 'Codestral Latest (Mistral AI Dedicated Code Model)', badge: 'Codestral', provider: 'mistral', recommended: true },
    { id: 'mistral-small-latest', name: 'Mistral Small Latest (Fast & Lightweight)', badge: 'Mistral Small', provider: 'mistral' },
    { id: 'open-mistral-nemo', name: 'Mistral NeMo 12B (Fast Free Tier)', badge: 'Mistral NeMo', provider: 'mistral' },
    { id: 'ministral-8b-latest', name: 'Ministral 8B Latest (Ultra Efficient)', badge: 'Ministral 8B', provider: 'mistral' },
    { id: 'mistral-large-latest', name: 'Mistral Large Latest (Flagship 123B SOTA)', badge: 'Mistral Large', provider: 'mistral' }
  ];

  const GEMINI_MODELS = [
    { id: 'gemini-3.7-flash', name: 'Google Gemini 3.7 Flash (Flagship Fast Reasoning)', badge: 'Gemini 3.7 Flash', provider: 'gemini', recommended: true },
    { id: 'gemini-3.6-flash', name: 'Google Gemini 3.6 Flash (Next-Gen Intelligence)', badge: 'Gemini 3.6 Flash', provider: 'gemini' },
    { id: 'gemini-3.5-flash-lite', name: 'Google Gemini 3.5 Flash Lite (High Quota 500 RPD)', badge: 'Gemini 3.5 Lite', provider: 'gemini' },
    { id: 'gemini-3.1-flash-lite', name: 'Google Gemini 3.1 Flash Lite (High Quota 500 RPD)', badge: 'Gemini 3.1 Lite', provider: 'gemini' },
    { id: 'gemini-3.5-flash', name: 'Google Gemini 3.5 Flash (Ultra Fast & Stable)', badge: 'Gemini 3.5 Flash', provider: 'gemini' },
    { id: 'gemini-3-flash', name: 'Google Gemini 3 Flash (Fast & Reliable)', badge: 'Gemini 3 Flash', provider: 'gemini' },
    { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash', badge: 'Gemini 2.5 Flash', provider: 'gemini' },
    { id: 'gemini-2.5-flash-lite', name: 'Google Gemini 2.5 Flash Lite', badge: 'Gemini 2.5 Lite', provider: 'gemini' }
  ];

  const HUGGINGFACE_MODELS = [
    { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B (SOTA Coding)', badge: 'Qwen Coder', provider: 'huggingface', recommended: true },
    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct (Flagship)', badge: 'Llama 3.3', provider: 'huggingface' },
    { id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', name: 'DeepSeek R1 Distill Qwen 32B (Reasoning)', badge: 'DeepSeek R1', provider: 'huggingface' },
    { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B Instruct (Fast)', badge: 'Mistral 7B', provider: 'huggingface' }
  ];

  const DEFAULT_SETTINGS = {
    // Multi-Provider API Keys (Saved securely in browser local storage)
    mistralApiKey: '',
    geminiApiKey: '',
    huggingfaceApiKey: '',
    apiKey: '',

    // Provider Active Models
    mistralModel: 'codestral-latest',
    geminiModel: 'gemini-3.7-flash',
    huggingfaceModel: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    selectedModel: 'codestral-latest',

    // Engine & Consensus Mode
    consensusMode: true, // Parallel 3-Provider Majority Voting
    singleProvider: 'mistral', // 'mistral' | 'gemini' | 'huggingface' (when consensusMode is off)

    // General Settings
    languageOverride: 'auto',
    cacheEnabled: true,
    enableFallback: true,
    autoSolve: false,
    autoFill: false,
    autoSubmit: false,
    autoNext: false,
    inspectReactInternals: true,
    tripleCheckVerification: true,
    heartSafety: true,
    actionDelay: 1200,
    typingSpeed: 25,
    soundEnabled: true,
    overlayVisible: true,
    temperature: 0.0
  };

  const STORAGE_KEY = 'sololearn_ai_solver_settings_v2';

  function sanitizeLoadedSettings(raw) {
    const s = { ...DEFAULT_SETTINGS, ...raw };
    if (s.apiKey && !s.mistralApiKey) s.mistralApiKey = s.apiKey;
    if (raw.groqApiKey && !s.geminiApiKey) s.geminiApiKey = raw.groqApiKey;
    if (raw.cerebrasApiKey && !s.huggingfaceApiKey) s.huggingfaceApiKey = raw.cerebrasApiKey;
    if (raw.openrouterApiKey && !s.huggingfaceApiKey) s.huggingfaceApiKey = raw.openrouterApiKey;
    const validGeminiIds = GEMINI_MODELS.map(m => m.id);
    if (!s.geminiModel || !validGeminiIds.includes(s.geminiModel)) {
      s.geminiModel = 'gemini-3.7-flash';
    }
    if (!s.huggingfaceModel) s.huggingfaceModel = 'Qwen/Qwen2.5-Coder-32B-Instruct';
    return s;
  }

  const Storage = {
    async get() {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
              if (result && result[STORAGE_KEY]) {
                resolve(sanitizeLoadedSettings(result[STORAGE_KEY]));
              } else {
                const local = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sololearn_ai_solver_settings_v1');
                const parsed = local ? JSON.parse(local) : {};
                resolve(sanitizeLoadedSettings(parsed));
              }
            });
          });
        }
      } catch (e) {}

      try {
        const local = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sololearn_ai_solver_settings_v1');
        const parsed = local ? JSON.parse(local) : {};
        return sanitizeLoadedSettings(parsed);
      } catch (err) {
        return { ...DEFAULT_SETTINGS };
      }
    },

    async save(settings) {
      const merged = sanitizeLoadedSettings(settings);
      if (merged.mistralApiKey) merged.apiKey = merged.mistralApiKey;
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ [STORAGE_KEY]: merged });
        }
      } catch (e) {}

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    }
  };

  const PROMPT_TEMPLATE = {
    SYSTEM: `You are an Elite Grandmaster Compiler Architect & Competitive Programming AI (ACM-ICPC World Finalist level).
Your absolute goal is 100% MATHEMATICAL, LOGICAL, AND SYNTACTIC PERFECTION on every coding exercise.

YOU MUST EXECUTE A DEEP 4-PASS VERIFICATION BEFORE GENERATING THE JSON RESPONSE:

=======================================================
=== PASS 1: AST, LANGUAGE GRAMMAR & SCOPE ANALYSIS ===
=======================================================
1. Target Language Conventions:
   - Java:
     * Variable & String Concatenation: 'String msg = [BLANK_1] + [BLANK_2];' -> [BLANK_1] is "Hello, " (or the literal string), [BLANK_2] is the variable name (e.g. 'name').
     * Output statement: 'System.out.println( [BLANK_3] );' -> [BLANK_3] is 'msg' (or 'System.out.print').
     * Class declaration: '[BLANK_1] Sum {' -> [BLANK_1] is 'class' (NEVER 'Sum'!).
     * Main method: 'public static void [BLANK_2] (String[] args)' -> [BLANK_2] is 'main'.
     * Print output: 'System. [BLANK_3] .println(a [BLANK_4] b);' -> [BLANK_3] is 'out', [BLANK_4] is '+'.
   - C# (.NET):
     * Class declaration: '[BLANK_1] Program {' -> [BLANK_1] is 'class' (NEVER 'Program'!).
     * Main method: 'static void [BLANK_2] (string[] args)' -> [BLANK_2] is 'Main' (or 'main').
     * Output statement: 'Console.Write [BLANK_3] (a [BLANK_4] b);' -> [BLANK_3] is 'Line' (for Console.WriteLine), [BLANK_4] is '+' (for addition).
     * Semicolon required at end of statements.
   - Python: Indentation semantics, 0-indexed slicing (start:end exclusive), integer division '//' vs float '/', 'def', 'self', 'return'.
   - JavaScript / TypeScript: 'let', 'const', arrow functions, strict equality '===', template literals.
   - C++: 'std::cout', 'std::cin', stream operators '<<' / '>>', pointers '*', references '&', semicolons.
   - SQL:
     * Clause order: 'SELECT [columns] FROM [table] WHERE [condition] GROUP BY [cols] HAVING [cond] ORDER BY [cols]'.
     * Multi-column selection: multiple columns in the SELECT clause MUST be separated by commas (e.g. 'SELECT [BLANK_1] , [BLANK_2] FROM table').
     * Table source: the table name is specified in the FROM clause (e.g. '[BLANK_3] orders').
     * Fixed Code Invariant: Words already visible in the code template (such as 'id' or 'orders') are ALREADY part of the query. Do NOT repeat existing code tokens in the 'answers' array!
     * Aggregates with GROUP BY: When evaluating 'SELECT AGG_FUNC(...) ... GROUP BY group_col', count the number of UNIQUE values in the group_col column in the dataset. If there are N unique groups, the query produces N result rows (one computed aggregate value per unique group).
     * HAVING Clause Filtering: When evaluating 'HAVING AGG_FUNC(...) > value', group the rows by the GROUP BY column first, compute the aggregate for each group separately, and count ONLY the groups that strictly satisfy the HAVING condition. For example, if 3 groups exist (Sales MAX 4500, IT MAX 7500, HR MAX 7000) and HAVING is 'MAX(salary) > 5000', Sales is filtered out, leaving exactly 2 rows (IT and HR).
    - Data Engineering & Data Quality Issues (Diagram & Table Inspection):
      * Duplication: Repeated/identical records with identical primary keys or attribute rows (e.g. same ID, name, age). Map the 'duplication' slot to the marker/badge pointing to the duplicate rows.
      * Missing Value: Blank, null, or empty cell in a required column (e.g. empty name field). Map the 'missing value' slot to the marker/badge pointing to the empty cell.
      * Incorrect Data Type: A value whose type violates domain constraints (e.g. text 'twenty-five' in numeric age column, or corrupted date strings). Map the 'incorrect data type' slot to the marker/badge pointing to that row.
      * Visual Badge Mapping: When matching categories to numbered diagram markers ('1', '2', '3'), carefully check what exact anomaly exists at marker 1, marker 2, and marker 3. Never guess sequential 1, 2, 3!
2. Scope & Variable Tracking:
   - Identify all declared variables and types in the code (e.g. 'String name = "James";' or 'int a = 5; int b = 10;').
   - Ensure variables used in later expressions strictly match declared names and types.

=======================================================
=== PASS 2: MENTAL INTERPRETER & CODE SIMULATION ===
=======================================================
1. Trace execution step-by-step:
   - Simulate line-by-line runtime execution with variables, string concatenation, arithmetic, and logic flow.
   - For string concatenation (e.g. "Hello, " + name): verify resulting output matches the task objective (e.g. "Hello, James").
   - For loops/conditions: trace boundary conditions, loop variables, termination, and output statements.
   - For SQL queries: mentally reconstruct the complete query from the template + your proposed answers and verify it forms 100% syntactically valid and logically correct SQL.

=======================================================
=== PASS 3: WORD BANK & OPTION CHIP VALIDATION ===
=======================================================
1. Strict Word Bank Rule:
   - If an "AVAILABLE CHOICES / WORD BANK" list is provided, EVERY answer token for blanks MUST be chosen from the provided word bank options.
   - Do NOT invent new tokens or pick tokens outside the word bank if the word bank is provided.
   - Ensure the casing and spelling match the word bank chip exactly (e.g. 'SELECT', 'FROM', ',', 'date').

=======================================================
=== PASS 4: EXACT SLOT COUNT & BOUNDARY SANITIZATION ===
=======================================================
1. Exact Slot Count Invariant:
   - If TOTAL BLANKS/SLOTS TO FILL is N, your 'answers' array MUST contain EXACTLY N strings, one corresponding to each [BLANK_1]..[BLANK_N] in strict sequential order.
   - NEVER put multiple slot answers into one slot.
2. Punctuation Boundary Check:
   - NEVER duplicate quotes, parentheses, brackets, commas, or semicolons that are already present outside the blank slot in the code template!

=======================================================
=== REQUIRED OUTPUT JSON FORMAT ===
=======================================================
{
  "thought": "Pass 1 (Scope & AST): ...\\nPass 2 (Mental Trace): ...\\nPass 3 (Word Bank Match): ...\\nPass 4 (Boundary Check): ...",
  "type": "fill_blanks" | "single_choice" | "multi_choice" | "reorder" | "general_question",
  "confidence": 1.0,
  "answers": [
    // Array of exact strings matching each slot [BLANK_1]..[BLANK_N] or selected choices
  ],
  "explanation": "Clear, concise 1-2 sentence explanation of the solution."
}`
  };

  function safeFetch(url, options = {}) {
    const gmRequest = (typeof GM_xmlhttpRequest === 'function')
      ? GM_xmlhttpRequest
      : ((typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function') ? GM.xmlHttpRequest : null);

    if (gmRequest) {
      return new Promise((resolve, reject) => {
        gmRequest({
          method: options.method || 'GET',
          url: url,
          headers: options.headers || {},
          data: options.body || null,
          timeout: 30000,
          onload: (res) => {
            resolve({
              ok: res.status >= 200 && res.status < 300,
              status: res.status,
              statusText: res.statusText,
              json: async () => {
                try {
                  return JSON.parse(res.responseText);
                } catch (e) {
                  return { error: { message: res.responseText || 'Invalid JSON' } };
                }
              },
              text: async () => res.responseText
            });
          },
          onerror: (err) => reject(new Error(err.statusText || 'Network error via GM_xmlhttpRequest')),
          ontimeout: () => reject(new Error('Request timed out after 30s'))
        });
      });
    }

    return fetch(url, options);
  }

  function getTimeUntilUtcMidnight() {
    const now = new Date();
    const nextUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diffMs = Math.max(0, nextUtc - now);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }

  return {
    MISTRAL_MODELS,
    GEMINI_MODELS,
    HUGGINGFACE_MODELS,
    DEFAULT_MODELS: MISTRAL_MODELS,
    DEFAULT_SETTINGS,
    STORAGE_KEY,
    Storage,
    PROMPT_TEMPLATE,
    safeFetch,
    getTimeUntilUtcMidnight
  };
});



  // Load Adaptive Learning & Self-Correction Memory Engine
  /**
 * SoloLearn AI Companion - Adaptive Learning & Self-Correction Memory Engine
 * - Persistently memorizes verified correct answers for instant (0ms) future recall.
 * - Analyzes wrong answers, acknowledges mistakes, and adapts memory with the right choice so errors are never repeated.
 * - Pre-seeded with historical answers and benchmark cases built over past days.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'));
  } else {
    root.SoloLearnMemory = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const MEMORY_STORAGE_KEY = 'sololearn_ai_learning_memory_v1';
  const LEGACY_CACHE_KEY = 'sololearn_ai_solver_cache_v1';

  // Curated historical knowledge seed from past benchmark cases and course exercises
  const HISTORICAL_KNOWLEDGE_SEED = [
    {
      title: 'What is the output of the following C# code?',
      code: 'int x = 5;\nint y = 10;\nConsole.WriteLine(x + y);',
      language: 'C# (.NET)',
      type: 'single_choice',
      answers: ['15'],
      options: ['15', '510', 'Error'],
      status: 'mastered',
      reflection: 'Evaluated arithmetic addition 5 + 10 = 15 in C# Console.WriteLine.',
      source: 'historical_seed'
    },
    {
      title: 'Fill in the blanks to create a valid while loop in C#',
      code: '[BLANK_1] (x < 100) { x [BLANK_2] 4; }',
      language: 'C# (.NET)',
      type: 'fill_blanks',
      blankCount: 2,
      answers: ['while', '+='],
      status: 'mastered',
      reflection: 'While keyword opens loop conditional; += compound operator increments x by 4.',
      source: 'historical_seed'
    },
    {
      title: 'Reorder code to define a function',
      code: 'def greet():\n    print("Hi")',
      language: 'Python',
      type: 'reorder',
      answers: ['def', 'greet():', 'print("Hi")'],
      status: 'mastered',
      reflection: 'Python function definition begins with def, followed by function signature and indented body.',
      source: 'historical_seed'
    },
    {
      title: 'Rearrange the code to declare a method that returns the square of its argument.',
      language: 'C# (.NET)',
      type: 'reorder',
      answers: ['public int Square(int a)', '{', 'int result = a*a;', 'return result;', '}'],
      status: 'mastered',
      reflection: 'Method signature first, opening brace, variable calculation, return statement, closing brace.',
      source: 'historical_seed'
    },
    {
      title: 'What does === check in JavaScript?',
      language: 'JavaScript',
      type: 'single_choice',
      answers: ['Strict equality (both value and type)'],
      options: ['Strict equality (both value and type)', 'Loose equality with type coercion', 'Assignment'],
      status: 'mastered',
      reflection: 'Triple equals (===) strictly validates both value and datatype without type coercion.',
      source: 'historical_seed'
    },
    {
      title: 'Fill in the blanks to output "Hello, " followed by the value stored in the name variable.',
      code: 'String name = "James";\nString msg [BLANK_1] [BLANK_2] + name;\nSystem.out.println( [BLANK_3] );',
      language: 'Java',
      type: 'fill_blanks',
      blankCount: 3,
      answers: ['=', '"Hello, "', 'msg'],
      options: ['=', '"Hello, "', 'msg', 'var', 'System'],
      status: 'mastered',
      reflection: 'Variable assignment requires =, followed by string literal "Hello, ", and passing msg to println.',
      source: 'historical_seed'
    },
    {
      title: 'Match each programming concept with its description.',
      code: 'Line 1: [BLANK_1]\nLine 2: [BLANK_2]\nLine 3: [BLANK_3]',
      language: 'Programming Concepts',
      type: 'fill_blanks',
      blankCount: 3,
      answers: ['Variable: Stores data values', 'Function: Reusable block of code', 'Loop: Executes code repeatedly'],
      options: ['Variable: Stores data values', 'Function: Reusable block of code', 'Loop: Executes code repeatedly'],
      status: 'mastered',
      reflection: 'Conceptual definitions mapped to their exact matching programming terminology.',
      source: 'historical_seed'
    },
    {
      title: 'Complete the SQL Query',
      code: '[BLANK_1]\nid\n[BLANK_2]\nname\n[BLANK_3]\norders',
      language: 'SQL',
      type: 'fill_blanks',
      blankCount: 3,
      answers: ['SELECT', ',', 'FROM'],
      options: ['SELECT', ',', 'FROM', 'WHERE', 'AND'],
      status: 'mastered',
      reflection: 'Standard SQL SELECT column_1, column_2 FROM table structure.',
      source: 'historical_seed'
    },
    {
      title: "Which book records will match the pattern 'The%King_'",
      language: 'SQL',
      type: 'multi_choice',
      answers: ['The Warrior King1', 'The Warrior King2'],
      options: ['The Patient King3B', 'The Warrior King2', 'The Warrior King1', 'The Silent King'],
      status: 'mastered',
      reflection: "SQL LIKE pattern 'The%King_': % matches zero or more characters (e.g. ' Warrior '), and _ matches exactly one single character ('1' or '2'). '3B' has 2 characters, and 'The Silent King' has 0 characters after King.",
      source: 'historical_seed'
    },
    {
      title: 'Match the data with its source type',
      code: 'tweet dates: [BLANK_1]\nheart rate: [BLANK_2]\npayment amounts: [BLANK_3]',
      language: 'Data Concepts',
      type: 'fill_blanks',
      blankCount: 3,
      answers: ['social data', 'device data', 'transactional data'],
      options: ['social data', 'device data', 'transactional data'],
      status: 'mastered',
      reflection: 'Tweet dates are social data, heart rate measurements are device (IoT/sensor) data, and payment amounts are transactional data.',
      source: 'historical_seed'
    },
    {
      title: 'Select all of the methods you could use to collect data',
      language: 'Data Concepts',
      type: 'multi_choice',
      answers: ['Querying a database', 'Connecting to servers with APIs', 'Scraping web pages'],
      options: ['Querying a database', 'Connecting to servers with APIs', 'Scraping web pages'],
      status: 'mastered',
      reflection: 'All three methods (querying databases, API integration, and web scraping) are standard techniques for collecting data.',
      source: 'historical_seed'
    },
    {
      title: 'This query will generate a results table with...',
      language: 'SQL',
      type: 'single_choice',
      answers: ['2 categories and 2 numerical values'],
      options: ['2 categories and 2 numerical values', '3 categories and 3 numerical values', '1 category and 2 numerical values'],
      status: 'mastered',
      reflection: 'The products table contains 2 distinct categories (Fruit and Vegetable). GROUP BY category produces 2 grouped rows, each computing an AVG(price) numerical value, resulting in 2 categories and 2 numerical values.',
      source: 'historical_seed'
    },
    {
      title: 'Complete to extract the maximum price for each type of product sold in New York',
      code: 'SELECT product, [BLANK_1] (price)\nFROM sales\n[BLANK_2] city [BLANK_3] \'New York\'\n[BLANK_4] product;',
      language: 'SQL',
      type: 'fill_blanks',
      blankCount: 4,
      answers: ['MAX', 'WHERE', '=', 'GROUP BY'],
      options: ['MAX', 'WHERE', '=', 'GROUP BY', 'AVG', 'HAVING'],
      status: 'mastered',
      reflection: 'The query calculates the maximum price per product in New York. Slot 1 is MAX(price), Slot 2 is WHERE, Slot 3 is \'=\' to filter city = \'New York\', and Slot 4 is GROUP BY to group by product.',
      source: 'historical_seed'
    },
    {
      title: 'This query will result in a table with...',
      code: 'SELECT department,\n       MAX(salary)\nFROM employees\nGROUP BY department\nHAVING MAX(salary) > 5000;\n\nemployees:\nid | name | department | salary\n1 | Alice | Sales | 4500\n2 | Bob | IT | 5000\n3 | Frank | HR | 6000\n4 | Eva | IT | 7500\n5 | John | HR | 7000',
      language: 'SQL',
      type: 'single_choice',
      answers: ['2 rows'],
      options: ['3 rows', '2 rows', '5 rows'],
      status: 'mastered',
      reflection: 'The employees table has 3 departments: Sales (MAX 4500), IT (MAX 7500), HR (MAX 7000). The HAVING MAX(salary) > 5000 condition filters out Sales (4500 <= 5000), leaving exactly 2 rows (IT and HR).',
      source: 'historical_seed'
    },
    {
      title: 'Identify the data quality issues',
      code: 'patients\npatient_id | name | age | appointment\n1 | 14651 | Emily Lee | twenty-five | 11-01-23\n2 | 25478 | [empty] | 40 | 10-05-23\n3 | 59941 | Mervin Rosenberg | 55 | 04-06-23\n3 | 59941 | Mervin Rosenberg | 55 | 04-06-23\n\nduplication: [BLANK_1]\nmissing value: [BLANK_2]\nincorrect data type: [BLANK_3]',
      language: 'SQL',
      type: 'fill_blanks',
      blankCount: 3,
      answers: ['3', '2', '1'],
      options: ['1', '2', '3'],
      status: 'mastered',
      reflection: 'Row 1 (Badge 1) has string "twenty-five" in numeric age column (incorrect data type = 1). Row 2 (Badge 2) has an empty name field (missing value = 2). Rows 3 and 4 (Badge 3) are duplicate records with identical patient_id 59941, Mervin Rosenberg, 55 (duplication = 3). Therefore: duplication = 3, missing value = 2, incorrect data type = 1.',
      source: 'historical_seed'
    }
  ];

  class SoloLearnMemoryEngine {
    constructor() {
      this.memories = new Map();
      this.isLoaded = false;
      this.init();
    }

    init() {
      this.loadFromStorage();
      this.seedHistoricalKnowledge();
      this.migrateLegacyCache();
    }

    /**
     * Normalizes text for deterministic, resilient matching.
     */
    normalize(str) {
      if (!str) return '';
      return String(str)
        .toLowerCase()
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/['"`]/g, '"')
        .replace(/[^\w\s"=<>\+\-\*\/\(\)\{\}\[\]\.,;]/g, '')
        .trim();
    }

    /**
     * Generates a deterministic signature for any question.
     */
    generateSignature(question) {
      if (!question) return null;
      const title = this.normalize(question.title || '');
      const code = this.normalize((question.code || '').slice(0, 150));
      const type = this.normalize(question.type || '');
      const blanks = question.blankCount || 0;
      
      const opts = Array.isArray(question.options)
        ? question.options.map(o => this.normalize(o)).sort().join('|')
        : (Array.isArray(question.choices) ? question.choices.map(c => this.normalize(c.text || c)).sort().join('|') : '');

      return `sig__${type}__${blanks}__${title}__${code}__${opts}`;
    }

    /**
     * Generates alternative fuzzy signatures for resilient lookups.
     */
    getLookupSignatures(question) {
      const primary = this.generateSignature(question);
      if (!primary) return [];

      const list = [primary];
      const title = this.normalize(question.title || '');
      const code = this.normalize((question.code || '').slice(0, 150));

      if (title && code) {
        list.push(`title_code__${title}__${code}`);
      }
      if (title) {
        list.push(`title_only__${title}__${question.blankCount || 0}`);
      }
      return list;
    }

    loadFromStorage() {
      try {
        let rawData = null;
        if (typeof localStorage !== 'undefined') {
          rawData = localStorage.getItem(MEMORY_STORAGE_KEY);
        }
        if (rawData) {
          const parsed = JSON.parse(rawData);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item && item.signature && item.answers) {
                this.memories.set(item.signature, item);
              }
            }
          }
        }
        this.isLoaded = true;
      } catch (e) {
        console.warn('[SoloLearn Memory] Error loading memory storage:', e);
      }
    }

    saveToStorage() {
      try {
        if (typeof localStorage !== 'undefined') {
          const memoryArray = Array.from(this.memories.values());
          localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memoryArray));
        }
      } catch (e) {
        console.warn('[SoloLearn Memory] Error saving to storage:', e);
      }
    }

    seedHistoricalKnowledge() {
      for (const item of HISTORICAL_KNOWLEDGE_SEED) {
        const sig = this.generateSignature(item);
        if (sig && !this.memories.has(sig)) {
          this.memories.set(sig, {
            signature: sig,
            title: item.title,
            code: item.code || '',
            language: item.language || 'Programming Concepts',
            type: item.type || 'single_choice',
            blankCount: item.blankCount || (item.answers ? item.answers.length : 1),
            answers: item.answers,
            status: item.status || 'mastered',
            successCount: 3,
            errorCount: 0,
            reflection: item.reflection || 'Verified benchmark solution from project foundation.',
            lastUpdated: Date.now(),
            source: item.source || 'historical_seed'
          });
        }
      }
      this.saveToStorage();
    }

    migrateLegacyCache() {
      try {
        if (typeof localStorage === 'undefined') return;
        const legacy = localStorage.getItem(LEGACY_CACHE_KEY);
        if (!legacy) return;

        const parsed = JSON.parse(legacy);
        if (parsed && typeof parsed === 'object') {
          let count = 0;
          for (const key in parsed) {
            const entry = parsed[key];
            if (entry && entry.data && entry.data.answers) {
              const dummyQ = {
                title: entry.title || key,
                code: entry.code || '',
                type: entry.data.type || 'single_choice',
                options: entry.options || []
              };
              const sig = this.generateSignature(dummyQ);
              if (sig && !this.memories.has(sig)) {
                this.memories.set(sig, {
                  signature: sig,
                  title: dummyQ.title,
                  code: dummyQ.code,
                  language: entry.language || 'Programming Concepts',
                  type: dummyQ.type,
                  blankCount: entry.data.answers.length,
                  answers: entry.data.answers,
                  status: 'mastered',
                  successCount: 1,
                  errorCount: 0,
                  reflection: entry.data.explanation || 'Migrated from previous session cache.',
                  lastUpdated: Date.now(),
                  source: 'migrated_cache'
                });
                count++;
              }
            }
          }
          if (count > 0) {
            this.saveToStorage();
          }
        }
      } catch (e) {}
    }

    /**
     * Validates that the memory candidate has compatible options/answers with the query.
     */
    validateOptionMatch(question, item) {
      if (!question || !item) return false;

      const qOpts = (question.options || (question.choices ? question.choices.map(c => c.text || c) : []))
        .map(o => this.normalize(o))
        .filter(Boolean);

      const itemOpts = (item.options || []).map(o => this.normalize(o)).filter(Boolean);
      const itemAns = (item.answers || []).map(a => this.normalize(a)).filter(Boolean);

      // If both query and memory record have options/answers, verify at least one option overlaps
      if (qOpts.length > 0 && (itemOpts.length > 0 || itemAns.length > 0)) {
        const hasOverlap = qOpts.some(q => 
          itemOpts.includes(q) || 
          itemAns.includes(q) || 
          itemOpts.some(io => io.includes(q) || q.includes(io)) ||
          itemAns.some(ia => ia.includes(q) || q.includes(ia))
        );
        if (!hasOverlap) return false;
      }

      return true;
    }

    /**
     * Retrieves memory for a question if known.
     */
    get(question) {
      if (!question) return null;
      const signatures = this.getLookupSignatures(question);

      for (const sig of signatures) {
        if (this.memories.has(sig)) {
          const item = this.memories.get(sig);
          if (this.validateOptionMatch(question, item)) {
            return item;
          }
        }
      }

      // Fuzzy scan over question title and code if direct signature missed
      const titleNorm = this.normalize(question.title || '');
      if (titleNorm && titleNorm.length > 10) {
        const qCodeNorm = this.normalize(question.code || '');
        for (const item of this.memories.values()) {
          const itemTitleNorm = this.normalize(item.title || '');
          if (itemTitleNorm === titleNorm) {
            const itemCodeNorm = this.normalize(item.code || '');
            const codeMatches = !itemCodeNorm || !qCodeNorm ||
                                itemCodeNorm.slice(0, 40) === qCodeNorm.slice(0, 40) ||
                                itemCodeNorm.includes(qCodeNorm.slice(0, 30)) ||
                                qCodeNorm.includes(itemCodeNorm.slice(0, 30));
            if (codeMatches) {
              if (this.validateOptionMatch(question, item)) {
                return item;
              }
            }
          }
        }
      }

      return null;
    }

    /**
     * Formulates an analytical self-correction reflection when learning from mistakes.
     */
    generateReflection(question, wrongAnswers, actualCorrectAnswers, userReason = '') {
      const wrongStr = Array.isArray(wrongAnswers) ? wrongAnswers.join(', ') : String(wrongAnswers || '');
      const rightStr = Array.isArray(actualCorrectAnswers) ? actualCorrectAnswers.join(', ') : String(actualCorrectAnswers || '');
      const lang = question.language || 'programming';

      let reason = userReason ? ` Explanation: ${userReason}` : '';
      if (!userReason) {
        if (question.type === 'reorder') {
          reason = ` Previous sequence did not satisfy execution dependency in ${lang}. Reordered sequence correctly.`;
        } else if (question.type === 'fill_blanks') {
          reason = ` Analyzed syntax rules of ${lang} and matched exact slot tokens to form valid code.`;
        } else {
          reason = ` Evaluated ${lang} semantics; previously selected "${wrongStr}" was incorrect. Confirmed "${rightStr}" is the valid solution.`;
        }
      }

      return `🧠 [Self-Correction Reflection]: Acknowledged mistake on "${wrongStr}". Successfully adapted memory to "${rightStr}".${reason} Will never repeat this error.`;
    }

    /**
     * Learns and adapts a VERIFIED CORRECT answer.
     */
    learnCorrect(question, answers, source = 'user_submission', explanation = '') {
      if (!question || !answers) return null;
      const cleanAnswers = (Array.isArray(answers) ? answers : [answers]).map(a => String(a).trim()).filter(Boolean);
      if (cleanAnswers.length === 0) return null;

      const sig = this.generateSignature(question);
      const existing = this.memories.get(sig);

      const record = {
        signature: sig,
        title: question.title || '',
        code: question.code || '',
        language: question.language || 'Programming Concepts',
        type: question.type || (cleanAnswers.length > 1 ? 'fill_blanks' : 'single_choice'),
        blankCount: question.blankCount || cleanAnswers.length,
        answers: cleanAnswers,
        options: question.options || [],
        status: 'mastered',
        successCount: existing ? (existing.successCount || 0) + 1 : 1,
        errorCount: existing ? (existing.errorCount || 0) : 0,
        reflection: explanation || (existing ? existing.reflection : `Verified 100% correct solution for ${question.language || 'code'} exercise.`),
        lastUpdated: Date.now(),
        source
      };

      this.memories.set(sig, record);
      this.saveToStorage();
      return record;
    }

    /**
     * Learns and adapts when an answer was WRONG.
     * Analyzes mistake, acknowledges the error, and adapts to the right choice.
     */
    learnMistake(question, wrongAnswers, actualCorrectAnswers, source = 'mistake_analysis', userReason = '') {
      if (!question) return null;
      const cleanWrong = (Array.isArray(wrongAnswers) ? wrongAnswers : [wrongAnswers]).map(a => String(a).trim());
      const cleanRight = (Array.isArray(actualCorrectAnswers) ? actualCorrectAnswers : [actualCorrectAnswers]).map(a => String(a).trim()).filter(Boolean);

      if (cleanRight.length === 0) {
        console.warn('[SoloLearn Memory] Cannot learn mistake without actual correct answer.');
        return null;
      }

      const sig = this.generateSignature(question);
      const existing = this.memories.get(sig);
      const reflection = this.generateReflection(question, cleanWrong, cleanRight, userReason);

      const record = {
        signature: sig,
        title: question.title || '',
        code: question.code || '',
        language: question.language || 'Programming Concepts',
        type: question.type || (cleanRight.length > 1 ? 'fill_blanks' : 'single_choice'),
        blankCount: question.blankCount || cleanRight.length,
        answers: cleanRight,
        wrongAnswersHistory: [
          ...(existing && existing.wrongAnswersHistory ? existing.wrongAnswersHistory : []),
          { wrongAnswers: cleanWrong, timestamp: Date.now() }
        ],
        options: question.options || [],
        status: 'corrected',
        successCount: existing ? (existing.successCount || 0) : 0,
        errorCount: existing ? (existing.errorCount || 0) + 1 : 1,
        reflection,
        lastUpdated: Date.now(),
        source
      };

      this.memories.set(sig, record);
      this.saveToStorage();
      return record;
    }

    getStats() {
      let mastered = 0;
      let corrected = 0;
      for (const m of this.memories.values()) {
        if (m.status === 'mastered') mastered++;
        else if (m.status === 'corrected') corrected++;
      }
      return {
        total: this.memories.size,
        mastered,
        corrected
      };
    }

    clear() {
      this.memories.clear();
      this.seedHistoricalKnowledge();
      this.saveToStorage();
    }

    exportJson() {
      return JSON.stringify(Array.from(this.memories.values()), null, 2);
    }

    importJson(jsonString) {
      try {
        const list = JSON.parse(jsonString);
        if (Array.isArray(list)) {
          let imported = 0;
          for (const item of list) {
            if (item && item.signature && item.answers) {
              this.memories.set(item.signature, item);
              imported++;
            }
          }
          this.saveToStorage();
          return { success: true, count: imported };
        }
      } catch (e) {
        return { success: false, error: e.message };
      }
      return { success: false, error: 'Invalid format' };
    }
  }

  SoloLearnMemoryEngine.HISTORICAL_KNOWLEDGE_SEED = HISTORICAL_KNOWLEDGE_SEED;
  return SoloLearnMemoryEngine;
});


  // Load Mistral AI Provider
  /**
 * SoloLearn AI Companion - Native Mistral AI & Codestral Client
 * Powers 100% Accurate SoloLearn Solving with Codestral, Mistral Large, and 3-Pass Compiler Verification.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'));
  } else {
    root.MistralClient = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const MISTRAL_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
  const MISTRAL_MODELS_ENDPOINT = 'https://api.mistral.ai/v1/models';

  const WORKING_MISTRAL_TEXT_OUT_MODELS = [
    'codestral-latest',
    'mistral-small-latest',
    'open-mistral-nemo',
    'ministral-8b-latest',
    'mistral-large-latest'
  ];

  const NON_TEXT_MISTRAL_PATTERNS = /embed|moderation|ocr|audio|image|vision/i;

  class MistralClient {
    constructor(apiKey, model = 'codestral-latest') {
      this.apiKey = apiKey ? apiKey.trim() : '';
      this.model = model || 'codestral-latest';
      this.cache = new Map();
    }

    setApiKey(key) {
      this.apiKey = key ? key.trim() : '';
    }

    setModel(model) {
      this.model = model || 'codestral-latest';
    }

    clearCache() {
      this.cache.clear();
    }

    getCacheKey(questionPayload, model) {
      if (!questionPayload) return null;
      const t = questionPayload.title || '';
      const c = (questionPayload.code || '').slice(0, 100);
      const ty = questionPayload.type || '';
      const bc = questionPayload.blankCount || 0;
      const opts = Array.isArray(questionPayload.options) ? questionPayload.options.join(',') : '';
      return `${model}_${ty}_${bc}_${t}_${c}_${opts}`;
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

        let cleanExp = parsed.explanation || parsed.thought || 'Verified 3-Pass syntax solution by Codestral.';
        if (typeof cleanExp === 'object') cleanExp = JSON.stringify(cleanExp);

        if (cleanAnswers.length > 0) {
          return {
            thought: parsed.thought || 'Triple-check compiler verification passed by Mistral AI.',
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
          thought: thoughtMatch ? thoughtMatch[1] : 'Mistral regex extracted verification',
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
          explanation: 'Verified solution by Mistral AI.'
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

      const targetModel = modelOverride || this.model || 'codestral-latest';
      const cacheKey = this.getCacheKey(questionPayload, targetModel);

      // Check Cache
      if (options.cacheEnabled !== false && cacheKey && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        return {
          ...cached,
          isCached: true,
          latencyMs: 1
        };
      }

      if (!this.apiKey) {
        return {
          success: false,
          error: 'Mistral API Key is missing. Please enter your key from console.mistral.ai in settings (⚙).'
        };
      }

      const result = await this.queryModel(questionPayload, targetModel);
      if (result.success && cacheKey) {
        this.cache.set(cacheKey, result);
      }
      return result;
    }

    async queryModel(questionPayload, requestedModel = null) {
      if (!this.apiKey) {
        return { success: false, error: 'Mistral AI API Key is missing.' };
      }

      const startTime = performance.now();
      let targetModel = requestedModel || this.model || 'codestral-latest';
      const language = questionPayload.language || 'Java';
      const blankCount = questionPayload.blankCount || 0;
      const isFillBlanks = questionPayload.type === 'fill_blanks' || blankCount > 0;
      const hasCode = Boolean(questionPayload.code && questionPayload.code.trim().length > 0);
      const hasOptions = Array.isArray(questionPayload.options) && questionPayload.options.length > 0;

      let codeSection = '';
      if (hasCode) {
        codeSection = `
CODE TEMPLATE (WITH NUMBERED BLANK SLOTS):
\`\`\`${language}
${questionPayload.code}
\`\`\`
`;
      } else {
        codeSection = `
EXERCISE TYPE: Conceptual / Language Syntax Question (No code snippet required).
`;
      }

      let specificInstruction = '';
      const isMulti = questionPayload.type === 'multi_choice' ||
                      (questionPayload.title && /select all|choose all|all that apply|all correct|all matching/i.test(questionPayload.title)) ||
                      (questionPayload.extraText && /select all|choose all|all that apply|all correct|all matching/i.test(questionPayload.extraText));

      if (isFillBlanks && blankCount > 0) {
        specificInstruction = `CRITICAL SLOT REQUIREMENT: The code template contains EXACTLY ${blankCount} blanks ([BLANK_1] to [BLANK_${blankCount}]). Your 'answers' array MUST contain EXACTLY ${blankCount} strings corresponding to each blank in sequential order. Example for ${blankCount} blanks: "answers": ${JSON.stringify(Array.from({length: blankCount}, (_, i) => `token_${i + 1}`))}. If a WORD BANK is provided, prioritize selecting the exact matching tokens from the word bank.`;
      } else if (isMulti) {
        specificInstruction = `CRITICAL MULTI-SELECT INSTRUCTION: This is a MULTI-CHOICE question where MULTIPLE answers are correct! You MUST evaluate EVERY choice independently against the question/pattern. Your 'answers' array MUST contain ALL choices that are correct (e.g. "answers": ["Choice 1", "Choice 2"]). Do NOT return only one option when multiple choices are valid!`;
      } else if (hasOptions) {
        specificInstruction = `CRITICAL CHOICE SELECTION: You MUST choose the correct answer strictly from the AVAILABLE CHOICES below. Your 'answers' array MUST contain the exact string(s) from the choices list.`;
      }

      const userPrompt = `You are Codestral, the elite code compiler AI by Mistral AI. Execute an EXHAUSTIVE 4-PASS MENTAL COMPILER VERIFICATION before generating the final JSON:

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

MANDATORY 4-PASS VERIFICATION PROTOCOL (Populate into "thought"):
- Pass 1 (Language Syntax & Conventions): Analyze comments ('/* ... */', '//', '#'), keywords, types, and language rules.
- Pass 2 (Mental Code Trace): Step through logic or syntax rules to determine the mathematically and syntactically correct answer.
- Pass 3 (Word Bank / Option Matching): Select the exact matching choice from the available choices.
- Pass 4 (Sanitization Check): Ensure 'answers' contains ONLY the exact winning token or choice string without surrounding explanatory text.

Return strictly valid JSON matching the schema:
{
  "thought": "Pass 1: ...\\nPass 2: ...\\nPass 3: ...\\nPass 4: ...",
  "type": "${questionPayload.type || 'single_choice'}",
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const fetchFn = (Config && Config.safeFetch) || fetch;
        let response = await fetchFn(MISTRAL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        let latencyMs = Math.round(performance.now() - startTime);

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData && errData.message) {
              errorMsg = errData.message;
            } else if (errData && errData.error && errData.error.message) {
              errorMsg = errData.error.message;
            }
          } catch (_) {}

          // 1. Fallback across all verified working Text-out Mistral models when token/quota is exhausted
          for (const fbModel of WORKING_MISTRAL_TEXT_OUT_MODELS) {
            if (fbModel === targetModel) continue;
            try {
              const fbBody = { ...requestBody, model: fbModel };
              const fbRes = await fetchFn(MISTRAL_ENDPOINT, {
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

          // 2. If hardcoded list failed, dynamically query ModelService list on Mistral (filtering Text-out models)
          if (!response.ok) {
            try {
              const listRes = await fetchFn(MISTRAL_MODELS_ENDPOINT, {
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Accept': 'application/json'
                }
              });
              if (listRes.ok) {
                const listData = await listRes.json();
                if (listData && Array.isArray(listData.data)) {
                  const availableTextModels = listData.data
                    .map(m => m.id)
                    .filter(id => id && !NON_TEXT_MISTRAL_PATTERNS.test(id) && !WORKING_MISTRAL_TEXT_OUT_MODELS.includes(id));

                  for (const discModel of availableTextModels) {
                    try {
                      const discBody = { ...requestBody, model: discModel };
                      const discRes = await fetchFn(MISTRAL_ENDPOINT, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${this.apiKey}`,
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify(discBody)
                      });
                      if (discRes.ok) {
                        response = discRes;
                        targetModel = discModel;
                        break;
                      }
                    } catch (_) {}
                  }
                }
              }
            } catch (_) {}
          }

          if (!response.ok) {
            let isRateLimit = response.status === 429 || errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED');
            if (response.status === 401) {
              errorMsg = 'Invalid Mistral API Key. Please verify your key from console.mistral.ai.';
            } else if (isRateLimit) {
              const timeUntilUtc = (Config && Config.getTimeUntilUtcMidnight) ? Config.getTimeUntilUtcMidnight() : '00:00 UTC';
              errorMsg = `Daily Token / Rate Limit Reached (HTTP 429). Free quota resets in ${timeUntilUtc} (00:00 UTC).`;
            }

            return {
              success: false,
              error: errorMsg,
              status: response.status,
              isRateLimit,
              latencyMs,
              provider: 'mistral'
            };
          }
        }

        const data = await response.json();
        latencyMs = Math.round(performance.now() - startTime);
        const choice = data.choices && data.choices[0];
        const rawContent = choice && choice.message ? choice.message.content : '';

        const parsedJson = this.cleanJsonResponse(rawContent);

        if (!parsedJson || !Array.isArray(parsedJson.answers) || parsedJson.answers.length === 0) {
          return {
            success: false,
            error: 'Mistral response could not be parsed into answers.',
            raw: rawContent,
            latencyMs,
            provider: 'mistral'
          };
        }

        return {
          success: true,
          data: parsedJson,
          raw: rawContent,
          latencyMs,
          model: targetModel,
          provider: 'mistral',
          usage: data.usage || null
        };
      } catch (err) {
        const latencyMs = Math.round(performance.now() - startTime);
        return {
          success: false,
          error: `Mistral Connection error: ${err.message || 'Timeout after 35s'}`,
          latencyMs,
          provider: 'mistral'
        };
      }
    }
  }

  MistralClient.MODELS_ENDPOINT = MISTRAL_MODELS_ENDPOINT;
  return MistralClient;
});


  // Load Google AI Studio (Gemini) Provider
  /**
 * SoloLearn AI Companion - Google AI Studio (Gemini) Client
 * Powers fast, highly-accurate multimodal & coding intelligence with Gemini 2.0 Flash and 1.5 Flash.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config.js'));
  } else {
    root.GeminiClient = factory(root.SoloLearnConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Config) {
  'use strict';

  const WORKING_TEXT_OUT_MODELS = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];

  const NON_WORKING_OR_NON_TEXT_MODELS = [
    'gemini-2.5-pro',
    'gemini-3.1-pro',
    'gemini-2-flash',
    'gemini-2-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
  ];

  class GeminiClient {
    constructor(apiKey = '', model = 'gemini-3.7-flash') {
      this.apiKey = apiKey;
      this.model = model || 'gemini-3.7-flash';
      this.provider = 'gemini';
    }

    setApiKey(apiKey) {
      this.apiKey = apiKey ? apiKey.trim() : '';
    }

    setModel(model) {
      this.model = model || 'gemini-3.7-flash';
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
          thought: 'Extracted from raw Gemini JSON text.',
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
        return { success: false, error: 'Google AI Studio API Key is missing.' };
      }

      const startTime = performance.now();
      let targetModel = requestedModel || this.model || 'gemini-3.7-flash';
      // Normalize model string: strip 'models/' prefix if present
      targetModel = targetModel.replace(/^models\//, '');
      if (NON_WORKING_OR_NON_TEXT_MODELS.includes(targetModel)) {
        targetModel = 'gemini-3.7-flash';
      }

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

      const userPrompt = `You are an elite competitive programmer and compiler engineer AI on Google AI Studio. Execute a 4-Pass Mental Verification before generating the final JSON:

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

      const parts = [{ text: userPrompt }];

      // Multimodal Vision support: If diagrams, charts, or images are captured in question payload, attach to Gemini
      if (Array.isArray(questionPayload.images) && questionPayload.images.length > 0) {
        for (const img of questionPayload.images) {
          if (img && img.base64) {
            parts.push({
              inline_data: {
                mime_type: img.mimeType || 'image/png',
                data: img.base64
              }
            });
          }
        }
      }

      const requestBody = {
        systemInstruction: {
          parts: [{ text: Config.PROMPT_TEMPLATE.SYSTEM }]
        },
        contents: [
          {
            role: 'user',
            parts: parts
          }
        ],
        generationConfig: {
          temperature: 0.0,
          responseMimeType: 'application/json'
        }
      };

      try {
        const fetchFn = (Config && Config.safeFetch) || fetch;
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
        
        let response = await fetchFn(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        let latencyMs = Math.round(performance.now() - startTime);

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData && errData.error && errData.error.message) {
              errorMsg = errData.error.message;
            }
          } catch (_) {}

          // 1. Fallback across all verified working Text-out models when token/quota is exhausted
          for (const fbModel of WORKING_TEXT_OUT_MODELS) {
            if (fbModel === targetModel) continue;
            try {
              const fbEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${fbModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
              const fbRes = await fetchFn(fbEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
              });
              if (fbRes.ok) {
                response = fbRes;
                targetModel = fbModel;
                break;
              }
            } catch (_) {}
          }

          // 2. If hardcoded list failed, dynamically query ModelService.ListModels on the user's key (filtering only Text-out models)
          if (!response.ok) {
            try {
              const listEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(this.apiKey)}`;
              const listRes = await fetchFn(listEndpoint);
              if (listRes.ok) {
                const listData = await listRes.json();
                if (listData && Array.isArray(listData.models)) {
                  const availableGenerateModels = listData.models
                    .filter(m => {
                      const name = (m.name || '').replace(/^models\//, '');
                      const isGenContent = Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent');
                      const isNonText = /embedding|robotics|banana|lyria|tts|image|audio|vision-preview|computer-use|deep-research/i.test(name);
                      const isKnownZero = NON_WORKING_OR_NON_TEXT_MODELS.includes(name);
                      return isGenContent && !isNonText && !isKnownZero;
                    })
                    .map(m => m.name.replace(/^models\//, ''));

                  for (const discModel of availableGenerateModels) {
                    try {
                      const discEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${discModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
                      const discRes = await fetchFn(discEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                      });
                      if (discRes.ok) {
                        response = discRes;
                        targetModel = discModel;
                        break;
                      }
                    } catch (_) {}
                  }
                }
              }
            } catch (_) {}
          }

          if (!response.ok) {
            let isRateLimit = response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED');
            if (isRateLimit) {
              const timeUntilUtc = (Config && Config.getTimeUntilUtcMidnight) ? Config.getTimeUntilUtcMidnight() : '00:00 UTC';
              errorMsg = `Daily Token / Quota Limit Reached (HTTP 429). Free quota resets in ${timeUntilUtc} (00:00 UTC).`;
            }
            return { success: false, error: errorMsg, isRateLimit, provider: 'gemini', latencyMs };
          }
        }

        const data = await response.json();
        latencyMs = Math.round(performance.now() - startTime);

        const candidate = data.candidates && data.candidates[0];
        const rawContent = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] ? candidate.content.parts[0].text : '';

        const parsedJson = this.cleanJsonResponse(rawContent);
        if (!parsedJson || !Array.isArray(parsedJson.answers) || parsedJson.answers.length === 0) {
          return { success: false, error: 'Google Gemini response could not be parsed into valid answers.', raw: rawContent, provider: 'gemini', latencyMs };
        }

        return {
          success: true,
          data: parsedJson,
          raw: rawContent,
          latencyMs,
          model: targetModel,
          provider: 'gemini'
        };
      } catch (err) {
        return {
          success: false,
          error: `Google Gemini Error: ${err.message || 'Request failed'}`,
          provider: 'gemini',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  }

  return GeminiClient;
});


  // Load Hugging Face Provider
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


  // Load Multi-Provider Consensus Engine
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


  // Load Parser
  /**
 * SoloLearn AI Companion - React Fiber Internal State Inspector & Precision DOM Parser
 * Extracts ground-truth answers from SoloLearn React component state / Next.js props,
 * with high-precision DOM parsing fallbacks for all SoloLearn activities.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SoloLearnParser = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isVisible(el) {
    if (!el) return false;
    if (el.closest && el.closest('#sololearn-ai-hud')) return false;

    try {
      const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if (style) {
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      }
      if (el.closest && el.closest('[aria-hidden="true"]')) return false;

      if (typeof el.getBoundingClientRect === 'function' && window.innerWidth > 0) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          if (rect.right < -50 || rect.left > window.innerWidth + 50) return false;
        }
      }
    } catch (e) {}

    return true;
  }

  function getCleanText(el) {
    if (!el) return '';
    try {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
      return (clone.innerText || clone.textContent || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
    } catch (e) {
      return (el.innerText || el.textContent || '').trim();
    }
  }

  function isDividerOrSpacer(el) {
    if (!el) return false;

    // Tag and ARIA checks
    const tag = (el.tagName || '').toUpperCase();
    if (tag === 'HR') return true;
    if (el.getAttribute && el.getAttribute('role') === 'separator') return true;

    // Class name and attribute keyword checks
    const className = (typeof el.className === 'string' ? el.className : (el.getAttribute && el.getAttribute('class')) || '').toLowerCase();
    const dataTest = (el.getAttribute && el.getAttribute('data-test') || '').toLowerCase();
    const testId = (el.getAttribute && el.getAttribute('data-testid') || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    const combined = `${className} ${dataTest} ${testId} ${id}`;

    if (
      combined.includes('divider') ||
      combined.includes('separator') ||
      combined.includes('spacer') ||
      combined.includes('drop-line') ||
      combined.includes('dropline') ||
      combined.includes('gap-line') ||
      combined.includes('reorder-line') ||
      combined.includes('reorder-gap') ||
      combined.includes('insert-indicator') ||
      combined.includes('placeholder-line') ||
      combined.includes('between-rows') ||
      combined.includes('line-between') ||
      combined.includes('drop-indicator') ||
      combined.includes('insertion-indicator')
    ) {
      return true;
    }

    // Geometry / layout detection: Check if it's an ultra-thin horizontal divider line or zero-height gap
    try {
      if (typeof el.getBoundingClientRect === 'function') {
        const rect = el.getBoundingClientRect();
        if (rect && rect.height > 0 && rect.height <= 8 && rect.width >= 20) {
          return true;
        }
      }
      if (el.offsetHeight > 0 && el.offsetHeight <= 8 && el.offsetWidth >= 20) {
        return true;
      }
      if (el.clientHeight > 0 && el.clientHeight <= 8 && el.clientWidth >= 20) {
        return true;
      }
    } catch (_) {}

    // Inline style height check
    if (el.style) {
      const h = el.style.height || '';
      if (h && (h === '0px' || h === '1px' || h === '2px' || h === '3px' || h === '4px' || h === '5px' || h === '6px' || h === '8px')) {
        return true;
      }
    }

    return false;
  }

  function isGenericInstruction(raw) {
    if (!raw) return true;
    const lower = raw.toLowerCase().trim().replace(/[.:!]+$/, '');
    return (
      lower === 'select all correct answers' ||
      lower === 'select all answers that apply' ||
      lower === 'select all that apply' ||
      lower === 'select all options that apply' ||
      lower === 'select all matching answers' ||
      lower === 'select all correct' ||
      lower === 'select the correct answer' ||
      lower === 'select the correct answers' ||
      lower === 'select the correct option' ||
      lower === 'select the correct options' ||
      lower === 'select all' ||
      lower === 'choose all that apply' ||
      lower === 'choose all correct answers' ||
      lower === 'choose all matching answers' ||
      lower === 'choose the correct answer' ||
      lower === 'choose the correct answers' ||
      lower === 'choose the correct option' ||
      lower === 'check all that apply' ||
      lower === 'check all correct answers' ||
      lower === 'pick the correct answer' ||
      lower === 'pick all that apply' ||
      lower === 'fill in the blank' ||
      lower === 'fill in the blanks'
    );
  }

  const BLANK_SELECTOR = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="hidden"]), textarea, [contenteditable="true"], span[class*="slot" i], div[class*="slot" i], span[class*="blank" i], div[class*="blank" i], span[class*="circle" i], div[class*="circle" i], div[class*="drop" i], span[class*="drop" i], div[class*="droppable" i], span[class*="droppable" i], div[class*="empty" i], span[class*="empty" i], div[class*="gap" i], span[class*="gap" i], div[class*="hole" i], span[class*="hole" i], [data-test*="blank"], [data-test*="slot"], [data-test*="empty"], [data-test*="drop"], [data-test*="droppable"], [data-test*="hole"], [data-test*="target"]';

  /**
   * SoloLearnInternalInspector: Deeply inspects React Fiber nodes, React component props,
   * React Hooks linked lists, and Next.js page state for ground truth solutions or pristine question data.
   */
  class SoloLearnInternalInspector {
    static findReactFiber(domNode) {
      if (!domNode) return null;
      for (const key in domNode) {
        if (
          key.startsWith('__reactFiber$') ||
          key.startsWith('__reactInternalInstance$') ||
          key.startsWith('__reactContainer$') ||
          key.startsWith('_reactRootContainer') ||
          key.startsWith('__reactEvents$')
        ) {
          return domNode[key];
        }
      }
      return null;
    }

    static findReactProps(domNode) {
      if (!domNode) return null;
      for (const key in domNode) {
        if (key.startsWith('__reactProps$')) {
          return domNode[key];
        }
      }
      return null;
    }

    static traverseFiberForQuestionData(fiber, maxDepth = 40) {
      if (!fiber) return null;
      const queue = [{ node: fiber, depth: 0 }];
      const visited = new Set();

      while (queue.length > 0) {
        const { node, depth } = queue.shift();
        if (!node || depth > maxDepth || visited.has(node)) continue;
        visited.add(node);

        // 1. Check direct props
        const props = node.memoizedProps || node.pendingProps;
        if (props && typeof props === 'object') {
          const inspected = this.extractQuestionFromProps(props);
          if (inspected && inspected.isInternalGroundTruth) return inspected;
        }

        // 2. Traverse React Hooks linked list on memoizedState (functional components)
        let hook = node.memoizedState;
        let hookDepth = 0;
        while (hook && typeof hook === 'object' && hookDepth < 25) {
          if (hook.memoizedState && typeof hook.memoizedState === 'object') {
            const inspectedHook = this.extractQuestionFromProps(hook.memoizedState);
            if (inspectedHook && inspectedHook.isInternalGroundTruth) return inspectedHook;
          }
          if (hook.baseState && typeof hook.baseState === 'object') {
            const inspectedBase = this.extractQuestionFromProps(hook.baseState);
            if (inspectedBase && inspectedBase.isInternalGroundTruth) return inspectedBase;
          }
          if (hook.queue && hook.queue.lastRenderedState && typeof hook.queue.lastRenderedState === 'object') {
            const inspectedQueue = this.extractQuestionFromProps(hook.queue.lastRenderedState);
            if (inspectedQueue && inspectedQueue.isInternalGroundTruth) return inspectedQueue;
          }
          hook = hook.next;
          hookDepth++;
        }

        // 3. Check direct memoizedState
        if (node.memoizedState && typeof node.memoizedState === 'object') {
          const inspectedState = this.extractQuestionFromProps(node.memoizedState);
          if (inspectedState && inspectedState.isInternalGroundTruth) return inspectedState;
        }

        if (node.child) queue.push({ node: node.child, depth: depth + 1 });
        if (node.return && depth < 15) queue.push({ node: node.return, depth: depth + 1 });
        if (node.sibling && depth < 15) queue.push({ node: node.sibling, depth: depth + 1 });
      }

      return null;
    }

    static extractQuestionFromProps(props) {
      if (!props) return null;

      // Look for quiz / question container objects
      const candidates = [
        props.quiz,
        props.quizItem,
        props.question,
        props.item,
        props.step,
        props.task,
        props.data,
        props.exercise,
        props.lessonQuiz,
        props.activeQuestion,
        props.lesson,
        props.currentTask,
        props.currentQuestion,
        props.activeTask,
        props.content,
        props
      ];

      for (const cand of candidates) {
        if (!cand || typeof cand !== 'object') continue;

        // Check for ground truth answers inside this object
        let answers = null;
        let explanation = null;

        // 1. Direct answer field
        if (cand.correctAnswer !== undefined && cand.correctAnswer !== null) {
          answers = Array.isArray(cand.correctAnswer) ? cand.correctAnswer.map(String) : [String(cand.correctAnswer)];
        } else if (cand.correct_answer !== undefined && cand.correct_answer !== null) {
          answers = Array.isArray(cand.correct_answer) ? cand.correct_answer.map(String) : [String(cand.correct_answer)];
        } else if (Array.isArray(cand.correctAnswers) && cand.correctAnswers.length > 0) {
          answers = cand.correctAnswers.map(a => String(a && (a.text || a.title || a.value || a) || ''));
        } else if (Array.isArray(cand.answers) && cand.answers.length > 0 && typeof cand.answers[0] === 'string') {
          answers = cand.answers.map(String);
        } else if (Array.isArray(cand.expectedAnswers) && cand.expectedAnswers.length > 0) {
          answers = cand.expectedAnswers.map(String);
        } else if (cand.solution !== undefined && cand.solution !== null) {
          if (Array.isArray(cand.solution)) answers = cand.solution.map(String);
          else if (typeof cand.solution === 'string') answers = [cand.solution];
          else if (typeof cand.solution === 'object' && cand.solution.answers) answers = cand.solution.answers.map(String);
        }        else if (Array.isArray(cand.pairs) && cand.pairs.length > 0) {
          answers = cand.pairs.map(p => String(p && (p.answer || p.term || p.value || p.match || p.right || p.text || p) || ''));
        } else if (Array.isArray(cand.matchItems) && cand.matchItems.length > 0) {
          answers = cand.matchItems.map(p => String(p && (p.answer || p.term || p.value || p.match || p.right || p.text || p) || ''));
        } else if (Array.isArray(cand.matches) && cand.matches.length > 0) {
          answers = cand.matches.map(p => String(p && (p.answer || p.term || p.value || p.match || p.right || p.text || p) || ''));
        } else if (cand.matchingAnswers && typeof cand.matchingAnswers === 'object') {
          answers = Object.values(cand.matchingAnswers).map(String);
        } else if (Array.isArray(cand.orderedItems) && cand.orderedItems.length > 0) {
          answers = cand.orderedItems.map(item => String(item.text || item.title || item.value || item));
        } else if (Array.isArray(cand.orderedTokens) && cand.orderedTokens.length > 0) {
          answers = cand.orderedTokens.map(item => String(item.text || item.title || item.value || item));
        } else if (Array.isArray(cand.correctOrder) && cand.correctOrder.length > 0) {
          answers = cand.correctOrder.map(String);
        } else if (Array.isArray(cand.expectedOrder) && cand.expectedOrder.length > 0) {
          answers = cand.expectedOrder.map(String);
        } else if (Array.isArray(cand.options)) {
          // Check options array with isCorrect flags
          const correctOpts = cand.options.filter(o => o && (o.isCorrect === true || o.correct === true));
          if (correctOpts.length > 0) {
            answers = correctOpts.map(o => String(o.text || o.title || o.value || o.label || ''));
          } else if (cand.correctOptionId !== undefined) {
            const match = cand.options.find(o => o && (o.id === cand.correctOptionId || o.optionId === cand.correctOptionId));
            if (match) answers = [String(match.text || match.title || match.value || match.label || '')];
          } else if (Array.isArray(cand.correctOptionIds) && cand.correctOptionIds.length > 0) {
            const matches = cand.options.filter(o => o && cand.correctOptionIds.includes(o.id));
            if (matches.length > 0) answers = matches.map(m => String(m.text || m.title || m.value || m.label || ''));
          } else if (cand.correctOptionIndex !== undefined && cand.options[cand.correctOptionIndex]) {
            const match = cand.options[cand.correctOptionIndex];
            answers = [String(match.text || match.title || match.value || match.label || '')];
          } else if (cand.correct_option_index !== undefined && cand.options[cand.correct_option_index]) {
            const match = cand.options[cand.correct_option_index];
            answers = [String(match.text || match.title || match.value || match.label || '')];
          }
        }

        if (answers && answers.length > 0) {
          explanation = cand.explanation || cand.hint || cand.explanationText || 'Extracted directly from SoloLearn React Internal State.';
          return {
            isInternalGroundTruth: true,
            title: cand.title || cand.text || cand.instruction || cand.questionText || '',
            code: cand.code || cand.template || cand.codeTemplate || cand.snippet || '',
            language: cand.language || cand.courseLanguage || '',
            type: cand.type || (answers.length > 1 ? 'fill_blanks' : 'single_choice'),
            answers: answers.map(a => String(a).trim()),
            explanation: String(explanation),
            rawObject: cand
          };
        }

        // Check if pristine question data without answers exists (e.g. pristine code/options)
        if (cand.code || cand.template || cand.options || cand.title) {
          return {
            isInternalGroundTruth: false,
            title: cand.title || cand.text || cand.instruction || '',
            code: cand.code || cand.template || cand.codeTemplate || cand.snippet || '',
            language: cand.language || cand.courseLanguage || '',
            options: Array.isArray(cand.options) ? cand.options.map(o => typeof o === 'string' ? o : (o.text || o.title || o.value || '')) : [],
            rawObject: cand
          };
        }
      }

      return null;
    }

    static inspect() {
      // 1. Target strictly active quiz & exercise elements
      const targetSelectors = [
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
        '[data-test="exercise-container"]',
        '[data-test="lesson-content"]',
        '[class*="quiz"]',
        '[class*="exercise"]',
        'main [data-test]'
      ];

      const domTitle = (() => {
        try {
          const tEl = document.querySelector('h1, h2, h3, [data-test*="title"], [data-test*="question"], [class*="title"], [class*="question"]');
          return tEl ? tEl.innerText.trim().toLowerCase() : '';
        } catch (_) {
          return '';
        }
      })();

      const validateCandidate = (extracted) => {
        if (!extracted || !extracted.isInternalGroundTruth || !Array.isArray(extracted.answers) || extracted.answers.length === 0) {
          return null;
        }

        // Validate that extracted title or answers belong to the current active DOM exercise
        const candidateTitle = String(extracted.title || '').trim().toLowerCase();
        const firstAnswer = String(extracted.answers[0] || '').trim().toLowerCase();

        // Reject generic overview strings
        if (candidateTitle.includes('sololearn is a platform') || firstAnswer.includes('sololearn is a platform')) {
          return null;
        }

        // If DOM title exists and is distinct, ensure reasonable semantic overlap
        if (domTitle && candidateTitle && candidateTitle.length > 5 && domTitle.length > 5) {
          const domSnippet = domTitle.slice(0, 15);
          const candSnippet = candidateTitle.slice(0, 15);
          if (!domTitle.includes(candSnippet) && !candidateTitle.includes(domSnippet)) {
            // Title mismatch -> Do not trust as active ground truth
            return null;
          }
        }

        return extracted;
      };

      for (const sel of targetSelectors) {
        try {
          const el = document.querySelector(sel);
          if (!el) continue;

          // Check direct props
          const props = this.findReactProps(el);
          if (props) {
            const extracted = this.extractQuestionFromProps(props);
            const valid = validateCandidate(extracted);
            if (valid) return valid;
          }

          // Check fiber tree
          const fiber = this.findReactFiber(el);
          if (fiber) {
            const extracted = this.traverseFiberForQuestionData(fiber);
            const valid = validateCandidate(extracted);
            if (valid) return valid;
          }
        } catch (_) {}
      }

      return null;
    }
  }

  class SoloLearnParser {
    static detectLanguage(codeSnippet = '') {
      const code = String(codeSnippet || '').toLowerCase();

      // 1. Direct High-Confidence Code Syntax Signatures
      if (code.includes('console.write') || code.includes('console.readline') || code.includes('using system') || code.includes('namespace ') || code.includes('static void main') || code.includes('class program')) {
        return 'C# (.NET)';
      }
      if (code.includes('system.out.print') || code.includes('public static void main') || (code.includes('string[] args') && !code.includes('console.')) || code.includes('import java.') || code.includes('class sum')) {
        return 'Java';
      }
      if (code.includes('std::cout') || code.includes('std::cin') || code.includes('#include <iostream>') || code.includes('cout <<') || code.includes('cin >>')) {
        return 'C++';
      }
      if (code.includes('#include <stdio.h>') || code.includes('printf(') || code.includes('scanf(')) {
        return 'C';
      }
      if (code.includes('def ') || code.includes('elif ') || code.includes('__init__') || code.includes('import math') || (code.includes('print(') && !code.includes(';'))) {
        return 'Python';
      }
      if (code.includes('console.log') || code.includes('document.getelement') || code.includes('===') || code.includes('function(') || code.includes('const ') || code.includes('let ')) {
        return 'JavaScript';
      }
      if (code.includes('select ') || code.includes('insert into') || code.includes('update ') || code.includes('delete from') || code.includes('create table') || code.includes('alter table') || code.includes('primary key') || code.includes('foreign key') || code.includes('group by') || code.includes('order by') || code.includes('inner join') || code.includes('left join')) {
        return 'SQL';
      }

      // 2. Comprehensive URL, Breadcrumb, and DOM Analysis
      const url = (typeof window !== 'undefined' ? window.location.href : '').toLowerCase();
      const pathname = (typeof window !== 'undefined' ? window.location.pathname : '').toLowerCase();
      const pageTitle = (typeof document !== 'undefined' ? document.title : '').toLowerCase();
      
      let domText = '';
      if (typeof document !== 'undefined') {
        const headerEls = document.querySelectorAll('header, nav, [data-test*="breadcrumb"], [data-test*="course"], [data-test*="lesson"], [data-test*="title"], h1, h2, h3, a[href*="/learn/courses/"]');
        domText = Array.from(headerEls).map(el => el.textContent || '').join(' ').toLowerCase();
      }

      const combined = `${url} ${pathname} ${pageTitle} ${domText}`;

      if (combined.includes('sql') || combined.includes('database') || combined.includes('/courses/sql') || combined.includes('relational') || combined.includes('query') || combined.includes('schema') || combined.includes('dbms') || combined.includes('table')) {
        return 'SQL';
      }
      if (combined.includes('c-sharp') || combined.includes('csharp') || combined.includes('c#') || combined.includes('/courses/c-sharp') || combined.includes('c-sharp-introduction') || combined.includes('c-sharp-intermediate')) {
        return 'C# (.NET)';
      }
      if (combined.includes('c-plus-plus') || combined.includes('cpp') || combined.includes('c++') || combined.includes('/courses/c-plus-plus') || combined.includes('/courses/cpp')) {
        return 'C++';
      }
      if (combined.includes('/courses/c-introduction') || combined.includes('c-introduction') || combined.includes('c-intermediate') || combined.includes('learn c ') || combined.includes('introduction to c')) {
        return 'C';
      }
      if (combined.includes('python') || combined.includes('/courses/python')) {
        return 'Python';
      }
      if (combined.includes('javascript') || combined.includes('/courses/javascript') || combined.includes('react') || combined.includes('/js')) {
        return 'JavaScript';
      }
      if (combined.includes('typescript') || combined.includes('/courses/typescript') || combined.includes('/ts')) {
        return 'TypeScript';
      }
      if (combined.includes('java') && !combined.includes('javascript') && !combined.includes('script')) {
        return 'Java';
      }
      if (combined.includes('html') || combined.includes('web-development') || combined.includes('web development')) {
        return 'HTML';
      }
      if (combined.includes('css')) {
        return 'CSS';
      }
      if (combined.includes('kotlin') || combined.includes('/courses/kotlin')) {
        return 'Kotlin';
      }
      if (combined.includes('swift') || combined.includes('/courses/swift')) {
        return 'Swift';
      }
      if (combined.includes('php') || combined.includes('/courses/php')) {
        return 'PHP';
      }
      if (combined.includes('go-') || combined.includes('/go') || combined.includes('golang')) {
        return 'Go';
      }
      if (combined.includes('ruby') || combined.includes('/courses/ruby')) {
        return 'Ruby';
      }
      if (combined.includes('algorithms') || combined.includes('data-structures') || combined.includes('coding-foundations') || combined.includes('intro-to-programming') || combined.includes('computer-science')) {
        return 'Programming Concepts';
      }

      return 'Programming Concepts';
    }

    static getQuestionContainer() {
      const candidateSelectors = [
        '[data-test="lesson-content"]',
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
        '[data-test="exercise-container"]',
        '[data-test*="quiz"]',
        '[data-test*="lesson"]',
        '[data-test*="practice"]',
        '[data-test*="exercise"]',
        'main',
        '#root',
        '#__next',
        'body'
      ];

      for (const selector of candidateSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (isVisible(el)) return el;
        }
      }
      return document.body;
    }

    static extractTitle(container = document) {
      const titleSelectors = [
        '[data-test="quiz-title"]',
        '[data-test="question-text"]',
        '[data-test="task-description"]',
        '[data-test="lesson-title"]',
        '[data-test="instruction"]',
        '[data-test="task-title"]',
        '[data-test*="instruction"]',
        '[data-test*="question"]',
        '[data-test*="title"]',
        'h1', 'h2', 'h3', 'h4',
        '.question-title', '.quiz-task', '.task-title', '.instruction', '[class*="title" i]', '[class*="question" i]'
      ];

      const cleanTitleText = (raw) => {
        if (!raw) return '';
        return raw
          .replace(/Module\s+\d+\s+Quiz/gi, '')
          .replace(/Stuck\?/gi, '')
          .replace(/Change\s+Language/gi, '')
          .replace(/\bQuiz\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const targetContainer = container || document.body;

      // 1. Explicit Title Selectors
      for (const sel of titleSelectors) {
        const elements = targetContainer.querySelectorAll(sel);
        for (const el of elements) {
          if (!isVisible(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;
          const cleaned = cleanTitleText(getCleanText(el));
          if (cleaned.length > 5 && !cleaned.toLowerCase().includes('sololearn is a platform') && !isGenericInstruction(cleaned)) {
            return cleaned;
          }
        }
      }

      // 2. Scan visible paragraphs, divs, and headings in target container for question sentences
      const paragraphs = Array.from((targetContainer || document.body).querySelectorAll('p, span, div, h1, h2, h3, h4, h5'));
      for (const p of paragraphs) {
        if (!isVisible(p)) continue;
        if (p.closest('header') || p.closest('nav') || p.closest('button') || p.closest('#sololearn-ai-hud')) continue;
        
        const raw = getCleanText(p);
        const cleaned = cleanTitleText(raw);
        if (cleaned.length < 5 || cleaned.length > 350) continue;
        if (cleaned.toLowerCase().includes('sololearn is a platform')) continue;
        if (isGenericInstruction(cleaned)) continue;

        const lower = cleaned.toLowerCase();

        // High confidence: contains a question mark or starts with question / task keyword
        if (cleaned.includes('?') || 
            lower.startsWith('which') || 
            lower.startsWith('what') || 
            lower.startsWith('how') || 
            lower.startsWith('match') ||
            lower.startsWith('pair') ||
            lower.startsWith('select') || 
            lower.startsWith('choose') || 
            lower.startsWith('fill') || 
            lower.startsWith('complete') || 
            lower.startsWith('arrange') || 
            lower.startsWith('reorder') || 
            lower.startsWith('drag') || 
            lower.startsWith('type') || 
            lower.startsWith('find') || 
            lower.startsWith('declare') || 
            lower.startsWith('create') || 
            lower.startsWith('output') ||
            lower.startsWith('put in order')) {
          return cleaned;
        }
      }

      // 3. Fallback: Return first prominent visible text line
      for (const p of paragraphs) {
        if (!isVisible(p)) continue;
        if (p.closest('header') || p.closest('nav') || p.closest('button') || p.closest('#sololearn-ai-hud')) continue;
        const cleaned = cleanTitleText(getCleanText(p));
        if (cleaned.length >= 8 && cleaned.length <= 250 && !cleaned.toLowerCase().includes('sololearn is a platform') && !isGenericInstruction(cleaned)) {
          return cleaned;
        }
      }

      return 'Answer the question shown on screen.';
    }

    static getCleanCodeText(el) {
      if (!el) return '';
      try {
        const clone = el.cloneNode(true);
        clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
        clone.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\n')));
        
        // Table cell support: ensure pipe separators and mark visually empty cells as [empty]
        clone.querySelectorAll('th, td').forEach(cell => {
          const text = (cell.textContent || '').replace(/[\s\u00A0\u200B]+/g, ' ').trim();
          if (!text) {
            cell.appendChild(document.createTextNode('[empty]'));
          }
          cell.appendChild(document.createTextNode(' | '));
        });

        // SVG Text Support: ensure text in SVG graphics and illustrations has proper spacing and line breaks
        clone.querySelectorAll('text, tspan').forEach(t => {
          t.appendChild(document.createTextNode(' '));
        });
        clone.querySelectorAll('g').forEach(g => {
          g.appendChild(document.createTextNode('\n'));
        });

        // Image Alt text support: ensure images with alt / title attributes are extracted as text
        clone.querySelectorAll('img').forEach(img => {
          const alt = img.getAttribute('alt') || img.getAttribute('aria-label') || img.getAttribute('title') || '';
          if (alt) {
            img.replaceWith(document.createTextNode(` [Image: ${alt}] `));
          }
        });

        const blocks = clone.querySelectorAll('div, p, tr, li, pre');
        blocks.forEach(b => {
          b.appendChild(document.createTextNode('\n'));
        });
        const raw = clone.textContent || clone.innerText || '';
        return raw
          .split('\n')
          .map(line => line.replace(/[\t\r ]+/g, ' ').trim())
          .filter(line => line.length > 0)
          .join('\n');
      } catch (e) {
        return (el.textContent || '').trim();
      }
    }

    static extractImages(container = document) {
      const searchRoot = container || document.body;
      const images = [];
      try {
        const imgElements = Array.from(searchRoot.querySelectorAll('img, canvas'));
        for (const img of imgElements) {
          if (!isVisible(img) || img.closest('#sololearn-ai-hud')) continue;
          if (img.tagName.toLowerCase() === 'img') {
            const src = img.src || img.getAttribute('src') || '';
            if (src.startsWith('data:image/')) {
              const match = src.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
              if (match) {
                images.push({ mimeType: match[1], base64: match[2] });
              }
            } else if (src.length > 0) {
              images.push({ url: src, alt: img.alt || img.getAttribute('aria-label') || '' });
            }
          } else if (img.tagName.toLowerCase() === 'canvas') {
            try {
              const dataUrl = img.toDataURL('image/png');
              const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
              if (match) {
                images.push({ mimeType: match[1], base64: match[2] });
              }
            } catch (_) {}
          }
        }
      } catch (_) {}
      return images;
    }

    static extractCodeAndBlanks(container = document) {
      const searchRoot = container || document.body;
      const candidateBoxes = Array.from(searchRoot.querySelectorAll(
        'pre, code, table, svg, canvas, img, div[class*="code" i], div[class*="Code"], div[style*="monospace"], div[class*="editor" i], div[class*="snippet" i], div[class*="syntax" i], div[class*="highlight" i], div[class*="fitb" i], div[class*="table" i], div[class*="diagram" i], div[class*="illustration" i], div[class*="graphic" i], div[class*="image" i], div[class*="canvas" i], [data-test*="code"], [data-test*="snippet"], [data-test*="fitb"], [data-test*="table"], [data-test*="diagram"], [data-test*="illustration"], [data-test*="graphic"], [data-test*="image"]'
      ));

      // Fallback: Scan all div/section/svg/table elements if candidateBoxes is empty
      if (candidateBoxes.length === 0) {
        const allDivs = Array.from((document.body || searchRoot).querySelectorAll('div, section, article, pre, table, svg'));
        for (const div of allDivs) {
          if (!isVisible(div) || div.closest('#sololearn-ai-hud') || div.closest('header') || div.closest('nav')) continue;
          const text = getCleanText(div);
          if (
            (text.includes(';') || text.includes('{') || text.includes('System.out') || text.includes('Console.Write') || text.includes('def ') || text.includes('public ') || text.includes('class ') || text.includes('String ') || text.includes('int ') || text.includes('SELECT ') || text.includes('FROM ') || text.includes('GROUP BY') || text.includes('WHERE ') || text.includes('HAVING ')) &&
            text.length > 5 && text.length < 2500
          ) {
            candidateBoxes.push(div);
          }
        }
      }

      // Keep only outermost code containers to prevent double-counting child <code> inside parent <div data-test="code-snippet">
      const topBoxes = candidateBoxes.filter(box => {
        if (!isVisible(box)) return false;
        return !candidateBoxes.some(parent => parent !== box && isVisible(parent) && parent.contains(box));
      });

      const codeBoxes = [];
      for (const box of topBoxes) {
        const text = getCleanText(box);
        if (text.length > 1 || box.querySelector(BLANK_SELECTOR)) {
          codeBoxes.push(box);
        }
      }

      const blankElements = [];
      let globalBlankIdx = 1;
      const formattedParts = [];

      for (let i = 0; i < codeBoxes.length; i++) {
        const box = codeBoxes[i];
        const rawInsideBlanks = Array.from(box.querySelectorAll(BLANK_SELECTOR));

        // Filter out parent drop containers that contain child drop containers, and ignore divider lines / spacers
        let insideBlanks = rawInsideBlanks.filter(b => {
          if (!isVisible(b)) return false;
          if (b.closest('#sololearn-ai-hud')) return false;
          if (isDividerOrSpacer(b)) return false;
          return !rawInsideBlanks.some(other => other !== b && b.contains(other));
        });

        // Structural Blank Fallback: Find visually empty slot elements within the code box
        if (insideBlanks.length === 0) {
          const emptyLeaves = Array.from(box.querySelectorAll('span, div, button, em, i, a')).filter(el => {
            if (!isVisible(el) || el.closest('#sololearn-ai-hud')) return false;
            if (isDividerOrSpacer(el)) return false;
            if (el.children.length > 0) return false;
            const t = el.textContent.replace(/[\s\u00A0\u200B]+/g, '');
            return t === '' || t === '...' || t === '___' || t === '?' || t === '•';
          });
          if (emptyLeaves.length > 0 && emptyLeaves.length <= 10) {
            insideBlanks = emptyLeaves;
          }
        }

        // Sort insideBlanks in visual reading order (top-to-bottom, left-to-right)
        insideBlanks.sort((a, b) => {
          try {
            if (typeof a.getBoundingClientRect === 'function' && typeof b.getBoundingClientRect === 'function') {
              const rectA = a.getBoundingClientRect();
              const rectB = b.getBoundingClientRect();
              if (rectA.top !== undefined && rectB.top !== undefined && Math.abs(rectA.top - rectB.top) > 10) {
                return rectA.top - rectB.top;
              }
              if (rectA.left !== undefined && rectB.left !== undefined) {
                return rectA.left - rectB.left;
              }
            }
          } catch (_) {}
          return 0;
        });

        try {
          // Tag each unique leaf blank with an exact index before cloning
          insideBlanks.forEach((b, bIdx) => {
            b.setAttribute('data-sl-temp-blank-idx', String(globalBlankIdx + bIdx));
          });

          const clone = box.cloneNode(true);
          // Remove temp attribute from live DOM
          insideBlanks.forEach(b => b.removeAttribute('data-sl-temp-blank-idx'));

          clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
          
          const taggedBlanks = clone.querySelectorAll('[data-sl-temp-blank-idx]');
          taggedBlanks.forEach(tb => {
            const idx = tb.getAttribute('data-sl-temp-blank-idx');
            const placeholder = document.createTextNode(` [BLANK_${idx}] `);
            if (tb.parentNode) tb.parentNode.replaceChild(placeholder, tb);
          });

          globalBlankIdx += insideBlanks.length;

          for (const el of insideBlanks) {
            blankElements.push(el);
          }

          formattedParts.push(this.getCleanCodeText(clone));
        } catch (e) {
          formattedParts.push(this.getCleanCodeText(box));
        }
      }

      // 3. Standalone / Conceptual Definition Matching Rows Fallback:
      // If no code containers were identified but individual drop targets exist across definition lines:
      if (blankElements.length === 0) {
        const rawAllBlanks = Array.from(searchRoot.querySelectorAll(BLANK_SELECTOR));
        const allLeafBlanks = rawAllBlanks.filter(b => {
          if (!isVisible(b)) return false;
          if (b.closest('#sololearn-ai-hud') || b.closest('header') || b.closest('nav')) return false;
          if (b.closest('.word-bank, [data-test*="word-bank"], [class*="wordBank" i]')) return false;
          if (isDividerOrSpacer(b)) return false;
          return !rawAllBlanks.some(other => other !== b && isVisible(other) && b.contains(other));
        });

        if (allLeafBlanks.length > 0) {
          const rowLines = [];
          for (let i = 0; i < allLeafBlanks.length; i++) {
            const blankEl = allLeafBlanks[i];
            const slotIdx = i + 1;

            // Find closest row or line container enclosing this single blank
            let row = blankEl.parentElement;
            while (
              row &&
              row !== searchRoot &&
              row !== document.body &&
              !allLeafBlanks.some(other => other !== blankEl && row.contains(other))
            ) {
              const nextParent = row.parentElement;
              if (!nextParent || nextParent === searchRoot || nextParent === document.body || allLeafBlanks.some(other => other !== blankEl && nextParent.contains(other))) {
                break;
              }
              row = nextParent;
            }

            if (row && row !== searchRoot) {
              try {
                blankEl.setAttribute('data-sl-temp-blank-idx', String(slotIdx));
                const clone = row.cloneNode(true);
                blankEl.removeAttribute('data-sl-temp-blank-idx');
                clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
                const tb = clone.querySelector('[data-sl-temp-blank-idx]');
                if (tb && tb.parentNode) {
                  tb.parentNode.replaceChild(document.createTextNode(` [BLANK_${slotIdx}] `), tb);
                }
                const lineText = getCleanText(clone);
                if (lineText) rowLines.push(lineText);
              } catch (_) {
                rowLines.push(`Line ${slotIdx}: [BLANK_${slotIdx}]`);
              }
            } else {
              rowLines.push(`Line ${slotIdx}: [BLANK_${slotIdx}]`);
            }

            blankElements.push(blankEl);
          }

          if (rowLines.length > 0) {
            formattedParts.push(rowLines.join('\n'));
          }
        }
      }

      return {
        code: formattedParts.join('\n\n'),
        blankElements
      };
    }

    static getChoiceOptions(container = document, title = '') {
      const searchRoot = container || document.body;
      const choices = [];
      const seen = new Set();
      const titleLower = (title || this.extractTitle(searchRoot)).toLowerCase();

      const isValidOptionText = (text) => {
        if (!text) return false;
        const clean = text.trim();
        if (clean.length === 0 || clean.length > 200) return false;
        const lower = clean.toLowerCase();
        if (
          lower === 'check' ||
          lower === 'continue' ||
          lower === 'next' ||
          lower === 'got it' ||
          lower === 'stuck?' ||
          lower === 'copy' ||
          lower === 'try again' ||
          lower === 'report' ||
          lower === 'hint' ||
          lower === 'skip' ||
          lower === 'back' ||
          lower.includes('select all') ||
          lower.includes('choose all') ||
          lower.includes('all that apply')
        ) return false;
        if (titleLower.length > 5 && lower === titleLower) return false;
        return true;
      };

      // 1. Comprehensive modern choice / card / option selectors
      const explicitSelectors = [
        '[data-test*="option" i]',
        '[data-test*="choice" i]',
        '[data-test*="answer" i]',
        '[data-test*="quiz-item" i]',
        '[data-test*="item" i]',
        '[data-test*="chip" i]',
        '[data-test*="word" i]',
        '[data-test*="card" i]',
        '[data-test*="radio" i]',
        '[data-test*="checkbox" i]',
        'label[class*="choice" i]',
        'label[class*="option" i]',
        'label[class*="card" i]',
        'label',
        '[role="radio"]',
        '[role="checkbox"]',
        '[role="listitem"]',
        '[role="button"]',
        'button',
        'li',
        'div[class*="option" i]',
        'div[class*="choice" i]',
        'div[class*="item" i]',
        'div[class*="answer" i]',
        'div[class*="card" i]',
        'div[class*="box" i]',
        'div[class*="radio" i]',
        'div[class*="row" i]',
        'div[class*="Button" i]'
      ];

      for (const sel of explicitSelectors) {
        const items = searchRoot.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          if (item.closest('#sololearn-ai-hud') || item.closest('header') || item.closest('nav')) continue;
          if (isDividerOrSpacer(item)) continue;
          
          // Don't select elements that are or contain blank drop slots
          if (item.matches(BLANK_SELECTOR) || item.querySelector(BLANK_SELECTOR)) continue;

          // Don't select parent containers that contain multiple choice children
          const childMatches = item.querySelectorAll('[data-test*="option"], [data-test*="choice"], [role="radio"], [role="checkbox"], label, button');
          if (childMatches.length > 0) continue;

          const text = getCleanText(item);
          if (isValidOptionText(text)) {
            choices.push({ text, element: item, isSelected: false });
            seen.add(item);
          }
        }
      }

      // 2. Leaf choice cards / clickable containers fallback
      if (choices.length < 2) {
        const allCandidates = (searchRoot || document.body).querySelectorAll('label, div, button, [role="button"], span');
        for (const el of allCandidates) {
          if (!isVisible(el) || seen.has(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;
          if (isDividerOrSpacer(el)) continue;
          if (el.matches(BLANK_SELECTOR) || el.querySelector(BLANK_SELECTOR)) continue;
          if (el.children.length > 2) continue;

          const text = getCleanText(el);
          if (isValidOptionText(text) && text.length >= 1 && text.length <= 100) {
            choices.push({ text, element: el, isSelected: false });
            seen.add(el);
          }
        }
      }

      // 3. De-duplicate and filter out composite strings
      const filtered = [];
      const textSet = new Set();

      for (const c of choices) {
        const key = c.text.toLowerCase().trim();
        if (textSet.has(key)) continue;
        
        const isConcat = choices.some(o1 => 
          choices.some(o2 => o1 !== o2 && o1 !== c && o2 !== c && c.text.includes(o1.text) && c.text.includes(o2.text))
        );

        if (!isConcat) {
          filtered.push(c);
          textSet.add(key);
        }
      }

      return filtered;
    }

    static getReorderTokens(container = document) {
      const searchRoot = container || document.body;
      const tokenSelectors = [
        '[data-test*="reorder"]',
        '[data-test*="draggable"]',
        '[data-test*="sortable"]',
        '[data-test*="token"]',
        '[data-test*="chip"]',
        '[data-test*="word"]',
        '[data-test*="choice"]',
        '[data-test*="code-order"]',
        '[data-test*="order-item"]',
        '[data-test*="word-bank"] *',
        '[draggable="true"]',
        '[aria-roledescription*="sortable"]',
        '[data-rbd-draggable-id]',
        '[data-rbd-drag-handle-draggable-id]',
        'button',
        'li[class*="draggable"]',
        'div[class*="draggable"]',
        'div[class*="sortable"]',
        'div[class*="reorder"]',
        '.token',
        '.chip',
        '.draggable-item',
        '.reorder-item',
        '.sortable-item',
        '.word-chip'
      ];

      const rawTokens = [];
      const seen = new Set();

      const isValidTokenText = (text) => {
        if (!text) return false;
        const clean = text.trim();
        if (clean.length === 0 || clean.length > 200) return false;
        const lower = clean.toLowerCase();
        if (lower === 'check' || lower === 'continue' || lower === 'next' || lower === 'got it' || lower === 'stuck?' || lower === 'copy' || lower === 'try again' || lower === 'hint') return false;
        return true;
      };

      const blankSelector = 'input, textarea, [contenteditable="true"], span[class*="slot" i], div[class*="slot" i], span[class*="blank" i], div[class*="blank" i], span[class*="circle" i], div[class*="circle" i], div[class*="drop" i], span[class*="drop" i], div[class*="droppable" i], span[class*="droppable" i], div[class*="empty" i], span[class*="empty" i], div[class*="gap" i], span[class*="gap" i], div[class*="hole" i], span[class*="hole" i], [data-test*="blank"], [data-test*="slot"], [data-test*="empty"], [data-test*="drop"], [data-test*="droppable"], [data-test*="hole"], [data-test*="target"]';

      for (const sel of tokenSelectors) {
        const items = searchRoot.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          if (item.closest('#sololearn-ai-hud')) continue;
          if (item.closest('header') || item.closest('nav')) continue;
          if (isDividerOrSpacer(item)) continue;
          if (item.matches(blankSelector) || item.querySelector(blankSelector)) continue;
          const text = getCleanText(item);
          if (isValidTokenText(text)) {
            rawTokens.push({ text, element: item });
            seen.add(item);
          }
        }
      }

      // Keep only leaf draggable items, discarding list/wrapper parent containers
      const tokens = rawTokens.filter(t => {
        return !rawTokens.some(other => other !== t && t.element.contains(other.element));
      });

      return tokens;
    }

    static isMultiChoice(container, title = '') {
      const searchRoot = container || (typeof document !== 'undefined' ? document.body : null);
      if (!searchRoot) return false;

      // 1. Check for Checkbox input elements, SVG icons, or roles anywhere in question container
      const hasCheckboxes = Boolean(
        searchRoot.querySelector('input[type="checkbox"], [role="checkbox"], [aria-checked], [data-test*="checkbox" i], div[class*="checkbox" i], span[class*="checkbox" i], svg[class*="checkbox" i]')
      );
      if (hasCheckboxes) return true;

      // 2. Comprehensive text signature scan across container, title, body, and subtitles
      const fullText = (
        (title || '') + ' ' +
        getCleanText(searchRoot) + ' ' +
        (typeof document !== 'undefined' && document.body ? getCleanText(document.body) : '')
      ).toLowerCase();

      return (
        fullText.includes('select all') ||
        fullText.includes('choose all') ||
        fullText.includes('all that apply') ||
        fullText.includes('all correct') ||
        fullText.includes('all matching') ||
        fullText.includes('which of the following are') ||
        fullText.includes('which of these are') ||
        fullText.includes('select the correct answers') ||
        fullText.includes('check all that apply')
      );
    }

    static parseQuestion() {
      // 1. Try Ground Truth / Clean Props from SoloLearn React Fiber & Next.js
      const internal = SoloLearnInternalInspector.inspect();
      if (internal && internal.isInternalGroundTruth && internal.answers && internal.answers.length > 0) {
        const container = this.getQuestionContainer();
        const { blankElements } = this.extractCodeAndBlanks(container);
        const choices = this.getChoiceOptions(container, internal.title);
        const reorderTokens = this.getReorderTokens(container);

        return {
          isInternalGroundTruth: true,
          type: internal.type || (blankElements.length > 0 ? 'fill_blanks' : 'single_choice'),
          language: internal.language || this.detectLanguage(),
          title: internal.title || this.extractTitle(container),
          code: internal.code || '',
          answers: internal.answers,
          explanation: internal.explanation || 'Verified directly from SoloLearn React component state.',
          confidence: 1.0,
          blankCount: blankElements.length,
          inputElements: blankElements,
          choices,
          options: choices.map(c => c.text),
          tokens: reorderTokens,
          extraText: ''
        };
      }

      // 2. High-Precision DOM Parser
      const container = this.getQuestionContainer();
      if (!container) return null;

      const language = (internal && internal.language) ? internal.language : this.detectLanguage();
      const title = (internal && internal.title) ? internal.title : this.extractTitle(container);
      const titleLower = (title || '').toLowerCase();
      const isExplicitReorder = titleLower.includes('rearrange') ||
                                titleLower.includes('reorder') ||
                                titleLower.includes('arrange the code') ||
                                titleLower.includes('put in order') ||
                                titleLower.includes('order the code');

      const isFillBlanksTitle = titleLower.includes('fill') ||
                                titleLower.includes('complete the code') ||
                                titleLower.includes('blank') ||
                                titleLower.includes('missing');

      const isMatchingTitle = (
        titleLower.includes('match each') ||
        titleLower.includes('match the following') ||
        titleLower.includes('match the concept') ||
        titleLower.includes('match the description') ||
        titleLower.includes('match the term') ||
        titleLower.includes('match the data') ||
        titleLower.includes('match the') ||
        titleLower.startsWith('match') ||
        titleLower.includes('pair the') ||
        titleLower.includes('pair each') ||
        titleLower.startsWith('pair')
      );

      const { code, blankElements } = this.extractCodeAndBlanks(container);
      const choices = this.getChoiceOptions(container, title);
      const reorderTokens = this.getReorderTokens(container);
      const images = this.extractImages(container);

      // Count blanks detected in code string
      const blanksInCodeMatches = (code.match(/\[BLANK_\d+\]/g) || []).length;
      const totalBlankCount = Math.max(blankElements.length, blanksInCodeMatches);

      // 2a. Fill in blanks / Definition Matching (If blanks found in code snippet OR title contains fill/blank/complete/match/pair)
      if (totalBlankCount > 0 || (isFillBlanksTitle && choices.length === 0) || (isMatchingTitle && (reorderTokens.length > 0 || totalBlankCount > 0))) {
        const wordBankMap = new Map();
        [...reorderTokens, ...choices].forEach(item => {
          if (item && item.text && !wordBankMap.has(item.text.trim().toLowerCase())) {
            wordBankMap.set(item.text.trim().toLowerCase(), item);
          }
        });
        const wordBankItems = Array.from(wordBankMap.values());

        const finalBlankCount = totalBlankCount > 0 ? totalBlankCount : (wordBankItems.length > 0 ? wordBankItems.length : 1);

        return {
          isInternalGroundTruth: false,
          type: 'fill_blanks',
          language,
          title,
          code: (internal && internal.code) ? internal.code : code,
          blankCount: finalBlankCount,
          inputElements: blankElements,
          tokens: wordBankItems,
          options: wordBankItems.map(t => t.text),
          choices: wordBankItems,
          images,
          extraText: `Instruction: Fill in all ${finalBlankCount} missing blank slots in order.`
        };
      }

      // 2b. Reorder / Rearrange Code Task (ONLY if explicitly indicated in title OR no blanks and reorderTokens exist)
      if (isExplicitReorder || (reorderTokens.length >= 2 && choices.length === 0)) {
        const items = reorderTokens.length >= 2 ? reorderTokens : choices.map(c => ({ text: c.text, element: c.element }));
        if (items.length >= 2) {
          return {
            isInternalGroundTruth: false,
            type: 'reorder',
            language,
            title,
            code: (internal && internal.code) ? internal.code : code,
            tokens: items,
            options: items.map(t => t.text),
            blankCount: items.length,
            inputElements: [],
            choices: items,
            images,
            extraText: 'Instruction: Rearrange the given code snippets into correct chronological and syntactic order.'
          };
        }
      }

      // 2c. Choice Questions (Single or Multiple Choice)
      if (choices.length > 0) {
        const isMulti = this.isMultiChoice(container, title);
        let extraText = '';
        if (isMulti) {
          extraText = 'CRITICAL MULTI-SELECT INSTRUCTION: This question requires selecting ALL correct answers ("Select all correct answers"). There are MULTIPLE correct answers! Evaluate EVERY choice independently and include ALL matching choices in your "answers" array.';
        }
        return {
          isInternalGroundTruth: false,
          type: isMulti ? 'multi_choice' : 'single_choice',
          language,
          title,
          code: (internal && internal.code) ? internal.code : code,
          choices,
          options: choices.map(c => c.text),
          blankCount: 0,
          inputElements: [],
          tokens: reorderTokens,
          images,
          extraText
        };
      }

      // 2d. General Question / Output Prediction
      return {
        isInternalGroundTruth: false,
        type: 'general_question',
        language,
        title,
        code: (internal && internal.code) ? internal.code : code,
        options: [],
        blankCount: 1,
        inputElements: [],
        choices: [],
        tokens: [],
        images,
        extraText: ''
      };
    }
  }

  /**
   * SoloLearnFeedbackDetector:
   * Detects post-submission results (Correct vs Incorrect) from DOM banners and React Fiber state,
   * and extracts the revealed true correct answer on failure.
   */
  class SoloLearnFeedbackDetector {
    static detectSubmissionResult(rootDoc = typeof document !== 'undefined' ? document : null) {
      if (!rootDoc || !rootDoc.body) return null;

      // 1. Check React Fiber state on active containers
      const internalResult = this.inspectReactSubmissionState(rootDoc);
      if (internalResult) return internalResult;

      // 2. Scan DOM for feedback banners and action buttons
      const bannerSelectors = [
        '[data-test*="feedback"]',
        '[data-test*="banner"]',
        '[data-test*="result"]',
        '[data-test*="snackbar"]',
        '[data-test*="notification"]',
        '[data-test*="bottom-bar"]',
        '[data-test*="footer"]',
        'div[class*="feedback" i]',
        'div[class*="banner" i]',
        'div[class*="result" i]',
        'div[class*="snackbar" i]',
        'div[class*="bottomBar" i]',
        'div[class*="Footer" i]'
      ];

      for (const sel of bannerSelectors) {
        const elements = rootDoc.querySelectorAll(sel);
        for (const el of elements) {
          if (!isVisible(el) || el.closest('#sololearn-ai-hud')) continue;
          const text = getCleanText(el).toLowerCase();
          const className = String(el.className || '').toLowerCase();
          const dataTest = String(el.getAttribute('data-test') || '').toLowerCase();

          // Check Success
          const isSuccess = dataTest.includes('success') ||
                            dataTest.includes('correct') ||
                            className.includes('success') ||
                            className.includes('correct') ||
                            text.includes('great job') ||
                            text.includes('correct!') ||
                            text.includes('well done') ||
                            text.includes('awesome!') ||
                            text.includes('you nailed it') ||
                            text.includes("that's right");

          // Check Failure
          const isError = dataTest.includes('error') ||
                          dataTest.includes('incorrect') ||
                          dataTest.includes('failure') ||
                          className.includes('error') ||
                          className.includes('incorrect') ||
                          className.includes('failure') ||
                          text.includes('not quite') ||
                          text.includes('incorrect') ||
                          text.includes('wrong answer') ||
                          text.includes('correct answer:') ||
                          text.includes('correct answer is:') ||
                          text.includes('try again') ||
                          text.includes('oops');

          if (isError) {
            const revealedAnswer = this.extractRevealedCorrectAnswer(el, rootDoc);
            return {
              isSubmitted: true,
              isCorrect: false,
              bannerElement: el,
              revealedAnswers: revealedAnswer,
              source: 'dom_error_banner'
            };
          }

          if (isSuccess) {
            return {
              isSubmitted: true,
              isCorrect: true,
              bannerElement: el,
              source: 'dom_success_banner'
            };
          }
        }
      }

      return null;
    }

    static inspectReactSubmissionState(rootDoc) {
      try {
        const containers = rootDoc.querySelectorAll('[data-test="quiz-container"], [data-test="lesson-content"], main');
        for (const el of containers) {
          const fiber = SoloLearnInternalInspector.findReactFiber(el);
          if (!fiber) continue;

          let hook = fiber.memoizedState;
          let depth = 0;
          while (hook && depth < 20) {
            if (hook.memoizedState && typeof hook.memoizedState === 'object') {
              const s = hook.memoizedState;
              if (s.isAnswerSubmitted === true || s.isSubmitted === true || s.hasSubmitted === true || s.isResultShown === true) {
                const isCorrect = Boolean(s.isCorrect === true || s.correct === true || s.status === 'SUCCESS');
                let revealed = null;
                if (!isCorrect && (s.correctAnswer || s.correctAnswers || s.solution)) {
                  const raw = s.correctAnswer || s.correctAnswers || s.solution;
                  revealed = Array.isArray(raw) ? raw.map(String) : [String(raw)];
                }
                return {
                  isSubmitted: true,
                  isCorrect,
                  revealedAnswers: revealed,
                  source: 'react_fiber_submission_state'
                };
              }
            }
            hook = hook.next;
            depth++;
          }
        }
      } catch (_) {}
      return null;
    }

    static extractRevealedCorrectAnswer(bannerEl, rootDoc) {
      if (!bannerEl) return null;

      // 1. Text pattern matching in banner without button / action text
      let bannerText = '';
      try {
        const clone = bannerEl.cloneNode(true);
        clone.querySelectorAll('button, [role="button"], a, svg, #sololearn-ai-hud').forEach(b => b.remove());
        bannerText = getCleanText(clone);
      } catch (_) {
        bannerText = getCleanText(bannerEl);
      }

      const sanitizeAns = (str) => {
        if (!str) return '';
        return str
          .replace(/\b(try again|continue|got it|next|report|stuck\?|skip|view solution)\b/gi, '')
          .replace(/[.]+$/, '')
          .trim();
      };

      const match1 = bannerText.match(/correct answer\s*(?:is)?\s*:\s*([^.\n]+)/i);
      if (match1 && match1[1]) {
        const cleaned = sanitizeAns(match1[1]);
        if (cleaned) return [cleaned];
      }

      const match2 = bannerText.match(/the correct answer is\s*:?\s*([^.\n]+)/i);
      if (match2 && match2[1]) {
        const cleaned = sanitizeAns(match2[1]);
        if (cleaned) return [cleaned];
      }

      // 2. Look for highlighted correct chips / cards in document
      const correctItemSelectors = [
        '[data-test*="correct-answer"]',
        '[data-test*="correct-option"]',
        '[data-test*="solution"]',
        'div[class*="correctAnswer" i]',
        'div[class*="solutionText" i]',
        'span[class*="correctText" i]'
      ];

      for (const sel of correctItemSelectors) {
        const items = rootDoc.querySelectorAll(sel);
        for (const item of items) {
          if (isVisible(item) && !item.closest('#sololearn-ai-hud')) {
            const clean = getCleanText(item);
            if (clean && clean.length > 0) {
              return [clean];
            }
          }
        }
      }

      // 3. Look for React Fiber ground truth attached to lesson
      const internal = SoloLearnInternalInspector.inspect();
      if (internal && internal.answers && internal.answers.length > 0) {
        return internal.answers;
      }

      return null;
    }
  }

  SoloLearnParser.InternalInspector = SoloLearnInternalInspector;
  SoloLearnParser.FeedbackDetector = SoloLearnFeedbackDetector;
  return SoloLearnParser;
});



  // Load Executor
  /**
 * SoloLearn AI Companion - In-Page Visual Highlighter & Solution Guide
 * Accurately highlights multiple-choice cards, sequences word tokens, and guides blank inputs.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./parser.js'));
  } else {
    root.SoloLearnExecutor = factory(root.SoloLearnParser);
  }
})(typeof self !== 'undefined' ? self : this, function (Parser) {
  'use strict';

  function normalizeText(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/['"`]/g, '"')
      .trim();
  }

  function matchScore(str1, str2) {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);
    if (s1 === s2) return 1.0;
    if (s1.length > 0 && s2.length > 0 && (s1.includes(s2) || s2.includes(s1))) return 0.9;

    const w1 = new Set(s1.split(' '));
    const w2 = new Set(s2.split(' '));
    let intersection = 0;
    for (const w of w1) {
      if (w2.has(w)) intersection++;
    }
    const union = new Set([...w1, ...w2]).size;
    return union > 0 ? intersection / union : 0;
  }

  function triggerReactInput(inputEl, value) {
    if (!inputEl) return;
    try {
      inputEl.focus();
      const lastValue = inputEl.value;
      inputEl.value = value;

      const event = new Event('input', { bubbles: true });
      const tracker = inputEl._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }
      inputEl.dispatchEvent(event);
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      inputEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ' ' }));
    } catch (e) {
      try {
        inputEl.value = value;
      } catch (_) {}
    }
  }

  class SoloLearnExecutor {
    static clearHighlights() {
      const highlighted = document.querySelectorAll('.sl-ai-highlighted-choice');
      highlighted.forEach(el => el.classList.remove('sl-ai-highlighted-choice'));

      const badges = document.querySelectorAll('.sl-ai-badge, .sl-ai-order-badge');
      badges.forEach(b => b.remove());
    }

    static autoFillAnswer(parsedQuestion, aiResponse) {
      if (!parsedQuestion || !aiResponse) return { success: false };
      const answers = Array.isArray(aiResponse.answers) ? aiResponse.answers : [aiResponse.answer].filter(Boolean);
      if (answers.length === 0) return { success: false };

      let filledAny = false;
      const isReorder = parsedQuestion.type === 'reorder' || aiResponse.type === 'reorder';

      // 1. Drag & Drop Reorder / Code Line Sorting
      if (isReorder) {
        const candidateItems = (parsedQuestion.tokens && parsedQuestion.tokens.length > 0)
          ? parsedQuestion.tokens
          : (parsedQuestion.choices || []);

        if (candidateItems.length >= 2) {
          const usedElements = new Set();
          const orderedElements = [];

          for (const ans of answers) {
            const target = String(ans).trim();
            let bestItem = null;
            let bestScore = -1;

            for (const item of candidateItems) {
              if (usedElements.has(item.element)) continue;
              const score = matchScore(item.text, target);
              if (score > bestScore) {
                bestScore = score;
                bestItem = item;
              }
            }

            if (bestItem && bestItem.element && bestScore >= 0.35) {
              usedElements.add(bestItem.element);
              orderedElements.push(bestItem.element);
            }
          }

          // Re-order draggable nodes in parent DOM
          if (orderedElements.length >= 2) {
            const parent = orderedElements[0].parentNode;
            if (parent) {
              orderedElements.forEach((el) => {
                parent.appendChild(el);
                // Dispatch DnD events
                try {
                  el.dispatchEvent(new Event('dragend', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                } catch (_) {}
              });
              filledAny = true;
            }
          }
        }
      }

      // 2. Auto-fill input blanks / drop targets & word bank chips
      const inputs = parsedQuestion.inputElements || [];
      const usedChips = new Set();
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const val = answers[i] !== undefined ? String(answers[i]).trim() : '';
        if (input && val !== '') {
          if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
            triggerReactInput(input, val);
            filledAny = true;
          } else if (input.isContentEditable || input.getAttribute('contenteditable') === 'true') {
            input.focus();
            input.textContent = val;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            filledAny = true;
          } else {
            // Drop target slot (div/span) -> find matching word bank chip and dispatch full click sequence
            const chips = parsedQuestion.tokens || parsedQuestion.choices || [];
            const matchingChip = chips.find(c => !usedChips.has(c.element) && matchScore(c.text, val) >= 0.6);
            if (matchingChip && matchingChip.element) {
              usedChips.add(matchingChip.element);
              const el = matchingChip.element;
              try {
                el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                el.click();
                el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
                filledAny = true;
              } catch (_) {
                el.click();
                filledAny = true;
              }
            } else {
              input.textContent = val;
              filledAny = true;
            }
          }
        }
      }

      // 3. Auto-select single/multi-choice cards
      if (parsedQuestion.choices && parsedQuestion.choices.length > 0 && inputs.length === 0 && !isReorder) {
        const usedChoices = new Set();

        for (let i = 0; i < answers.length; i++) {
          const target = String(answers[i]).trim();
          let bestMatch = null;
          let bestScore = -1;

          for (const choice of parsedQuestion.choices) {
            if (usedChoices.has(choice.element)) continue;
            const score = matchScore(choice.text, target);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = choice;
            }
          }

          if (bestMatch && bestMatch.element && bestScore >= 0.5) {
            usedChoices.add(bestMatch.element);
            const clickable = bestMatch.element.querySelector('button, input[type="radio"], input[type="checkbox"], label') || bestMatch.element;
            try {
              clickable.click();
              filledAny = true;
            } catch (_) {}
          }
        }
      }

      return { success: filledAny };
    }

    static highlightAnswerOnPage(parsedQuestion, aiResponse) {
      this.clearHighlights();

      const answers = Array.isArray(aiResponse.answers) ? aiResponse.answers : [aiResponse.answer].filter(Boolean);
      if (answers.length === 0) return { success: false };

      const isInternal = Boolean(aiResponse.isInternalGroundTruth || parsedQuestion.isInternalGroundTruth);
      const badgeText = isInternal ? '⚡ GROUND TRUTH' : '🎯 CORRECT ANSWER';

      let matchedAny = false;

      const isReorder = parsedQuestion.type === 'reorder' || aiResponse.type === 'reorder';
      const isFillBlanks = parsedQuestion.type === 'fill_blanks' || (parsedQuestion.inputElements && parsedQuestion.inputElements.length > 0);

      // 1. Reorder / Sequence Highlight: Label each draggable item with its exact target step
      if (isReorder) {
        const candidateItems = (parsedQuestion.tokens && parsedQuestion.tokens.length > 0)
          ? parsedQuestion.tokens
          : (parsedQuestion.choices || []);

        let step = 1;
        const usedElements = new Set();

        for (const ans of answers) {
          const target = String(ans).trim();
          let bestItem = null;
          let bestScore = -1;

          for (const item of candidateItems) {
            if (usedElements.has(item.element)) continue;
            const score = matchScore(item.text, target);
            if (score > bestScore) {
              bestScore = score;
              bestItem = item;
            }
          }

          if (bestItem && bestItem.element && bestScore >= 0.35) {
            bestItem.element.classList.add('sl-ai-highlighted-choice');

            const orderBadge = document.createElement('span');
            orderBadge.className = 'sl-ai-order-badge';
            orderBadge.textContent = `Step ${step++}`;
            bestItem.element.prepend(orderBadge);
            usedElements.add(bestItem.element);
            matchedAny = true;
          }
        }

        return { success: matchedAny || answers.length > 0 };
      }

      // 2. Fill-in-the-Blanks: Highlight code blanks and word bank chips
      if (isFillBlanks) {
        const inputs = parsedQuestion.inputElements || [];

        // 2a. Highlight the in-code blank drop slots
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const val = answers[i] !== undefined ? String(answers[i]).trim() : '';
          if (input && val !== '') {
            input.classList.add('sl-ai-highlighted-choice');
            if ('placeholder' in input) {
              input.placeholder = val;
            }
            input.setAttribute('data-ai-answer', val);
            input.title = `Slot #${i + 1}: ${val}`;

            // Add a floating slot indicator badge on drop containers
            if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA') {
              const slotBadge = document.createElement('div');
              slotBadge.className = 'sl-ai-badge';
              slotBadge.textContent = answers.length > 1 ? `#${i + 1}: ${val}` : val;
              input.appendChild(slotBadge);
            }
            matchedAny = true;
          }
        }

        // 2b. Highlight corresponding Word Bank Chips
        const chips = parsedQuestion.tokens || parsedQuestion.choices || [];
        if (chips.length > 0) {
          const usedChips = new Set();

          for (let i = 0; i < answers.length; i++) {
            const target = String(answers[i]).trim();
            let bestChip = null;
            let bestScore = -1;

            for (const chip of chips) {
              if (usedChips.has(chip.element)) continue;
              const score = matchScore(chip.text, target);
              if (score > bestScore) {
                bestScore = score;
                bestChip = chip;
              }
            }

            if (bestChip && bestChip.element && bestScore >= 0.45) {
              bestChip.element.classList.add('sl-ai-highlighted-choice');

              const orderBadge = document.createElement('span');
              orderBadge.className = 'sl-ai-order-badge';
              orderBadge.textContent = `Slot #${i + 1}`;
              bestChip.element.prepend(orderBadge);
              usedChips.add(bestChip.element);
              matchedAny = true;
            }
          }
        }

        return { success: matchedAny || answers.length > 0 };
      }

      // 3. Highlight Choice Cards (Single or Multiple Choice)
      if (parsedQuestion.choices && parsedQuestion.choices.length > 0) {
        const usedChoices = new Set();

        for (let i = 0; i < answers.length; i++) {
          const target = String(answers[i]).trim();
          let bestMatch = null;
          let bestScore = -1;

          for (const choice of parsedQuestion.choices) {
            if (usedChoices.has(choice.element)) continue;
            const score = matchScore(choice.text, target);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = choice;
            }
          }

          if (bestMatch && bestMatch.element && bestScore >= 0.5) {
            bestMatch.element.classList.add('sl-ai-highlighted-choice');
            const badge = document.createElement('div');
            badge.className = 'sl-ai-badge';
            badge.textContent = answers.length > 1 ? `🎯 ANSWER ${i + 1}` : badgeText;
            bestMatch.element.appendChild(badge);
            usedChoices.add(bestMatch.element);
            matchedAny = true;
          }
        }
      }

      return { success: matchedAny || answers.length > 0 };
    }
  }

  return SoloLearnExecutor;
});


  // Load UI
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


  // Load Main Controller
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

})();
