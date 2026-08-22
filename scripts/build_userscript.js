/**
 * Script to bundle all modules into a standalone Tampermonkey / Violentmonkey Userscript.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

const header = `// ==UserScript==
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
`;

const cssContent = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');
const configContent = fs.readFileSync(path.join(srcDir, 'config.js'), 'utf8');
const memoryContent = fs.readFileSync(path.join(srcDir, 'memory.js'), 'utf8');
const mistralContent = fs.readFileSync(path.join(srcDir, 'mistral.js'), 'utf8');
const geminiContent = fs.readFileSync(path.join(srcDir, 'providers', 'gemini.js'), 'utf8');
const huggingfaceContent = fs.readFileSync(path.join(srcDir, 'providers', 'huggingface.js'), 'utf8');
const consensusContent = fs.readFileSync(path.join(srcDir, 'consensus.js'), 'utf8');
const parserContent = fs.readFileSync(path.join(srcDir, 'parser.js'), 'utf8');
const executorContent = fs.readFileSync(path.join(srcDir, 'executor.js'), 'utf8');
const uiContent = fs.readFileSync(path.join(srcDir, 'ui.js'), 'utf8');
const mainContent = fs.readFileSync(path.join(srcDir, 'main.js'), 'utf8');

const injectionWrapper = `
(function() {
  'use strict';

  // Inject CSS Styles
  const styleEl = document.createElement('style');
  styleEl.id = 'sololearn-ai-styles';
  styleEl.textContent = ${JSON.stringify(cssContent)};
  (document.head || document.documentElement).appendChild(styleEl);

  // Load Config
  ${configContent}

  // Load Adaptive Learning & Self-Correction Memory Engine
  ${memoryContent}

  // Load Mistral AI Provider
  ${mistralContent}

  // Load Google AI Studio (Gemini) Provider
  ${geminiContent}

  // Load Hugging Face Provider
  ${huggingfaceContent}

  // Load Multi-Provider Consensus Engine
  ${consensusContent}

  // Load Parser
  ${parserContent}

  // Load Executor
  ${executorContent}

  // Load UI
  ${uiContent}

  // Load Main Controller
  ${mainContent}
})();
`;

const fullUserscript = `${header}\n${injectionWrapper}`;
const outputPath = path.join(rootDir, 'sololearn-ai-solver.user.js');

fs.writeFileSync(outputPath, fullUserscript, 'utf8');
console.log(`Userscript generated successfully: ${outputPath}`);
