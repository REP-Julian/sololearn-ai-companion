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
