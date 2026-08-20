/**
 * SoloLearn AI Companion - Precision Leaf Choice Parser Engine
 * Guarantees zero combination of parent containers and extracts strictly isolated choice cards (e.g. "false", "true").
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

  class SoloLearnParser {
    static detectLanguage() {
      const pageText = (
        (document.title || '') + ' ' +
        (window.location.href || '') + ' ' +
        (document.body ? getCleanText(document.body.querySelector('header') || document.body).slice(0, 500) : '')
      ).toLowerCase();

      if (pageText.includes('c#') || pageText.includes('csharp') || pageText.includes('c-sharp')) return 'C# (.NET)';
      if (pageText.includes('c++') || pageText.includes('cpp')) return 'C++';
      if (pageText.includes('javascript') || pageText.includes(' js ') || pageText.includes('/js')) return 'JavaScript';
      if (pageText.includes('typescript') || pageText.includes(' ts ')) return 'TypeScript';
      if (pageText.includes('python')) return 'Python';
      if (pageText.includes('java') && !pageText.includes('javascript')) return 'Java';
      if (pageText.includes('sql')) return 'SQL';
      if (pageText.includes('html')) return 'HTML';
      if (pageText.includes('css')) return 'CSS';
      if (pageText.includes('kotlin')) return 'Kotlin';
      if (pageText.includes('swift')) return 'Swift';
      if (pageText.includes('php')) return 'PHP';

      return 'C# (.NET)';
    }

    static getQuestionContainer() {
      const candidateSelectors = [
        '[data-test="lesson-content"]',
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
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
        'h1', 'h2', 'h3',
        '.question-title', '.quiz-task', '.task-title', '.instruction'
      ];

      for (const sel of titleSelectors) {
        const elements = container.querySelectorAll(sel);
        for (const el of elements) {
          if (!isVisible(el)) continue;
          if (el.closest('header') || el.closest('nav')) continue;
          const text = getCleanText(el);
          if (text.length > 3 && !text.toLowerCase().includes('stuck?')) {
            return text;
          }
        }
      }

      const paragraphs = container.querySelectorAll('p, span, div, h4, h5');
      for (const p of paragraphs) {
        if (!isVisible(p)) continue;
        if (p.closest('header') || p.closest('nav') || p.closest('button')) continue;
        const text = getCleanText(p);
        if (
          text.length > 6 &&
          text.length < 300 &&
          (text.includes('?') ||
           text.toLowerCase().includes('runs as long') ||
           text.toLowerCase().includes('while loop') ||
           text.toLowerCase().includes('for loop') ||
           text.toLowerCase().includes('fill in') ||
           text.toLowerCase().includes('create a valid') ||
           text.toLowerCase().includes('write the shorthand') ||
           text.toLowerCase().includes('declare a variable') ||
           text.toLowerCase().includes('what is the') ||
           text.toLowerCase().includes('statement'))
        ) {
          return text;
        }
      }

      return 'SoloLearn Activity';
    }

    static extractCodeAndBlanks(container = document) {
      const codeBoxes = [];
      const seen = new Set();

      const candidateBoxes = container.querySelectorAll('pre, code, div[class*="code"], div[class*="Code"], div[style*="monospace"], div[class*="editor"]');
      for (const box of candidateBoxes) {
        if (!isVisible(box) || seen.has(box)) continue;
        const text = getCleanText(box);
        if (text.length > 1 || box.querySelector('input, [contenteditable="true"], div[class*="slot"], span[class*="slot"], div[class*="blank"], span[class*="blank"]')) {
          codeBoxes.push(box);
          seen.add(box);
        }
      }

      const blankElements = [];
      let globalBlankIdx = 1;
      const formattedParts = [];

      for (let i = 0; i < codeBoxes.length; i++) {
        const box = codeBoxes[i];
        const insideBlanks = box.querySelectorAll('input, [contenteditable="true"], span[class*="slot"], div[class*="slot"], span[class*="blank"], div[class*="blank"], span[class*="circle"], div[class*="circle"], div[class*="drop"], span[class*="drop"]');

        try {
          const clone = box.cloneNode(true);
          clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
          const cloneBlanks = clone.querySelectorAll('input, [contenteditable="true"], span[class*="slot"], div[class*="slot"], span[class*="blank"], div[class*="blank"], span[class*="circle"], div[class*="circle"], div[class*="drop"], span[class*="drop"]');

          cloneBlanks.forEach((b) => {
            const placeholder = document.createTextNode(` [BLANK_${globalBlankIdx++}] `);
            if (b.parentNode) b.parentNode.replaceChild(placeholder, b);
          });

          for (const el of insideBlanks) {
            blankElements.push(el);
          }

          formattedParts.push(getCleanText(clone));
        } catch (e) {
          formattedParts.push(getCleanText(box));
        }
      }

      return {
        code: formattedParts.join('\n\n'),
        blankElements
      };
    }

    /**
     * Precision Choice Card Extractor: Strictly separates options into distinct items (e.g. ["false", "true"])
     */
    static getChoiceOptions(container = document, title = '') {
      const choices = [];
      const seen = new Set();
      const titleLower = (title || this.extractTitle(container)).toLowerCase();

      const isValidOptionText = (text) => {
        if (!text) return false;
        const clean = text.trim();
        if (clean.length === 0 || clean.length > 80) return false;
        const lower = clean.toLowerCase();
        if (lower === 'check' || lower === 'continue' || lower === 'next' || lower === 'got it' || lower === 'stuck?' || lower === 'copy' || lower === 'try again') return false;
        if (titleLower.length > 5 && lower.includes(titleLower.slice(0, 20))) return false;
        return true;
      };

      // 1. Check explicit option/choice selectors
      const explicitSelectors = [
        '[data-test*="option"]',
        '[data-test*="choice"]',
        '[data-test*="answer"]',
        '[role="radio"]',
        '[role="checkbox"]'
      ];

      for (const sel of explicitSelectors) {
        const items = container.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          const text = getCleanText(item);
          if (isValidOptionText(text)) {
            choices.push({ text, element: item, isSelected: false });
            seen.add(item);
          }
        }
      }

      // 2. Find clean leaf cards (like the "false" and "true" buttons on screen)
      if (choices.length < 2) {
        const allDivs = container.querySelectorAll('div, button, li');
        for (const el of allDivs) {
          if (!isVisible(el) || seen.has(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;

          // Must not contain other container divs
          if (el.querySelectorAll('div, button').length > 0) continue;

          const text = getCleanText(el);
          if (isValidOptionText(text)) {
            choices.push({ text, element: el, isSelected: false });
            seen.add(el);
          }
        }
      }

      // 3. De-duplicate and filter out combined text
      const filtered = [];
      const textSet = new Set();

      for (const c of choices) {
        if (textSet.has(c.text.toLowerCase())) continue;
        
        // Ensure this text is not a concatenation of other options (e.g. "falsetrue")
        const isConcat = choices.some(o1 => 
          choices.some(o2 => o1 !== o2 && o1 !== c && o2 !== c && c.text.includes(o1.text) && c.text.includes(o2.text))
        );

        if (!isConcat) {
          filtered.push(c);
          textSet.add(c.text.toLowerCase());
        }
      }

      return filtered;
    }

    static getReorderTokens(container = document) {
      const tokenSelectors = [
        '[data-test="token-item"]',
        '[data-test="chip-item"]',
        '[data-test="draggable-item"]',
        '.token',
        '.chip'
      ];

      const tokens = [];
      const seen = new Set();

      for (const sel of tokenSelectors) {
        const items = container.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          const text = getCleanText(item);
          if (text.length > 0 && text.length < 40) {
            tokens.push({ text, element: item });
            seen.add(item);
          }
        }
      }
      return tokens;
    }

    static isMultiChoice(container, title = '') {
      const textToCheck = (title + ' ' + getCleanText(container)).toLowerCase();
      return textToCheck.includes('select all') || textToCheck.includes('choose all');
    }

    static parseQuestion() {
      const container = this.getQuestionContainer();
      if (!container) return null;

      const language = this.detectLanguage();
      const title = this.extractTitle(container);
      const { code, blankElements } = this.extractCodeAndBlanks(container);
      const choices = this.getChoiceOptions(container, title);
      const reorderTokens = this.getReorderTokens(container);

      // 1. Fill in blanks
      if (blankElements.length > 0) {
        return {
          type: 'fill_blanks',
          language,
          title,
          code,
          blankCount: blankElements.length,
          inputElements: blankElements,
          tokens: reorderTokens,
          options: reorderTokens.map(t => t.text),
          extraText: ''
        };
      }

      // 2. Choice Questions (Multiple choice or Single choice)
      if (choices.length > 0) {
        const isMulti = this.isMultiChoice(container, title);
        return {
          type: isMulti ? 'multi_choice' : 'single_choice',
          language,
          title,
          code,
          choices,
          options: choices.map(c => c.text),
          blankCount: 0,
          extraText: ''
        };
      }

      // 3. Reorder Tokens
      if (reorderTokens.length > 0) {
        return {
          type: 'reorder',
          language,
          title,
          code,
          tokens: reorderTokens,
          options: reorderTokens.map(t => t.text),
          blankCount: reorderTokens.length,
          extraText: ''
        };
      }

      return {
        type: 'general_question',
        language,
        title,
        code,
        options: [],
        blankCount: 1,
        extraText: ''
      };
    }
  }

  return SoloLearnParser;
});
