/**
 * Script to bundle all modules into a standalone Tampermonkey / Violentmonkey Userscript.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

const header = `// ==UserScript==
// @name         SoloLearn AI Solver (OpenRouter Automation)
// @namespace    https://github.com/antigravity/sololearn-ai-solver
// @version      1.0.0
// @description  Flawless AI-powered automation solver for SoloLearn activities using OpenRouter models (Claude 3.5 Sonnet, GPT-4o, DeepSeek, Gemini).
// @author       Antigravity
// @match        https://*.sololearn.com/*
// @match        https://sololearn.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

/**
 * SoloLearn AI Automation Solver - Standalone Userscript
 * Built for Tampermonkey, Violentmonkey, and Greasemonkey.
 */
`;

const cssContent = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');
const configContent = fs.readFileSync(path.join(srcDir, 'config.js'), 'utf8');
const openrouterContent = fs.readFileSync(path.join(srcDir, 'openrouter.js'), 'utf8');
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

  // Load OpenRouter Client
  ${openrouterContent}

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
