/**
 * SoloLearn AI Companion - In-Page Visual Highlighter & Solution Guide
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
    return str
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
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

    const w1 = new Set(s1.split(' '));
    const w2 = new Set(s2.split(' '));
    let intersection = 0;
    for (const w of w1) {
      if (w2.has(w)) intersection++;
    }
    const union = new Set([...w1, ...w2]).size;
    return union > 0 ? intersection / union : 0;
  }

  class SoloLearnExecutor {
    static clearHighlights() {
      const highlighted = document.querySelectorAll('.sl-ai-highlighted-choice');
      highlighted.forEach(el => el.classList.remove('sl-ai-highlighted-choice'));

      const badges = document.querySelectorAll('.sl-ai-badge, .sl-ai-order-badge');
      badges.forEach(b => b.remove());
    }

    static highlightAnswerOnPage(parsedQuestion, aiResponse) {
      this.clearHighlights();

      const answers = Array.isArray(aiResponse.answers) ? aiResponse.answers : [];
      if (answers.length === 0) return { success: false };

      // 1. Highlight Choice Cards if single/multi choice
      if (parsedQuestion.choices && parsedQuestion.choices.length > 0) {
        const targetAnswer = String(answers[0] || '').trim();
        let bestMatch = null;
        let bestScore = -1;

        for (const choice of parsedQuestion.choices) {
          const score = matchScore(choice.text, targetAnswer);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = choice;
          }
        }

        if (bestMatch && bestMatch.element) {
          bestMatch.element.classList.add('sl-ai-highlighted-choice');
          const badge = document.createElement('div');
          badge.className = 'sl-ai-badge';
          badge.innerText = '🎯 CORRECT ANSWER';
          bestMatch.element.appendChild(badge);
          return { success: true };
        }
      }

      // 2. Highlight Word Bank Chips if available
      const tokens = parsedQuestion.tokens || [];
      if (tokens.length > 0) {
        let step = 1;
        const usedElements = new Set();

        for (const ans of answers) {
          const target = String(ans).trim();
          let bestToken = null;
          let bestScore = -1;

          for (const t of tokens) {
            if (usedElements.has(t.element)) continue;
            const score = matchScore(t.text, target);
            if (score > bestScore) {
              bestScore = score;
              bestToken = t;
            }
          }

          if (bestToken && bestToken.element && bestScore >= 0.6) {
            bestToken.element.classList.add('sl-ai-highlighted-choice');

            const orderBadge = document.createElement('span');
            orderBadge.className = 'sl-ai-order-badge';
            orderBadge.innerText = String(step++);
            bestToken.element.prepend(orderBadge);
            usedElements.add(bestToken.element);
          }
        }
      }

      // 3. Highlight inputs with placeholder guides
      const inputs = parsedQuestion.inputElements || [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const val = answers[i] !== undefined ? String(answers[i]) : '';
        if (input && val !== '') {
          input.classList.add('sl-ai-highlighted-choice');
          if ('placeholder' in input) input.placeholder = val;
          input.title = `AI Answer: ${val}`;
        }
      }

      return { success: true };
    }
  }

  return SoloLearnExecutor;
});
