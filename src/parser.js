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

  /**
   * SoloLearnInternalInspector: Deeply inspects React Fiber nodes, React component props,
   * and Next.js page state for ground truth solutions or pristine question data.
   */
  class SoloLearnInternalInspector {
    static findReactFiber(domNode) {
      if (!domNode) return null;
      for (const key in domNode) {
        if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
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

    static traverseFiberForQuestionData(fiber, maxDepth = 30) {
      if (!fiber) return null;
      const queue = [{ node: fiber, depth: 0 }];
      const visited = new Set();

      while (queue.length > 0) {
        const { node, depth } = queue.shift();
        if (!node || depth > maxDepth || visited.has(node)) continue;
        visited.add(node);

        const props = node.memoizedProps || node.pendingProps;
        if (props && typeof props === 'object') {
          const inspected = this.extractQuestionFromProps(props);
          if (inspected) return inspected;
        }

        const state = node.memoizedState;
        if (state && typeof state === 'object') {
          const inspectedState = this.extractQuestionFromProps(state);
          if (inspectedState) return inspectedState;
        }

        if (node.child) queue.push({ node: node.child, depth: depth + 1 });
        if (node.return && depth < 10) queue.push({ node: node.return, depth: depth + 1 });
        if (node.sibling && depth < 10) queue.push({ node: node.sibling, depth: depth + 1 });
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
        props
      ];

      for (const cand of candidates) {
        if (!cand || typeof cand !== 'object') continue;

        // Check for ground truth answers inside this object
        let answers = null;
        let explanation = null;

        // 1. Direct answer field
        if (cand.correctAnswer !== undefined && cand.correctAnswer !== null) {
          answers = Array.isArray(cand.correctAnswer) ? cand.correctAnswer : [String(cand.correctAnswer)];
        } else if (cand.correct_answer !== undefined) {
          answers = Array.isArray(cand.correct_answer) ? cand.correct_answer : [String(cand.correct_answer)];
        } else if (Array.isArray(cand.answers) && cand.answers.length > 0 && typeof cand.answers[0] === 'string') {
          answers = cand.answers;
        } else if (Array.isArray(cand.correctAnswers) && cand.correctAnswers.length > 0) {
          answers = cand.correctAnswers.map(a => String(a.text || a));
        } else if (cand.solution !== undefined && cand.solution !== null) {
          if (Array.isArray(cand.solution)) answers = cand.solution.map(String);
          else if (typeof cand.solution === 'string') answers = [cand.solution];
          else if (typeof cand.solution === 'object' && cand.solution.answers) answers = cand.solution.answers;
        } else if (Array.isArray(cand.options)) {
          // Check options array with isCorrect flags
          const correctOpts = cand.options.filter(o => o && (o.isCorrect === true || o.correct === true));
          if (correctOpts.length > 0) {
            answers = correctOpts.map(o => String(o.text || o.title || o.value || o.label || ''));
          } else if (cand.correctOptionId !== undefined) {
            const match = cand.options.find(o => o.id === cand.correctOptionId);
            if (match) answers = [String(match.text || match.title || match.value || match.label || '')];
          } else if (cand.correctOptionIndex !== undefined && cand.options[cand.correctOptionIndex]) {
            const match = cand.options[cand.correctOptionIndex];
            answers = [String(match.text || match.title || match.value || match.label || '')];
          }
        }

        if (answers && answers.length > 0) {
          explanation = cand.explanation || cand.hint || 'Extracted directly from SoloLearn React Internal State.';
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
      // 1. Check window.__NEXT_DATA__
      try {
        if (typeof window !== 'undefined' && window.__NEXT_DATA__ && window.__NEXT_DATA__.props) {
          const pageProps = window.__NEXT_DATA__.props.pageProps;
          if (pageProps) {
            const fromNext = this.extractQuestionFromProps(pageProps);
            if (fromNext && fromNext.isInternalGroundTruth) return fromNext;
          }
        }
      } catch (e) {}

      // 2. Check React Fiber from active quiz elements
      const targetSelectors = [
        '[data-test="lesson-content"]',
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
        'main',
        '#root',
        '#__next'
      ];

      for (const sel of targetSelectors) {
        const el = document.querySelector(sel);
        if (!el) continue;

        // Check direct props
        const props = this.findReactProps(el);
        if (props) {
          const extracted = this.extractQuestionFromProps(props);
          if (extracted && extracted.isInternalGroundTruth) return extracted;
        }

        // Check fiber tree
        const fiber = this.findReactFiber(el);
        if (fiber) {
          const extracted = this.traverseFiberForQuestionData(fiber);
          if (extracted && extracted.isInternalGroundTruth) return extracted;
        }
      }

      return null;
    }
  }

  class SoloLearnParser {
    static detectLanguage() {
      const url = (typeof window !== 'undefined' ? window.location.href : '').toLowerCase();
      const pageTitle = (typeof document !== 'undefined' ? document.title : '').toLowerCase();
      const headerText = (typeof document !== 'undefined' && document.body ? getCleanText(document.body.querySelector('header, nav, [data-test="course-title"]') || document.body).slice(0, 500) : '').toLowerCase();

      const combined = `${url} ${pageTitle} ${headerText}`;

      if (combined.includes('c-sharp') || combined.includes('csharp') || combined.includes('c#')) return 'C# (.NET)';
      if (combined.includes('c-plus-plus') || combined.includes('cpp') || combined.includes('c++')) return 'C++';
      if (combined.includes('python')) return 'Python';
      if (combined.includes('javascript') || combined.includes('/js') || combined.includes(' js ')) return 'JavaScript';
      if (combined.includes('typescript') || combined.includes('/ts') || combined.includes(' ts ')) return 'TypeScript';
      if (combined.includes('java') && !combined.includes('javascript')) return 'Java';
      if (combined.includes('sql') || combined.includes('database')) return 'SQL';
      if (combined.includes('html') || combined.includes('web-development')) return 'HTML';
      if (combined.includes('css')) return 'CSS';
      if (combined.includes('kotlin')) return 'Kotlin';
      if (combined.includes('swift')) return 'Swift';
      if (combined.includes('php')) return 'PHP';
      if (combined.includes('go-') || combined.includes('/go') || combined.includes('golang')) return 'Go';
      if (combined.includes('ruby')) return 'Ruby';

      return 'C# (.NET)';
    }

    static getQuestionContainer() {
      const candidateSelectors = [
        '[data-test="lesson-content"]',
        '[data-test="quiz-container"]',
        '[data-test="quiz-wrapper"]',
        '[data-test="practice-container"]',
        '[data-test="exercise-container"]',
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
        'h1', 'h2', 'h3',
        '.question-title', '.quiz-task', '.task-title', '.instruction'
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

      for (const sel of titleSelectors) {
        const elements = container.querySelectorAll(sel);
        for (const el of elements) {
          if (!isVisible(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;
          const cleaned = cleanTitleText(getCleanText(el));
          if (cleaned.length > 5) {
            return cleaned;
          }
        }
      }

      const paragraphs = container.querySelectorAll('p, span, div, h4, h5');
      for (const p of paragraphs) {
        if (!isVisible(p)) continue;
        if (p.closest('header') || p.closest('nav') || p.closest('button') || p.closest('#sololearn-ai-hud')) continue;
        const raw = getCleanText(p);
        const cleaned = cleanTitleText(raw);
        if (
          cleaned.length > 8 &&
          cleaned.length < 350 &&
          (cleaned.toLowerCase().includes('rearrange') ||
           cleaned.toLowerCase().includes('reorder') ||
           cleaned.toLowerCase().includes('drag and drop') ||
           cleaned.toLowerCase().includes('arrange the code') ||
           cleaned.toLowerCase().includes('put in order') ||
           cleaned.toLowerCase().includes('runs as long') ||
           cleaned.toLowerCase().includes('while loop') ||
           cleaned.toLowerCase().includes('for loop') ||
           cleaned.toLowerCase().includes('fill in') ||
           cleaned.toLowerCase().includes('create a valid') ||
           cleaned.toLowerCase().includes('write the shorthand') ||
           cleaned.toLowerCase().includes('declare a variable') ||
           cleaned.toLowerCase().includes('what is the') ||
           cleaned.toLowerCase().includes('what will be') ||
           cleaned.toLowerCase().includes('statement'))
        ) {
          return cleaned;
        }
      }

      return 'SoloLearn Activity';
    }

    static extractCodeAndBlanks(container = document) {
      const candidateBoxes = Array.from(container.querySelectorAll(
        'pre, code, div[class*="code"], div[class*="Code"], div[style*="monospace"], div[class*="editor"], div[class*="snippet"], [data-test*="code"]'
      ));

      // Keep only outermost code containers to prevent double-counting child <code> inside parent <div data-test="code-snippet">
      const topBoxes = candidateBoxes.filter(box => {
        if (!isVisible(box)) return false;
        return !candidateBoxes.some(parent => parent !== box && isVisible(parent) && parent.contains(box));
      });

      const codeBoxes = [];
      for (const box of topBoxes) {
        const text = getCleanText(box);
        if (text.length > 1 || box.querySelector('input, [contenteditable="true"], div[class*="slot"], span[class*="slot"], div[class*="blank"], span[class*="blank"], [data-test*="blank"], [data-test*="slot"]')) {
          codeBoxes.push(box);
        }
      }

      const blankElements = [];
      let globalBlankIdx = 1;
      const formattedParts = [];

      const blankSelector = 'input, [contenteditable="true"], span[class*="slot"], div[class*="slot"], span[class*="blank"], div[class*="blank"], span[class*="circle"], div[class*="circle"], div[class*="drop"], span[class*="drop"], [data-test*="blank"], [data-test*="slot"], [data-test*="empty-slot"], [data-test*="drop-target"]';

      for (let i = 0; i < codeBoxes.length; i++) {
        const box = codeBoxes[i];
        const insideBlanks = box.querySelectorAll(blankSelector);

        try {
          const clone = box.cloneNode(true);
          clone.querySelectorAll('#sololearn-ai-hud, .sl-ai-badge, .sl-ai-order-badge').forEach(b => b.remove());
          const cloneBlanks = clone.querySelectorAll(blankSelector);

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

    static getChoiceOptions(container = document, title = '') {
      const choices = [];
      const seen = new Set();
      const titleLower = (title || this.extractTitle(container)).toLowerCase();

      const isValidOptionText = (text) => {
        if (!text) return false;
        const clean = text.trim();
        if (clean.length === 0 || clean.length > 120) return false;
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
          lower === 'hint'
        ) return false;
        if (titleLower.length > 5 && lower.includes(titleLower.slice(0, 25))) return false;
        return true;
      };

      // 1. Check explicit option/choice selectors
      const explicitSelectors = [
        '[data-test*="option"]',
        '[data-test*="choice"]',
        '[data-test*="answer"]',
        '[data-test*="quiz-item"]',
        '[role="radio"]',
        '[role="checkbox"]',
        '.quiz-option',
        '.choice-item'
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

      // 2. Leaf choice cards
      if (choices.length < 2) {
        const allDivs = container.querySelectorAll('div, button, li');
        for (const el of allDivs) {
          if (!isVisible(el) || seen.has(el)) continue;
          if (el.closest('header') || el.closest('nav') || el.closest('#sololearn-ai-hud')) continue;

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
        '[data-test*="reorder"]',
        '[data-test*="draggable"]',
        '[data-test*="sortable"]',
        '[data-test*="token"]',
        '[data-test*="chip"]',
        '[data-test*="code-order"]',
        '[data-test*="order-item"]',
        '[data-test*="word-bank"] *',
        '[draggable="true"]',
        '[aria-roledescription*="sortable"]',
        '[data-rbd-draggable-id]',
        '[data-rbd-drag-handle-draggable-id]',
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

      for (const sel of tokenSelectors) {
        const items = container.querySelectorAll(sel);
        for (const item of items) {
          if (!isVisible(item) || seen.has(item)) continue;
          if (item.closest('#sololearn-ai-hud')) continue;
          if (item.closest('header') || item.closest('nav')) continue;
          const text = getCleanText(item);
          if (text.length > 0 && text.length < 200) {
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
      const textToCheck = (title + ' ' + getCleanText(container)).toLowerCase();
      return textToCheck.includes('select all') || textToCheck.includes('choose all') || textToCheck.includes('all that apply');
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
      const isReorderTask = titleLower.includes('rearrange') ||
                            titleLower.includes('reorder') ||
                            titleLower.includes('drag and drop') ||
                            titleLower.includes('arrange the code') ||
                            titleLower.includes('put in order') ||
                            titleLower.includes('order the code');

      const { code, blankElements } = this.extractCodeAndBlanks(container);
      const choices = this.getChoiceOptions(container, title);
      const reorderTokens = this.getReorderTokens(container);

      // 2a. Reorder / Rearrange Code Task (High priority if title specifies rearrange)
      if (isReorderTask || reorderTokens.length >= 2) {
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
            extraText: 'Instruction: Rearrange the given code snippets into correct chronological and syntactic order.'
          };
        }
      }

      // 2b. Fill in blanks
      if (blankElements.length > 0) {
        return {
          isInternalGroundTruth: false,
          type: 'fill_blanks',
          language,
          title,
          code: (internal && internal.code) ? internal.code : code,
          blankCount: blankElements.length,
          inputElements: blankElements,
          tokens: reorderTokens,
          options: reorderTokens.map(t => t.text),
          choices,
          extraText: ''
        };
      }

      // 2c. Choice Questions (Single or Multiple Choice)
      if (choices.length > 0) {
        const isMulti = this.isMultiChoice(container, title);
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
          extraText: ''
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
        extraText: ''
      };
    }
  }

  SoloLearnParser.InternalInspector = SoloLearnInternalInspector;
  return SoloLearnParser;
});
