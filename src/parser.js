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
          if (cleaned.length > 5 && !cleaned.toLowerCase().includes('sololearn is a platform')) {
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
        if (cleaned.length >= 8 && cleaned.length <= 250 && !cleaned.toLowerCase().includes('sololearn is a platform')) {
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

    static extractCodeAndBlanks(container = document) {
      const searchRoot = container || document.body;
      const candidateBoxes = Array.from(searchRoot.querySelectorAll(
        'pre, code, div[class*="code" i], div[class*="Code"], div[style*="monospace"], div[class*="editor" i], div[class*="snippet" i], div[class*="syntax" i], div[class*="highlight" i], div[class*="fitb" i], [data-test*="code"], [data-test*="snippet"], [data-test*="fitb"]'
      ));

      // Fallback: Scan all div/section elements if candidateBoxes is empty
      if (candidateBoxes.length === 0) {
        const allDivs = Array.from((document.body || searchRoot).querySelectorAll('div, section, article, pre'));
        for (const div of allDivs) {
          if (!isVisible(div) || div.closest('#sololearn-ai-hud') || div.closest('header') || div.closest('nav')) continue;
          const text = getCleanText(div);
          if (
            (text.includes(';') || text.includes('{') || text.includes('System.out') || text.includes('Console.Write') || text.includes('def ') || text.includes('public ') || text.includes('class ') || text.includes('String ') || text.includes('int ') || text.includes('SELECT ') || text.includes('FROM ')) &&
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

        // Filter out parent drop containers that contain child drop containers
        let insideBlanks = rawInsideBlanks.filter(b => {
          if (!isVisible(b)) return false;
          if (b.closest('#sololearn-ai-hud')) return false;
          return !rawInsideBlanks.some(other => other !== b && b.contains(other));
        });

        // Structural Blank Fallback: Find visually empty slot elements within the code box
        if (insideBlanks.length === 0) {
          const emptyLeaves = Array.from(box.querySelectorAll('span, div, button, em, i, a')).filter(el => {
            if (!isVisible(el) || el.closest('#sololearn-ai-hud')) return false;
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
        titleLower.includes('pair the') ||
        titleLower.includes('pair each')
      );

      const { code, blankElements } = this.extractCodeAndBlanks(container);
      const choices = this.getChoiceOptions(container, title);
      const reorderTokens = this.getReorderTokens(container);

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

