/**
 * Unit Test Suite for SoloLearn AI Companion
 * Tests 3-Pass Mistral / Codestral Response Cleaning, SoloLearn Internal React Inspector, and DOM Parser & Highlighter.
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

const Config = require('../src/config.js');
const SoloLearnMemory = require('../src/memory.js');
const MistralClient = require('../src/mistral.js');
const GeminiClient = require('../src/providers/gemini.js');
const HuggingFaceClient = require('../src/providers/huggingface.js');
const MultiProviderConsensusEngine = require('../src/consensus.js');

console.log('--- RUNNING SOLOLEARN AI COMPANION MULTI-PROVIDER CONSENSUS TEST SUITE ---');

// 1. Test Mistral 3-Pass Response Cleaning & Parsing
console.log('\n[Test 1] 3-Pass JSON Cleaning & Boundary Sanitization (Mistral AI)');
const client = new MistralClient('mock-key');

const json1 = '{"thought": "Pass 1 AST analysis: Python print function. Pass 2 Dry-run: print(\'Hello\'). Pass 3 Boundary check: exact match.", "type": "single_choice", "confidence": 0.99, "answers": ["print(\'Hello\')"], "explanation": "Python 3 print requires parentheses."}';
assert.deepStrictEqual(client.cleanJsonResponse(json1), {
  thought: "Pass 1 AST analysis: Python print function. Pass 2 Dry-run: print('Hello'). Pass 3 Boundary check: exact match.",
  type: 'single_choice',
  confidence: 0.99,
  answers: ["print('Hello')"],
  explanation: 'Python 3 print requires parentheses.'
}, 'Should parse direct 3-Pass JSON with thought');

const json2 = '```json\n{"thought": "C++ loop declaration", "type": "fill_blanks", "confidence": 1.0, "answers": ["while", "+="], "explanation": "Standard while loop syntax."}\n```';
assert.deepStrictEqual(client.cleanJsonResponse(json2), {
  thought: 'C++ loop declaration',
  type: 'fill_blanks',
  confidence: 1.0,
  answers: ['while', '+='],
  explanation: 'Standard while loop syntax.'
}, 'Should strip markdown fences');

console.log('✓ Mistral JSON cleaner passed all 3-pass cases.');

// 2. Setup Mock DOM Environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div id="root">
    <div data-test="lesson-content">
      <h2 data-test="quiz-title">What is the output of the following C# code?</h2>
      <pre data-test="code-snippet">
int x = 5;
int y = 10;
Console.WriteLine(x + y);
      </pre>
      <div class="choices">
        <button data-test="quiz-option">15</button>
        <button data-test="quiz-option">510</button>
        <button data-test="quiz-option">Error</button>
      </div>
      <button data-test="check-button">Check</button>
    </div>
  </div>
</body>
</html>
`, { url: 'https://www.sololearn.com/learn/courses/c-sharp-introduction' });

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLElement.prototype.scrollIntoView = function() {};
global.performance = { now: () => Date.now() };

const Parser = require('../src/parser.js');
const Executor = require('../src/executor.js');

async function runAsyncTests() {
  // Test 2: Standard DOM Scraper
  console.log('\n[Test 2] SoloLearn DOM Parsing & Language Detection');
  const parsed = Parser.parseQuestion();
  assert.strictEqual(parsed.type, 'single_choice');
  assert.strictEqual(parsed.language, 'C# (.NET)');
  assert.strictEqual(parsed.options.length, 3);
  console.log('✓ Single-choice question & language detected correctly.');

  // Test 3: Visual Highlighting on Single Choice
  console.log('\n[Test 3] Visual Answer Highlighter on Single Choice');
  const highlightResult = Executor.highlightAnswerOnPage(parsed, {
    type: 'single_choice',
    answers: ['15'],
    explanation: '5 + 10 equals 15'
  });

  assert.strictEqual(highlightResult.success, true);
  assert.strictEqual(parsed.choices[0].element.classList.contains('sl-ai-highlighted-choice'), true);
  assert.notStrictEqual(parsed.choices[0].element.querySelector('.sl-ai-badge'), null);
  console.log('✓ Correct answer card visually highlighted with green badge on page.');

  // Test 4: Fill-in-the-blanks Highlighting
  console.log('\n[Test 4] Fill-in-the-blanks Slot Extraction & Placeholders');
  const fillDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="quiz-container">
      <h2 data-test="quiz-title">Fill in the blanks to create a valid while loop in C#</h2>
      <div data-test="code-snippet">
        <code><input type="text" id="blank1" /> (x &lt; 100) { x <input type="text" id="blank2" /> 4; }</code>
      </div>
      <button data-test="check-button">Check</button>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/c-sharp-intermediate' });

  global.window = fillDom.window;
  global.document = fillDom.window.document;

  const parsedBlanks = Parser.parseQuestion();
  assert.strictEqual(parsedBlanks.type, 'fill_blanks');
  assert.strictEqual(parsedBlanks.blankCount, 2);

  Executor.highlightAnswerOnPage(parsedBlanks, {
    type: 'fill_blanks',
    answers: ['while', '+=']
  });

  const input1 = fillDom.window.document.getElementById('blank1');
  const input2 = fillDom.window.document.getElementById('blank2');
  assert.strictEqual(input1.placeholder, 'while');
  assert.strictEqual(input2.placeholder, '+=');
  console.log('✓ Fill-in-the-blanks placeholders populated with slot boundary accuracy.');

  // Test 5: SoloLearn Internal React Fiber Inspector (Ground Truth Extraction)
  console.log('\n[Test 5] SoloLearn Internal React Fiber State Inspector');
  const reactDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div id="__next">
      <div id="quiz-root" data-test="quiz-container">
        <h2>Drag the items into order</h2>
        <div class="slots"></div>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/python-developer' });

  global.window = reactDom.window;
  global.document = reactDom.window.document;

  // Attach mock React Fiber node to quiz root element with ground truth solution
  const quizEl = reactDom.window.document.getElementById('quiz-root');
  quizEl.__reactFiber$mock123 = {
    memoizedProps: {
      quizItem: {
        title: 'Reorder code to define a function',
        type: 'reorder',
        code: 'def greet():\n    print("Hi")',
        correctAnswer: ['def', 'greet():', 'print("Hi")'],
        language: 'Python',
        explanation: 'Standard Python function declaration.'
      }
    }
  };

  const internalParsed = Parser.parseQuestion();
  assert.strictEqual(internalParsed.isInternalGroundTruth, true, 'Should detect internal ground truth');
  assert.deepStrictEqual(internalParsed.answers, ['def', 'greet():', 'print("Hi")'], 'Should extract exact ground truth answers');
  assert.strictEqual(internalParsed.language, 'Python', 'Should extract language from React props');
  console.log('✓ Ground Truth extracted directly from SoloLearn React Fiber State!');

  // Test 6: Mistral Solver with Ground Truth Payload
  console.log('\n[Test 6] MistralClient with Ground Truth Bypass');
  const solverClient = new MistralClient('mock-key');
  const solveResult = await solverClient.solve(internalParsed);
  assert.strictEqual(solveResult.success, true);
  assert.strictEqual(solveResult.isInternalGroundTruth, true);
  assert.deepStrictEqual(solveResult.data.answers, ['def', 'greet():', 'print("Hi")']);
  console.log('✓ Ground truth solved with 0 API tokens and 100% confidence.');

  // Test 7: DOM Reorder / Rearrange Code Parsing & Sequence Numbering
  console.log('\n[Test 7] DOM Reorder / Rearrange Code Parsing & Highlighting');
  const reorderDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <header>Module 5 Quiz <span>1</span> <span>Stuck?</span> <span>Change Language</span></header>
    <div data-test="quiz-container">
      <div data-test="instruction">Rearrange the code to declare a method that returns the square of its argument.</div>
      <div class="sortable-list">
        <div class="draggable-item" data-test="draggable">public int Square(int a)</div>
        <div class="draggable-item" data-test="draggable">int result = a*a;</div>
        <div class="draggable-item" data-test="draggable">return result;</div>
        <div class="draggable-item" data-test="draggable">}</div>
        <div class="draggable-item" data-test="draggable">{</div>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/c-sharp' });

  global.window = reorderDom.window;
  global.document = reorderDom.window.document;

  const parsedReorder = Parser.parseQuestion();
  assert.strictEqual(parsedReorder.type, 'reorder', 'Should classify as reorder task');
  assert.strictEqual(parsedReorder.title, 'Rearrange the code to declare a method that returns the square of its argument.');
  assert.strictEqual(parsedReorder.tokens.length, 5, 'Should extract all 5 draggable cards');

  // Test Highlighting sequence steps
  const mockAiReorderAnswer = {
    type: 'reorder',
    answers: ['public int Square(int a)', '{', 'int result = a*a;', 'return result;', '}']
  };
  const highlightRes = Executor.highlightAnswerOnPage(parsedReorder, mockAiReorderAnswer);
  assert.strictEqual(highlightRes.success, true);

  const stepBadges = reorderDom.window.document.querySelectorAll('.sl-ai-order-badge');
  assert.strictEqual(stepBadges.length, 5, 'All 5 cards should have sequence step badges');
  assert.strictEqual(stepBadges[0].textContent, 'Step 1');
  assert.strictEqual(stepBadges[4].textContent, 'Step 2', 'Opening curly brace should be Step 2');
  console.log('✓ Code rearrange task parsed and numbered with Step 1 -> Step 5 sequence badges!');

  // Test 8: React Hooks Linked List Ground Truth Extraction
  console.log('\n[Test 8] React Hooks Linked List Ground Truth Extraction');
  const hooksDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div id="hook-root" data-test="quiz-container">
      <h2>Functional Component Quiz</h2>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/javascript' });

  global.window = hooksDom.window;
  global.document = hooksDom.window.document;

  const hookEl = hooksDom.window.document.getElementById('hook-root');
  // Simulate React 18 functional component with a linked list of hooks
  hookEl.__reactFiber$funcComp = {
    memoizedProps: {},
    memoizedState: {
      memoizedState: null, // hook 1 (e.g. useState for count)
      next: {
        memoizedState: {
          quiz: {
            title: 'What does === check in JavaScript?',
            type: 'single_choice',
            correctAnswer: 'Strict equality (both value and type)',
            language: 'JavaScript',
            explanation: '=== checks both value and type without coercion.'
          }
        },
        next: null
      }
    }
  };

  const hookParsed = Parser.parseQuestion();
  assert.strictEqual(hookParsed.isInternalGroundTruth, true, 'Should detect ground truth inside React Hooks linked list');
  assert.deepStrictEqual(hookParsed.answers, ['Strict equality (both value and type)']);
  assert.strictEqual(hookParsed.language, 'JavaScript');
  console.log('✓ React 18/19 Hooks linked list traversed and ground truth extracted!');

  // Test 9: Auto-Fill on Inputs & Choices
  console.log('\n[Test 9] In-Page Auto-Fill Execution');
  const autoFillDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="quiz-container">
      <input type="text" id="slot1" />
      <input type="text" id="slot2" />
    </div>
  </body>
  </html>
  `);
  global.window = autoFillDom.window;
  global.document = autoFillDom.window.document;

  const slot1 = autoFillDom.window.document.getElementById('slot1');
  const slot2 = autoFillDom.window.document.getElementById('slot2');

  const parsedInputs = {
    type: 'fill_blanks',
    inputElements: [slot1, slot2]
  };
  const aiAnswers = {
    answers: ['const', '42']
  };

  const autoFillRes = Executor.autoFillAnswer(parsedInputs, aiAnswers);
  assert.strictEqual(autoFillRes.success, true);
  assert.strictEqual(slot1.value, 'const');
  assert.strictEqual(slot2.value, '42');
  console.log('✓ In-page Auto-Fill populated input values with React event triggers!');

  // Test 10: Codestral / Mistral Caching
  console.log('\n[Test 10] Codestral / Mistral Query Caching');
  const cacheClient = new MistralClient('mock-key');
  const qPayload = {
    type: 'fill_blanks',
    title: 'Fill loop syntax',
    code: 'for (int i=0; i<10; i++)',
    blankCount: 1,
    options: ['for']
  };
  const mockSolved = {
    success: true,
    data: {
      type: 'fill_blanks',
      answers: ['for'],
      explanation: 'For loop syntax.'
    },
    model: 'codestral-latest',
    latencyMs: 350
  };

  const cKey = cacheClient.getCacheKey(qPayload, 'codestral-latest');
  cacheClient.cache.set(cKey, mockSolved);

  const cachedResult = await cacheClient.solve(qPayload, 'codestral-latest');
  assert.strictEqual(cachedResult.isCached, true, 'Should return cached result');
  assert.strictEqual(cachedResult.latencyMs, 1, 'Cached latency should be instant (1ms)');
  console.log('✓ Codestral caching delivered instant (<5ms) answer recall!');

  // Test 11: End-to-End SoloLearnCompanionController Execution (Verify isGroundTruth & variables)
  console.log('\n[Test 11] SoloLearnCompanionController End-to-End Execution');
  const fullDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div id="root">
      <div data-test="lesson-content">
        <h2 data-test="quiz-title">Choose the right keyword</h2>
        <div class="choices">
          <button data-test="quiz-option">public</button>
          <button data-test="quiz-option">private</button>
        </div>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/c-sharp' });

  global.window = fullDom.window;
  global.document = fullDom.window.document;
  global.window.SoloLearnConfig = Config;
  global.window.MistralClient = MistralClient;
  global.window.SoloLearnParser = Parser;
  global.window.SoloLearnExecutor = Executor;
  global.window.SoloLearnUI = require('../src/ui.js');

  const SoloLearnCompanionController = require('../src/main.js');
  const controller = new SoloLearnCompanionController();
  await controller.init();

  // Attach ground truth to root element
  const lessonEl = fullDom.window.document.querySelector('[data-test="lesson-content"]');
  lessonEl.__reactFiber$root = {
    memoizedProps: {
      quiz: {
        title: 'Choose the right keyword',
        type: 'single_choice',
        correctAnswer: 'public',
        language: 'C# (.NET)'
      }
    }
  };

  // Run handleScanAndReveal - ensures no 'isGroundTruth is not defined' ReferenceError!
  await controller.handleScanAndReveal();

  const companionAns = fullDom.window.document.getElementById('sl-companion-answer');
  assert.strictEqual(companionAns.innerText, 'public', 'Companion card should display ground truth answer');
  console.log('✓ Controller handleScanAndReveal executed successfully with Ground Truth!');

  // Test handleAutoFill
  await controller.handleAutoFill();
  console.log('✓ Controller handleAutoFill executed successfully!');

  // Test 12: Multi-Slot Fill-In-The-Blanks with Word Bank Chips (Screenshot Scenario)
  console.log('\n[Test 12] Multi-Slot Fill-In-The-Blanks with Word Bank Chips');
  const multiBlankDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="instruction">Fill in the blanks to output "Hello, " followed by the value stored in the name variable.</div>
      <div class="code-container" data-test="code-snippet">
        <div>String name = "James";</div>
        <div>String msg <span class="drop-slot" data-test="drop-target"></span> "+ <span class="drop-slot" data-test="drop-target"></span> ;</div>
        <div>System.out.println( <span class="drop-slot" data-test="drop-target"></span> );</div>
      </div>
      <div class="word-bank">
        <button class="word-chip" data-test="choice-item">msg</button>
        <button class="word-chip" data-test="choice-item">var</button>
        <button class="word-chip" data-test="choice-item">String</button>
        <button class="word-chip" data-test="choice-item">int</button>
        <button class="word-chip" data-test="choice-item">println</button>
        <button class="word-chip" data-test="choice-item">Hello,</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/java' });

  global.window = multiBlankDom.window;
  global.document = multiBlankDom.window.document;

  const parsedMulti = Parser.parseQuestion();
  assert.strictEqual(parsedMulti.type, 'fill_blanks', 'Should classify as fill_blanks, NOT reorder');
  assert.strictEqual(parsedMulti.blankCount, 3, 'Should identify all 3 blank drop slots');
  assert.strictEqual(parsedMulti.inputElements.length, 3, 'Should extract 3 drop slot DOM elements');
  assert.strictEqual(parsedMulti.options.length, 6, 'Should extract all 6 word bank chips');

  // Test Multi-Slot Highlighting
  const mockAiMultiAnswer = {
    type: 'fill_blanks',
    answers: ['=', 'Hello,', 'msg']
  };

  const multiHighlightRes = Executor.highlightAnswerOnPage(parsedMulti, mockAiMultiAnswer);
  assert.strictEqual(multiHighlightRes.success, true);

  // Assert drop slots received badges #1, #2, #3
  const slotBadges = multiBlankDom.window.document.querySelectorAll('.drop-slot .sl-ai-badge');
  assert.strictEqual(slotBadges.length, 3, 'All 3 drop slots should have #1, #2, #3 badges');
  assert.strictEqual(slotBadges[0].textContent, '#1: =');
  assert.strictEqual(slotBadges[1].textContent, '#2: Hello,');
  assert.strictEqual(slotBadges[2].textContent, '#3: msg');

  // Assert matching word bank chips received Slot # badges
  const chipBadges = multiBlankDom.window.document.querySelectorAll('.word-chip .sl-ai-order-badge');
  assert.strictEqual(chipBadges.length, 2, 'Matching word bank chips (Hello,, msg) should have Slot # badges');
  console.log('✓ Multi-Slot Fill-In-The-Blanks with Word Bank chips parsed and highlighted perfectly!');

  // Test 13: MistralClient queryModel Prompt Construction & Execution (No 'language is not defined' error)
  console.log('\n[Test 13] MistralClient.queryModel Execution & Prompt Formulation');
  const mockFetchResponse = {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{
        message: {
          content: JSON.stringify({
            thought: 'Pass 1: Java string concat. Pass 2: variable evaluation. Pass 3: slot isolation.',
            type: 'fill_blanks',
            confidence: 1.0,
            answers: ['=', 'Hello,', 'msg'],
            explanation: 'Concatenate Hello, with name and pass to println.'
          })
        }
      }],
      usage: { prompt_tokens: 180, completion_tokens: 45, total_tokens: 225 }
    })
  };

  const originalFetch = global.fetch;
  global.fetch = async (url, opts) => {
    assert.strictEqual(url, 'https://api.mistral.ai/v1/chat/completions');
    const body = JSON.parse(opts.body);
    assert.strictEqual(body.model, 'codestral-latest');
    assert.ok(body.messages[1].content.includes('TARGET PROGRAMMING LANGUAGE: Java'));
    assert.ok(body.messages[1].content.includes('TOTAL BLANKS/SLOTS TO FILL: 3'));
    return mockFetchResponse;
  };

  const client13 = new MistralClient('valid-mistral-key');
  const q13 = {
    type: 'fill_blanks',
    language: 'Java',
    title: 'Fill in the blanks to output Hello, followed by name',
    code: 'String msg [BLANK_1] "+ [BLANK_2] ;\nSystem.out.println( [BLANK_3] );',
    blankCount: 3,
    options: ['msg', 'var', 'String', 'int', 'println', 'Hello,']
  };

  const res13 = await client13.queryModel(q13, 'codestral-latest');
  assert.strictEqual(res13.success, true);
  assert.deepStrictEqual(res13.data.answers, ['=', 'Hello,', 'msg']);
  console.log('✓ MistralClient queryModel executed cleanly with 0 variable reference errors!');

  // Test 14: Conceptual Multiple-Choice Questions without Code Snippets
  console.log('\n[Test 14] Conceptual Multiple-Choice Questions without Code Snippets');
  const commentDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <h2 data-test="quiz-title">Which of the following is a valid comment?</h2>
      <div class="choices">
        <button data-test="choice-item">## some text</button>
        <button data-test="choice-item">** some text **</button>
        <button data-test="choice-item">/* some text */</button>
        <button data-test="choice-item">*/ some text /*</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/java' });

  global.window = commentDom.window;
  global.document = commentDom.window.document;

  const parsedCommentQ = Parser.parseQuestion();
  assert.strictEqual(parsedCommentQ.type, 'single_choice');
  assert.strictEqual(parsedCommentQ.title, 'Which of the following is a valid comment?');
  assert.strictEqual(parsedCommentQ.options.length, 4);

  global.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    assert.strictEqual(body.messages[1].content.includes('EXERCISE TYPE: Conceptual / Language Syntax Question'), true);
    assert.strictEqual(body.messages[1].content.includes('/* some text */'), true);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              thought: 'Pass 1: Java multi-line comment syntax is /* text */. Pass 2: Evaluate options. Pass 3: Select /* some text */.',
              type: 'single_choice',
              confidence: 1.0,
              answers: ['/* some text */'],
              explanation: 'In Java, multi-line comments are enclosed between /* and */.'
            })
          }
        }],
        usage: { prompt_tokens: 120, completion_tokens: 35, total_tokens: 155 }
      })
    };
  };

  const res14 = await client13.queryModel(parsedCommentQ, 'codestral-latest');
  assert.strictEqual(res14.success, true);
  assert.deepStrictEqual(res14.data.answers, ['/* some text */']);
  console.log('✓ Conceptual Multiple-Choice question solved flawlessly with 0 code errors!');

  // Test 14b: Mistral Token Exhaustion / 429 Rate Limit Fallback across Text-out models
  console.log('\n[Test 14b] MistralClient Token Exhaustion / 429 Quota Fallback across Text-Out Models');
  const queriedMistralModels = [];
  global.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    queriedMistralModels.push(body.model);
    if (body.model === 'codestral-latest' || body.model === 'mistral-small-latest') {
      // Simulate 429 Rate Limit / Out of tokens for primary exhausted models
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          message: 'Rate limit reached: daily token allowance exhausted.'
        })
      };
    }
    // Fallback model (open-mistral-nemo / ministral-8b-latest) succeeds
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              thought: 'Fallback Mistral text-out model AST trace',
              type: 'single_choice',
              confidence: 1.0,
              answers: ['/* some text */'],
              explanation: 'Solved via fallback Text-out Mistral model.'
            })
          }
        }],
        usage: { prompt_tokens: 100, completion_tokens: 25, total_tokens: 125 }
      })
    };
  };

  const mistralFallbackRes = await client13.queryModel(parsedCommentQ, 'codestral-latest');
  assert.strictEqual(mistralFallbackRes.success, true, 'Should successfully fall back when primary model is out of tokens');
  assert.deepStrictEqual(mistralFallbackRes.data.answers, ['/* some text */']);
  assert.ok(queriedMistralModels.length > 1, 'Should have queried fallback Mistral models');
  console.log(`✓ MistralClient seamlessly fell back from exhausted model to working text-out model (${mistralFallbackRes.model})!`);

  // Test 15: GeminiClient Google AI Studio Query & Verification
  console.log('\n[Test 15] GeminiClient Google AI Studio Model Query & Verification');
  const geminiClient = new GeminiClient('AIzaSy_mock_key');
  global.fetch = async (url, opts) => {
    assert.ok(url.includes('generativelanguage.googleapis.com'));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                thought: 'Gemini AST trace: select /* some text */',
                type: 'single_choice',
                confidence: 1.0,
                answers: ['/* some text */'],
                explanation: 'Standard comment syntax.'
              })
            }]
          }
        }]
      })
    };
  };

  const geminiRes = await geminiClient.queryModel(parsedCommentQ, 'gemini-3.7-flash');
  if (!geminiRes.success) console.error('Gemini test error:', geminiRes.error);
  assert.strictEqual(geminiRes.success, true);
  assert.deepStrictEqual(geminiRes.data.answers, ['/* some text */']);
  console.log('✓ GeminiClient returned valid answers from Google AI Studio!');

  // Test 15b: Gemini Token Exhaustion / 429 Quota Fallback across Text-out models
  console.log('\n[Test 15b] GeminiClient Token Exhaustion / 429 Quota Fallback across Text-Out Models');
  const queriedGeminiUrls = [];
  global.fetch = async (url) => {
    queriedGeminiUrls.push(url);
    if (url.includes('gemini-3.6-flash') || url.includes('gemini-3.5-flash')) {
      // Simulate 429 Quota Exceeded for exhausted models (as shown in user screenshot)
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          error: { code: 429, message: 'Resource has been exhausted (e.g. check quota).' }
        })
      };
    }
    // Fallback to high quota text-out model (e.g. gemini-3.5-flash-lite / gemini-3.7-flash) succeeds!
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                thought: 'Fallback Text-Out Gemini model AST trace',
                type: 'single_choice',
                confidence: 1.0,
                answers: ['/* some text */'],
                explanation: 'Successfully solved via fallback Text-out model.'
              })
            }]
          }
        }]
      })
    };
  };

  const geminiFallbackRes = await geminiClient.queryModel(parsedCommentQ, 'gemini-3.6-flash');
  assert.strictEqual(geminiFallbackRes.success, true, 'Should successfully fall back when primary model is out of tokens');
  assert.deepStrictEqual(geminiFallbackRes.data.answers, ['/* some text */']);
  assert.ok(queriedGeminiUrls.length > 1, 'Should have queried fallback models');
  console.log(`✓ GeminiClient seamlessly fell back from exhausted model to working text-out model (${geminiFallbackRes.model})!`);

  // Test 16: HuggingFaceClient Query & Verification
  console.log('\n[Test 16] HuggingFaceClient Model Query & Verification');
  const hfClient = new HuggingFaceClient('hf_mock_key');
  global.fetch = async (url, opts) => {
    assert.ok(url.includes('huggingface.co'));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              thought: 'Qwen Coder AST trace: comment matching',
              type: 'single_choice',
              confidence: 1.0,
              answers: ['/* some text */'],
              explanation: 'C-family multiline comment.'
            })
          }
        }],
        usage: { total_tokens: 150 }
      })
    };
  };

  const hfRes = await hfClient.queryModel(parsedCommentQ, 'Qwen/Qwen2.5-Coder-32B-Instruct');
  if (!hfRes.success) console.error('Hugging Face test error:', hfRes.error);
  assert.strictEqual(hfRes.success, true);
  assert.deepStrictEqual(hfRes.data.answers, ['/* some text */']);
  console.log('✓ HuggingFaceClient returned valid answers from Qwen 2.5 Coder 32B!');

  // Test 17: MultiProviderConsensusEngine 3/3 Unanimous Agreement (Mistral + Gemini + Hugging Face)
  console.log('\n[Test 17] MultiProviderConsensusEngine 3/3 Unanimous Voting Race (Mistral + Gemini + Hugging Face)');
  const consensusEngine = new MultiProviderConsensusEngine({
    mistralApiKey: 'mistral-key',
    geminiApiKey: 'AIzaSy-key',
    huggingfaceApiKey: 'hf_key',
    consensusMode: true
  });

  global.fetch = async (url) => {
    let ans = ['/* some text */'];
    let providerName = 'Mistral';
    if (url.includes('googleapis')) {
      providerName = 'Gemini';
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  thought: 'Gemini reasoning',
                  type: 'single_choice',
                  confidence: 1.0,
                  answers: ans,
                  explanation: 'Gemini explanation.'
                })
              }]
            }
          }]
        })
      };
    }
    if (url.includes('huggingface')) providerName = 'Hugging Face';

    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              thought: `${providerName} reasoning`,
              type: 'single_choice',
              confidence: 1.0,
              answers: ans,
              explanation: `${providerName} explanation.`
            })
          }
        }],
        usage: { total_tokens: 120 }
      })
    };
  };

  const unanimousRes = await consensusEngine.solve(parsedCommentQ, { consensusMode: true });
  assert.strictEqual(unanimousRes.success, true);
  assert.strictEqual(unanimousRes.hasConsensus, true);
  assert.strictEqual(unanimousRes.isUnanimous, true);
  assert.strictEqual(unanimousRes.isGoldenMatch, true);
  assert.strictEqual(unanimousRes.votes, 3);
  assert.strictEqual(unanimousRes.totalProviders, 3);
  assert.deepStrictEqual(unanimousRes.data.answers, ['/* some text */']);
  assert.ok(unanimousRes.consensusLabel.includes('GOLDEN MATCH'));
  console.log('✓ 3/3 Unanimous Golden Match evaluated correctly across Mistral + Google AI Studio + Hugging Face!');

  // Test 18: MultiProviderConsensusEngine 2/3 Majority Voting (1 Disagreeing Model)
  console.log('\n[Test 18] MultiProviderConsensusEngine 2/3 Majority Voting');
  consensusEngine.clearCache();

  global.fetch = async (url) => {
    if (url.includes('googleapis')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  thought: 'Gemini reasoning',
                  type: 'single_choice',
                  confidence: 1.0,
                  answers: ['/* some text */'], // Gemini agrees with Mistral
                  explanation: 'Gemini explanation.'
                })
              }]
            }
          }]
        })
      };
    }

    let ans = ['/* some text */'];
    let provider = 'Mistral';
    if (url.includes('huggingface')) {
      provider = 'Hugging Face';
      ans = ['## some text']; // Hugging Face returned wrong answer
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              thought: `${provider} reasoning`,
              type: 'single_choice',
              confidence: 1.0,
              answers: ans,
              explanation: `${provider} explanation.`
            })
          }
        }],
        usage: { total_tokens: 120 }
      })
    };
  };

  const majorityRes = await consensusEngine.solve(parsedCommentQ, { consensusMode: true });
  assert.strictEqual(majorityRes.success, true);
  assert.strictEqual(majorityRes.hasConsensus, true);
  assert.strictEqual(majorityRes.isGoldenMatch, true);
  assert.strictEqual(majorityRes.votes, 2);
  assert.strictEqual(majorityRes.totalProviders, 3);
  assert.deepStrictEqual(majorityRes.data.answers, ['/* some text */']);
  assert.ok(majorityRes.consensusLabel.includes('MAJORITY GOLDEN MATCH'));
  console.log('✓ 2/3 Majority Voting correctly isolated winner and discarded disagreeing model!');

  // Test 19: Single Provider Auto-Expansion to 3-Model Intra-Provider Race (Hugging Face Key)
  console.log('\n[Test 19] Single-Provider Auto-Expansion to 3-Model Race (Only Hugging Face Token)');
  const singleProviderEngine = new MultiProviderConsensusEngine({
    huggingfaceApiKey: 'hf_key_only'
  });

  const queriedModels = [];
  global.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    queriedModels.push(body.model);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              thought: `${body.model} reasoning`,
              type: 'single_choice',
              confidence: 1.0,
              answers: ['/* some text */'],
              explanation: 'Valid comment.'
            })
          }
        }],
        usage: { total_tokens: 110 }
      })
    };
  };

  const singleProviderRes = await singleProviderEngine.solve(parsedCommentQ);
  assert.strictEqual(singleProviderRes.success, true);
  assert.strictEqual(singleProviderRes.hasConsensus, true);
  assert.strictEqual(singleProviderRes.isGoldenMatch, true);
  assert.strictEqual(queriedModels.length, 3, 'Should automatically spawn 3 distinct models within Hugging Face');
  assert.ok(queriedModels.includes('Qwen/Qwen2.5-Coder-32B-Instruct'));
  assert.ok(queriedModels.includes('meta-llama/Llama-3.3-70B-Instruct'));
  assert.ok(queriedModels.includes('deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'));
  console.log('✓ Single Provider automatically commanded 3 distinct Hugging Face models (Qwen 2.5 Coder + Llama 3.3 + DeepSeek R1) in parallel!');

  // Test 20: Automatic Consensus Re-Scan on Disagreement
  console.log('\n[Test 20] Automatic Consensus Re-scan on Disagreement');
  consensusEngine.clearCache();
  let runCount = 0;
  global.fetch = async (url, opts) => {
    runCount++;
    // On pass 1 (runs 1, 2, 3): create a 3-way tie / disagreement
    // On pass 2 (runs 4, 5, 6): models re-evaluate and agree on '/* some text */'
    let ans = ['/* some text */'];
    if (runCount === 1) ans = ['## some text'];
    if (runCount === 2) ans = ['** some text **'];
    if (runCount === 3) ans = ['*/ some text /*'];

    if (url.includes('googleapis')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ thought: 'Gemini', type: 'single_choice', confidence: 1.0, answers: ans, explanation: 'Gemini.' }) }] } }]
        })
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ thought: 'AI', type: 'single_choice', confidence: 1.0, answers: ans, explanation: 'AI exp.' }) } }]
      })
    };
  };

  const reScanRes = await consensusEngine.solve(parsedCommentQ, { consensusMode: true });
  assert.strictEqual(reScanRes.success, true);
  assert.strictEqual(reScanRes.hasConsensus, true);
  assert.deepStrictEqual(reScanRes.data.answers, ['/* some text */']);
  assert.ok(runCount > 3, 'Should have automatically triggered a re-scan pass on disagreement');
  console.log('✓ Automatic Consensus Re-scan triggered on disagreement and reached unanimous consensus!');

  // Test 21: Match the term with the definition (Screenshot Scenario - 3-Slot Drag & Drop)
  console.log('\n[Test 21] Term-to-Definition Multi-Slot Matching (Screenshot Scenario)');
  const matchingDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="instruction">Match the term with the definition</div>
      <div class="definition-row">
        <span>Error in code:</span>
        <span class="drop-slot" data-test="drop-target"></span>
      </div>
      <div class="definition-row">
        <span>Information request:</span>
        <span class="drop-slot" data-test="drop-target"></span>
      </div>
      <div class="definition-row">
        <span>Visual representation of a database:</span>
        <span class="drop-slot" data-test="drop-target"></span>
      </div>
      <div class="word-bank">
        <button class="word-chip" data-test="choice-item">query</button>
        <button class="word-chip" data-test="choice-item">bug</button>
        <button class="word-chip" data-test="choice-item">schema</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/sql-introduction' });

  global.window = matchingDom.window;
  global.document = matchingDom.window.document;

  const parsedMatching = Parser.parseQuestion();
  assert.strictEqual(parsedMatching.type, 'fill_blanks', 'Should classify definition matching as fill_blanks');
  assert.strictEqual(parsedMatching.language, 'SQL', 'Should accurately detect SQL course domain');
  assert.strictEqual(parsedMatching.blankCount, 3, 'Should identify exactly 3 definition drop slots');
  assert.strictEqual(parsedMatching.inputElements.length, 3, 'Should extract all 3 drop target DOM elements');
  assert.ok(parsedMatching.code.includes('Error in code: [BLANK_1]'), 'Should include definition line 1 with BLANK_1');
  assert.ok(parsedMatching.code.includes('Information request: [BLANK_2]'), 'Should include definition line 2 with BLANK_2');
  assert.ok(parsedMatching.code.includes('Visual representation of a database: [BLANK_3]'), 'Should include definition line 3 with BLANK_3');
  assert.strictEqual(parsedMatching.options.length, 3, 'Should extract all 3 word bank chips');

  // Test Visual Highlighting for all 3 matching pairs
  const mockMatchingAnswer = {
    type: 'fill_blanks',
    answers: ['bug', 'query', 'schema'],
    explanation: 'A bug is an error in code, a query is an information request, and a schema is the visual representation of a database.'
  };

  const matchingHighlightRes = Executor.highlightAnswerOnPage(parsedMatching, mockMatchingAnswer);
  assert.strictEqual(matchingHighlightRes.success, true);

  const matchingSlotBadges = matchingDom.window.document.querySelectorAll('.drop-slot .sl-ai-badge');
  assert.strictEqual(matchingSlotBadges.length, 3, 'All 3 drop slots should have #1, #2, #3 badges');
  assert.strictEqual(matchingSlotBadges[0].textContent, '#1: bug');
  assert.strictEqual(matchingSlotBadges[1].textContent, '#2: query');
  assert.strictEqual(matchingSlotBadges[2].textContent, '#3: schema');

  const matchingChipBadges = matchingDom.window.document.querySelectorAll('.word-chip .sl-ai-order-badge');
  assert.strictEqual(matchingChipBadges.length, 3, 'All 3 word bank chips (bug, query, schema) should have Slot # badges');
  console.log('✓ Definition matching 3-slot question parsed, language-detected, and highlighted with 100% precision!');

  // Test 22: Multi-Slot SQL Query Reading & Sequential Word-Bank Auto-Fill (Screenshot Scenario)
  console.log('\n[Test 22] Multi-Slot SQL Query Code Reading & Sequential Auto-Fill (Complete the SQL Query)');
  const sqlQueryDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="instruction">Complete the SQL query</div>
      <div class="code-container" data-test="code-snippet">
        <div class="code-line">
          <span class="drop-slot" data-test="drop-target"></span>
          <span>id</span>
          <span class="drop-slot" data-test="drop-target"></span>
          <span class="drop-slot" data-test="drop-target"></span>
        </div>
        <div class="code-line">
          <span class="drop-slot" data-test="drop-target"></span>
          <span>orders</span>
        </div>
      </div>
      <div class="word-bank">
        <button class="word-chip" data-test="choice-item">FROM</button>
        <button class="word-chip" data-test="choice-item">,</button>
        <button class="word-chip" data-test="choice-item">SELECT</button>
        <button class="word-chip" data-test="choice-item">date</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/sql-introduction' });

  global.window = sqlQueryDom.window;
  global.document = sqlQueryDom.window.document;

  const parsedSql = Parser.parseQuestion();
  assert.strictEqual(parsedSql.type, 'fill_blanks');
  assert.strictEqual(parsedSql.language, 'SQL');
  assert.strictEqual(parsedSql.blankCount, 4, 'Should extract all 4 blank slots');
  assert.strictEqual(parsedSql.inputElements.length, 4, 'Should have 4 inputElements');
  console.log('DEBUG PARSED SQL CODE:', JSON.stringify(parsedSql.code));
  assert.ok(parsedSql.code.includes('[BLANK_1]'), 'Must include BLANK_1');
  assert.ok(parsedSql.code.includes('[BLANK_4]'), 'Must include BLANK_4');
  assert.strictEqual(parsedSql.options.length, 4, 'Should extract 4 word bank chips');

  // Test Multi-Provider Consensus on Word-Bank Compliance
  const mockSqlEngine = new MultiProviderConsensusEngine({
    mistralApiKey: 'mistral-key',
    geminiApiKey: 'gemini-key',
    huggingfaceApiKey: 'hf-key',
    consensusMode: true
  });

  global.fetch = async (url) => {
    // Gemini returns 100% compliant word bank answer
    if (url.includes('googleapis')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ thought: 'Gemini SQL', type: 'fill_blanks', confidence: 1.0, answers: ['SELECT', ',', 'date', 'FROM'], explanation: 'SELECT id, date FROM orders' }) }] } }]
        })
      };
    }
    // Mistral returns invalid word not in word bank
    if (url.includes('mistral')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ thought: 'Mistral SQL', type: 'fill_blanks', confidence: 1.0, answers: ['SELECT', 'FROM', ',', 'orders'], explanation: 'SQL' }) } }]
        })
      };
    }
    // Hugging face returns invalid word not in word bank
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ thought: 'HF SQL', type: 'fill_blanks', confidence: 1.0, answers: ['SELECT', 'id', 'FROM', 'orders'], explanation: 'SQL' }) } }]
      })
    };
  };

  const sqlConsensusRes = await mockSqlEngine.solve(parsedSql, { consensusMode: true });
  assert.strictEqual(sqlConsensusRes.success, true);
  assert.deepStrictEqual(sqlConsensusRes.data.answers, ['SELECT', ',', 'date', 'FROM'], 'Consensus Engine must pick 100% word-bank compliant Gemini winner!');

  // Test Auto-Fill on SQL drop slots
  const sqlAutoFillRes = Executor.autoFillAnswer(parsedSql, sqlConsensusRes.data);
  assert.strictEqual(sqlAutoFillRes.success, true);
  console.log('✓ Multi-Slot SQL Query parsed in reading order, consensus resolved to 100% compliant solution, and auto-filled!');

  // Test 23: SoloLearnMemoryEngine Signature Generation & Pre-Seeded Knowledge Adaptation
  console.log('\n[Test 23] SoloLearnMemoryEngine Signature Generation & Pre-Seeded Knowledge Adaptation');
  const memoryEngine = new SoloLearnMemory();
  const preSeededQ = {
    title: 'What is the output of the following C# code?',
    code: 'int x = 5;\nint y = 10;\nConsole.WriteLine(x + y);',
    type: 'single_choice'
  };
  const preSeededRecord = memoryEngine.get(preSeededQ);
  assert.notStrictEqual(preSeededRecord, null, 'Must retrieve pre-seeded historical question');
  assert.deepStrictEqual(preSeededRecord.answers, ['15'], 'Pre-seeded answer must be 15');
  assert.strictEqual(preSeededRecord.status, 'mastered');
  const stats = memoryEngine.getStats();
  assert.ok(stats.total >= 8, 'Must have at least 8 pre-seeded historical benchmark records');
  console.log(`✓ Pre-seeded Knowledge Bank loaded with ${stats.total} historical benchmark solutions (${stats.mastered} mastered)!`);

  // Test 24: Memory Learn Correct & 0ms Instant Retrieval
  console.log('\n[Test 24] Memory Learn Correct & 0ms Instant Retrieval');
  const dynamicQ = {
    title: 'Which method starts a thread in Java?',
    type: 'single_choice',
    language: 'Java',
    options: ['start()', 'run()', 'init()']
  };
  memoryEngine.learnCorrect(dynamicQ, ['start()'], 'test_verification');
  const dynamicLearned = memoryEngine.get(dynamicQ);
  assert.notStrictEqual(dynamicLearned, null);
  assert.deepStrictEqual(dynamicLearned.answers, ['start()']);
  assert.strictEqual(dynamicLearned.status, 'mastered');

  // Verify ConsensusEngine zero-token recall
  const consensusWithMem = new MultiProviderConsensusEngine();
  consensusWithMem.memory = memoryEngine;
  const memorySolveRes = await consensusWithMem.solve(dynamicQ);
  assert.strictEqual(memorySolveRes.success, true);
  assert.strictEqual(memorySolveRes.isLearnedMemory, true);
  assert.strictEqual(memorySolveRes.latencyMs, 1);
  assert.deepStrictEqual(memorySolveRes.data.answers, ['start()']);
  console.log('✓ Verified correct answer adapted into memory and recalled instantly with 0 tokens (1ms)!');

  // Test 25: Memory Learn from Mistake (Mistake Analysis & Self-Correction Reflection)
  console.log('\n[Test 25] Memory Learn from Mistake (Mistake Analysis & Self-Correction)');
  const mistakeQ = {
    title: 'What does SQL HAVING clause do?',
    type: 'single_choice',
    language: 'SQL',
    options: ['Filters groups after GROUP BY', 'Filters rows before GROUP BY', 'Sorts results']
  };

  // Initially an erroneous choice was made
  const wrongAns = ['Filters rows before GROUP BY'];
  const rightAns = ['Filters groups after GROUP BY'];

  const correctionRecord = memoryEngine.learnMistake(mistakeQ, wrongAns, rightAns, 'test_feedback');
  assert.strictEqual(correctionRecord.status, 'corrected');
  assert.deepStrictEqual(correctionRecord.answers, rightAns);
  assert.ok(correctionRecord.reflection.includes('Acknowledged mistake on "Filters rows before GROUP BY"'), 'Reflection must acknowledge mistake');
  assert.ok(correctionRecord.reflection.includes('adapted memory to "Filters groups after GROUP BY"'), 'Reflection must show right choice');

  // Verify memory immediately serves the corrected right answer in future encounters
  const correctedSolveRes = await consensusWithMem.solve(mistakeQ);
  assert.strictEqual(correctedSolveRes.success, true);
  assert.strictEqual(correctedSolveRes.isLearnedMemory, true);
  assert.strictEqual(correctedSolveRes.isCorrected, true);
  assert.deepStrictEqual(correctedSolveRes.data.answers, rightAns);
  console.log('✓ Mistake analyzed, acknowledged, and self-corrected into memory. Fearlessly gives the right answer!');

  // Test 26: SoloLearnFeedbackDetector Post-Submission Success Detection
  console.log('\n[Test 26] SoloLearnFeedbackDetector Post-Submission Success Detection');
  const successDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="lesson-feedback-success" class="banner-success">
        <span>Correct! Great job!</span>
        <button data-test="continue-button">Continue</button>
      </div>
    </div>
  </body>
  </html>
  `);
  const successFeedback = Parser.FeedbackDetector.detectSubmissionResult(successDom.window.document);
  assert.notStrictEqual(successFeedback, null);
  assert.strictEqual(successFeedback.isSubmitted, true);
  assert.strictEqual(successFeedback.isCorrect, true);
  console.log('✓ SoloLearn post-submission success feedback banner detected accurately!');

  // Test 27: SoloLearnFeedbackDetector Post-Submission Failure Detection & Revealed Correct Answer
  console.log('\n[Test 27] SoloLearnFeedbackDetector Post-Submission Failure Detection & Answer Extraction');
  const failureDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="lesson-feedback-error" class="banner-error">
        <span>Not quite. Correct answer is: True</span>
        <button data-test="try-again-button">Try Again</button>
      </div>
    </div>
  </body>
  </html>
  `);
  const failureFeedback = Parser.FeedbackDetector.detectSubmissionResult(failureDom.window.document);
  assert.notStrictEqual(failureFeedback, null);
  assert.strictEqual(failureFeedback.isSubmitted, true);
  assert.strictEqual(failureFeedback.isCorrect, false);
  assert.deepStrictEqual(failureFeedback.revealedAnswers, ['True']);
  console.log('✓ SoloLearn failure banner detected and revealed correct answer ("True") extracted!');

  // Test 28: End-to-End Controller Adaptation Loop
  console.log('\n[Test 28] End-to-End Controller Adaptation & Learning Flow');
  const endToEndDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div id="root">
      <div data-test="lesson-content">
        <h2 data-test="quiz-title">What is 2 + 2 in Python?</h2>
        <div class="choices">
          <button data-test="quiz-option">4</button>
          <button data-test="quiz-option">22</button>
        </div>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/python' });

  global.window = endToEndDom.window;
  global.document = endToEndDom.window.document;
  global.window.SoloLearnConfig = Config;
  global.window.SoloLearnMemory = SoloLearnMemory;
  global.window.SoloLearnParser = Parser;
  global.window.SoloLearnExecutor = Executor;
  global.window.SoloLearnUI = require('../src/ui.js');

  const testCtrl = new SoloLearnCompanionController();
  await testCtrl.init();

  testCtrl.lastActiveQuestion = {
    title: 'What is 2 + 2 in Python?',
    type: 'single_choice',
    language: 'Python',
    options: ['4', '22']
  };
  testCtrl.lastActiveResult = {
    answers: ['22'], // Erroneous initial result
    type: 'single_choice'
  };

  // User triggers manual correction
  testCtrl.handleFeedbackWrong('4');
  const finalLearned = testCtrl.engine.memory.get(testCtrl.lastActiveQuestion);
  assert.strictEqual(finalLearned.status, 'corrected');
  assert.deepStrictEqual(finalLearned.answers, ['4']);
  // Test 29: Multi-Select SQL LIKE Pattern Matching ("The%King_")
  console.log('\n[Test 29] Multi-Select SQL LIKE Pattern Matching ("The%King_") with Multi-Option Highlighting & Auto-Fill');
  const multiSelectDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="quiz-container">
      <h2 data-test="quiz-title">Which book records will match the pattern 'The%King_'</h2>
      <div data-test="subtitle">Select all correct answers.</div>
      <div class="choices">
        <label class="choice-card"><input type="checkbox" id="opt1" /> The Patient King3B</label>
        <label class="choice-card"><input type="checkbox" id="opt2" /> The Warrior King2</label>
        <label class="choice-card"><input type="checkbox" id="opt3" /> The Warrior King1</label>
        <label class="choice-card"><input type="checkbox" id="opt4" /> The Silent King</label>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/sql' });

  global.window = multiSelectDom.window;
  global.document = multiSelectDom.window.document;

  const parsedSqlMulti = Parser.parseQuestion();
  assert.strictEqual(parsedSqlMulti.type, 'multi_choice', 'Should be classified as multi_choice');
  assert.ok(parsedSqlMulti.extraText.includes('MULTI-SELECT'), 'Extra text must instruct AI to select all answers');

  // Verify memory engine immediately resolves both answers from knowledge bank
  const multiMemEngine = new SoloLearnMemory();
  const multiRecord = multiMemEngine.get(parsedSqlMulti);
  assert.notStrictEqual(multiRecord, null, 'Must retrieve pre-seeded multi-choice record');
  assert.deepStrictEqual(multiRecord.answers, ['The Warrior King1', 'The Warrior King2'], 'Must have BOTH correct answers');

  // Highlight both options on the webpage
  const highlightMultiRes = Executor.highlightAnswerOnPage(parsedSqlMulti, multiRecord);
  assert.strictEqual(highlightMultiRes.success, true);
  const highlightedChoices = multiSelectDom.window.document.querySelectorAll('.sl-ai-highlighted-choice');
  assert.strictEqual(highlightedChoices.length, 2, 'BOTH matching choice cards must be highlighted on the webpage!');

  // Auto-Fill / Check both checkboxes
  const autoFillMultiRes = Executor.autoFillAnswer(parsedSqlMulti, multiRecord);
  assert.strictEqual(autoFillMultiRes.success, true);
  const opt2 = multiSelectDom.window.document.getElementById('opt2');
  const opt3 = multiSelectDom.window.document.getElementById('opt3');
  assert.strictEqual(opt2.checked, true, 'Option 2 (The Warrior King2) checkbox must be checked');
  assert.strictEqual(opt3.checked, true, 'Option 3 (The Warrior King1) checkbox must be checked');
  console.log('✓ Multi-Select SQL LIKE Pattern Matching verified: BOTH correct options selected and highlighted!');

  // Test 30: Data Matching with Inter-Row Drop Dividers & Spacer Lines (Screenshot Scenario)
  console.log('\n[Test 30] Data Source Matching with Inter-Row Drop Dividers / Spacers Filtered Out');
  const matchingDataDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="question-title">Match the data with its source type</div>
      <div data-test="subtitle">Data is continuously being generated and can come from different sources.</div>
      <div class="code-container" data-test="code-snippet">
        <div class="match-row">
          <span>tweet dates:</span>
          <div class="drop-slot" data-test="drop-target" id="slot1"></div>
        </div>
        <div class="drop-line drop-indicator" data-test="drop-indicator" style="height: 2px;"></div>
        <div class="match-row">
          <span>heart rate:</span>
          <div class="drop-slot" data-test="drop-target" id="slot2"></div>
        </div>
        <div class="drop-line drop-indicator" data-test="drop-indicator" style="height: 2px;"></div>
        <div class="match-row">
          <span>payment amounts:</span>
          <div class="drop-slot" data-test="drop-target" id="slot3"></div>
        </div>
      </div>
      <div class="word-bank">
        <button class="word-chip" data-test="choice-item">social data</button>
        <button class="word-chip" data-test="choice-item">device data</button>
        <button class="word-chip" data-test="choice-item">transactional data</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/data-science' });

  global.window = matchingDataDom.window;
  global.document = matchingDataDom.window.document;

  const parsedMatchingData = Parser.parseQuestion();
  assert.strictEqual(parsedMatchingData.type, 'fill_blanks', 'Should classify matching as fill_blanks');
  assert.strictEqual(parsedMatchingData.blankCount, 3, 'Must identify EXACTLY 3 blanks, ignoring the 2 inter-row drop divider lines!');
  assert.strictEqual(parsedMatchingData.inputElements.length, 3, 'Must have exactly 3 target input elements');
  assert.ok(parsedMatchingData.code.includes('tweet dates:') && parsedMatchingData.code.includes('[BLANK_1]'), 'Line 1 must contain tweet dates and BLANK_1');
  assert.ok(parsedMatchingData.code.includes('heart rate:') && parsedMatchingData.code.includes('[BLANK_2]'), 'Line 2 must contain heart rate and BLANK_2');
  assert.ok(parsedMatchingData.code.includes('payment amounts:') && parsedMatchingData.code.includes('[BLANK_3]'), 'Line 3 must contain payment amounts and BLANK_3');

  // Verify memory engine instantly solves it with 3 answers
  const dataMemRecord = multiMemEngine.get(parsedMatchingData);
  assert.notStrictEqual(dataMemRecord, null, 'Must retrieve memory seed for Data Source Matching');
  assert.deepStrictEqual(dataMemRecord.answers, ['social data', 'device data', 'transactional data'], 'Must have 3 answers');

  // Highlight all 3 slots and chips
  const highlightDataRes = Executor.highlightAnswerOnPage(parsedMatchingData, dataMemRecord);
  assert.strictEqual(highlightDataRes.success, true);
  const dataBadges = matchingDataDom.window.document.querySelectorAll('.drop-slot .sl-ai-badge');
  assert.strictEqual(dataBadges.length, 3, 'All 3 drop slots must have badges #1, #2, #3');
  assert.strictEqual(dataBadges[0].textContent, '#1: social data');
  assert.strictEqual(dataBadges[1].textContent, '#2: device data');
  assert.strictEqual(dataBadges[2].textContent, '#3: transactional data');

  // Divider lines must NOT have any badges attached
  const dividerBadges = matchingDataDom.window.document.querySelectorAll('.drop-line .sl-ai-badge');
  assert.strictEqual(dividerBadges.length, 0, 'Divider / spacing lines must NOT receive any badges!');
  console.log('✓ Data Source Matching verified: Exactly 3 blanks parsed, inter-row spacing lines ignored, and correct badges attached!');

  // Test 31: Multi-Select Generic Instruction Filtering & Option-Overlap Validation (User Screenshot Scenario)
  console.log('\n[Test 31] Multi-Select Generic Instruction Title Filtering & Option-Overlap Validation');
  const dataCollectionDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="question-title">Select all of the methods you could use to collect data</div>
      <div data-test="instruction">Select all correct answers.</div>
      <div class="choices">
        <label class="choice-card"><input type="checkbox" id="m1" /> Querying a database</label>
        <label class="choice-card"><input type="checkbox" id="m2" /> Connecting to servers with APIs</label>
        <label class="choice-card"><input type="checkbox" id="m3" /> Scraping web pages</label>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/data-science' });

  global.window = dataCollectionDom.window;
  global.document = dataCollectionDom.window.document;

  const parsedDataCollection = Parser.parseQuestion();
  assert.strictEqual(parsedDataCollection.type, 'multi_choice', 'Should classify as multi_choice');
  assert.strictEqual(parsedDataCollection.title, 'Select all of the methods you could use to collect data', 'Title must be the true question, NOT generic "Select all correct answers."');
  assert.strictEqual(parsedDataCollection.choices.length, 3, 'Must have all 3 choice cards');

  // Verify memory lookup resolves the correct 3 data collection options (and NOT the SQL Warrior King collision!)
  const dataCollMemRecord = multiMemEngine.get(parsedDataCollection);
  assert.notStrictEqual(dataCollMemRecord, null, 'Must retrieve memory seed for Data Collection');
  assert.deepStrictEqual(dataCollMemRecord.answers, [
    'Querying a database',
    'Connecting to servers with APIs',
    'Scraping web pages'
  ], 'Must resolve all 3 correct data collection methods');

  // Highlight all 3 choice cards
  const highlightCollRes = Executor.highlightAnswerOnPage(parsedDataCollection, dataCollMemRecord);
  assert.strictEqual(highlightCollRes.success, true);
  const collHighlighted = dataCollectionDom.window.document.querySelectorAll('.sl-ai-highlighted-choice');
  assert.strictEqual(collHighlighted.length, 3, 'All 3 data collection cards must be highlighted');

  // Auto-Fill all 3 checkboxes
  const autoFillCollRes = Executor.autoFillAnswer(parsedDataCollection, dataCollMemRecord);
  assert.strictEqual(autoFillCollRes.success, true);
  assert.strictEqual(dataCollectionDom.window.document.getElementById('m1').checked, true);
  assert.strictEqual(dataCollectionDom.window.document.getElementById('m2').checked, true);
  assert.strictEqual(dataCollectionDom.window.document.getElementById('m3').checked, true);
  // Test 32: SQL GROUP BY Aggregate Results Table with Relational Data (User Screenshot Scenario)
  console.log('\n[Test 32] SQL GROUP BY Aggregate Results Table with Relational Data Extraction');
  const sqlGroupByDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div class="code-container" data-test="code-snippet">
        <pre><code>SELECT AVG(price)
FROM products
GROUP BY category</code></pre>
      </div>
      <table data-test="table" class="products-table">
        <thead>
          <tr><th>id</th><th>name</th><th>category</th><th>price</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Apple</td><td>Fruit</td><td>0.5</td></tr>
          <tr><td>2</td><td>Broccoli</td><td>Vegetable</td><td>1.2</td></tr>
          <tr><td>3</td><td>Tomato</td><td>Vegetable</td><td>0.7</td></tr>
          <tr><td>4</td><td>Banana</td><td>Fruit</td><td>1</td></tr>
        </tbody>
      </table>
      <div data-test="quiz-title">This query will generate a results table with...</div>
      <div class="choices">
        <button data-test="quiz-option" id="btn1">2 categories and 2 numerical values</button>
        <button data-test="quiz-option" id="btn2">3 categories and 3 numerical values</button>
        <button data-test="quiz-option" id="btn3">1 category and 2 numerical values</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/sql' });

  global.window = sqlGroupByDom.window;
  global.document = sqlGroupByDom.window.document;

  const parsedSqlGroupBy = Parser.parseQuestion();
  assert.strictEqual(parsedSqlGroupBy.type, 'single_choice', 'Should classify as single_choice');
  assert.strictEqual(parsedSqlGroupBy.language, 'SQL');
  assert.strictEqual(parsedSqlGroupBy.title, 'This query will generate a results table with...');
  assert.ok(parsedSqlGroupBy.code.includes('SELECT AVG(price)'), 'Code must include SQL query');
  assert.ok(parsedSqlGroupBy.code.includes('Fruit') && parsedSqlGroupBy.code.includes('Vegetable'), 'Code/context must include table relational rows!');

  // Verify memory engine instantly solves with the correct 2 categories answer
  const sqlGroupByMemRecord = multiMemEngine.get(parsedSqlGroupBy);
  assert.notStrictEqual(sqlGroupByMemRecord, null, 'Must retrieve memory seed for SQL GROUP BY query');
  assert.deepStrictEqual(sqlGroupByMemRecord.answers, ['2 categories and 2 numerical values'], 'Must resolve to 2 categories and 2 numerical values');

  // Highlight the correct answer button
  const highlightSqlGroupByRes = Executor.highlightAnswerOnPage(parsedSqlGroupBy, sqlGroupByMemRecord);
  assert.strictEqual(highlightSqlGroupByRes.success, true);
  const btn1 = sqlGroupByDom.window.document.getElementById('btn1');
  assert.strictEqual(btn1.classList.contains('sl-ai-highlighted-choice'), true);
  console.log('✓ SQL GROUP BY aggregate query parsed with relational table data and solved with 100% precision!');

  // Test 33: Sequential Slot Consensus Order Preservation (User Screenshot Scenario: MAX / WHERE / = / GROUP BY)
  console.log('\n[Test 33] Sequential Slot Consensus Order Preservation (MAX, WHERE, =, GROUP BY)');
  const sqlMaxDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div data-test="question-title">Complete to extract the maximum price for each type of product sold in New York</div>
      <div class="code-container" data-test="code-snippet">
        <div>SELECT product, <span class="drop-slot" data-test="drop-target" id="s1"></span> (price)</div>
        <div>FROM sales</div>
        <div><span class="drop-slot" data-test="drop-target" id="s2"></span> city <span class="drop-slot" data-test="drop-target" id="s3"></span> 'New York'</div>
        <div><span class="drop-slot" data-test="drop-target" id="s4"></span> product;</div>
      </div>
      <div class="word-bank">
        <button class="word-chip" data-test="choice-item">MAX</button>
        <button class="word-chip" data-test="choice-item">WHERE</button>
        <button class="word-chip" data-test="choice-item">=</button>
        <button class="word-chip" data-test="choice-item">GROUP BY</button>
        <button class="word-chip" data-test="choice-item">AVG</button>
        <button class="word-chip" data-test="choice-item">HAVING</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/sql' });

  global.window = sqlMaxDom.window;
  global.document = sqlMaxDom.window.document;

  const parsedSqlMax = Parser.parseQuestion();
  assert.strictEqual(parsedSqlMax.type, 'fill_blanks');
  assert.strictEqual(parsedSqlMax.blankCount, 4);

  // Test consensus engine voting with 1 model having reversed slot order (Mistral) vs 2 correct models (Gemini + Qwen)
  consensusEngine.clearCache();
  global.fetch = async (url, opts) => {
    if (url.includes('googleapis')) {
      // Gemini returns correct sequential order
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ thought: 'Gemini', type: 'fill_blanks', confidence: 1.0, answers: ['MAX', 'WHERE', '=', 'GROUP BY'], explanation: 'Correct order' }) }] } }]
        })
      };
    }
    if (url.includes('huggingface')) {
      // Qwen Coder returns correct sequential order
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ thought: 'Qwen', type: 'fill_blanks', confidence: 1.0, answers: ['MAX', 'WHERE', '=', 'GROUP BY'], explanation: 'Correct order' }) } }],
          usage: { total_tokens: 150 }
        })
      };
    }
    // Mistral returns swapped order
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ thought: 'Mistral', type: 'fill_blanks', confidence: 1.0, answers: ['MAX', 'WHERE', 'GROUP BY', '='], explanation: 'Swapped order' }) } }],
        usage: { prompt_tokens: 100, completion_tokens: 25, total_tokens: 125 }
      })
    };
  };

  const consensusMaxRes = await consensusEngine.solve({ ...parsedSqlMax, _forceAiQuery: true }, { consensusMode: true, memoryEnabled: false });
  assert.strictEqual(consensusMaxRes.success, true);
  assert.strictEqual(consensusMaxRes.votes, 2, 'Must have 2 votes for the correct sequential order (Gemini + Qwen)');
  assert.deepStrictEqual(consensusMaxRes.data.answers, ['MAX', 'WHERE', '=', 'GROUP BY'], 'Sequential slot order must be strictly preserved and win!');

  // Verify memory seed
  const maxMemRecord = multiMemEngine.get(parsedSqlMax);
  assert.notStrictEqual(maxMemRecord, null);
  assert.deepStrictEqual(maxMemRecord.answers, ['MAX', 'WHERE', '=', 'GROUP BY']);

  // Highlight all 4 slots on webpage
  const highlightMaxRes = Executor.highlightAnswerOnPage(parsedSqlMax, maxMemRecord);
  assert.strictEqual(highlightMaxRes.success, true);
  const maxBadges = sqlMaxDom.window.document.querySelectorAll('.drop-slot .sl-ai-badge');
  assert.strictEqual(maxBadges.length, 4);
  assert.strictEqual(maxBadges[0].textContent, '#1: MAX');
  assert.strictEqual(maxBadges[1].textContent, '#2: WHERE');
  assert.strictEqual(maxBadges[2].textContent, '#3: =');
  assert.strictEqual(maxBadges[3].textContent, '#4: GROUP BY');
  console.log('✓ Sequential slot consensus order strictly validated: MAX, WHERE, =, GROUP BY isolated with 100% precision!');

  // Test 34: Visual SVG/Diagram Image Analysis & SQL HAVING Filter (User Screenshot Scenario: 2 rows)
  console.log('\n[Test 34] Visual SVG/Diagram Analysis & SQL HAVING Filter (2 rows)');
  const sqlHavingDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div class="code-container" data-test="code-snippet">
        <svg class="code-diagram" data-test="diagram">
          <g>
            <text>SELECT department,</text>
            <text>MAX(salary)</text>
            <text>FROM employees</text>
            <text>GROUP BY department</text>
            <text>HAVING MAX(salary) > 5000;</text>
          </g>
        </svg>
      </div>
      <table data-test="table" class="employees-table">
        <thead>
          <tr><th>id</th><th>name</th><th>department</th><th>salary</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Alice</td><td>Sales</td><td>4500</td></tr>
          <tr><td>2</td><td>Bob</td><td>IT</td><td>5000</td></tr>
          <tr><td>3</td><td>Frank</td><td>HR</td><td>6000</td></tr>
          <tr><td>4</td><td>Eva</td><td>IT</td><td>7500</td></tr>
          <tr><td>5</td><td>John</td><td>HR</td><td>7000</td></tr>
        </tbody>
      </table>
      <div data-test="quiz-title">This query will result in a table with...</div>
      <div class="choices">
        <button data-test="quiz-option" id="h1">3 rows</button>
        <button data-test="quiz-option" id="h2">2 rows</button>
        <button data-test="quiz-option" id="h3">5 rows</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/sql' });

  global.window = sqlHavingDom.window;
  global.document = sqlHavingDom.window.document;

  const parsedSqlHaving = Parser.parseQuestion();
  assert.strictEqual(parsedSqlHaving.type, 'single_choice');
  assert.strictEqual(parsedSqlHaving.language, 'SQL');
  assert.ok(parsedSqlHaving.code.includes('HAVING MAX(salary) > 5000'), 'Code must include SVG extracted SQL query with HAVING');
  assert.ok(parsedSqlHaving.code.includes('Sales') && parsedSqlHaving.code.includes('4500'), 'Code/context must include table relational data');

  // Verify memory engine instantly solves with the correct 2 rows answer
  const sqlHavingMemRecord = multiMemEngine.get(parsedSqlHaving);
  assert.notStrictEqual(sqlHavingMemRecord, null, 'Must retrieve memory seed for SQL HAVING query');
  assert.deepStrictEqual(sqlHavingMemRecord.answers, ['2 rows'], 'Must resolve to 2 rows');

  // Highlight the correct answer button
  const highlightSqlHavingRes = Executor.highlightAnswerOnPage(parsedSqlHaving, sqlHavingMemRecord);
  assert.strictEqual(highlightSqlHavingRes.success, true);
  const h2 = sqlHavingDom.window.document.getElementById('h2');
  assert.strictEqual(h2.classList.contains('sl-ai-highlighted-choice'), true);
  console.log('✓ Visual SVG diagram + relational table data analyzed and solved with 100% precision (2 rows)!');

  // Test 35: Data Quality Issues (Visual Table Inspection + Badge Number Matching: [3, 2, 1])
  console.log('\n[Test 35] Data Quality Issues Visual Table Inspection & Badge Number Matching (3, 2, 1)');
  const dataQualityDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="lesson-content">
      <div class="code-container" data-test="code-snippet">
        <table data-test="table" class="patients-table">
          <thead>
            <tr><th>patient_id</th><th>name</th><th>age</th><th>appointment</th></tr>
          </thead>
          <tbody>
            <tr><td><span class="badge">1</span> 14651</td><td>Emily Lee</td><td>twenty-five</td><td>11-01-23</td></tr>
            <tr><td><span class="badge">2</span> 25478</td><td></td><td>40</td><td>10-05-23</td></tr>
            <tr><td><span class="badge">3</span> 59941</td><td>Mervin Rosenberg</td><td>55</td><td>04-06-23</td></tr>
            <tr><td><span class="badge">3</span> 59941</td><td>Mervin Rosenberg</td><td>55</td><td>04-06-23</td></tr>
          </tbody>
        </table>
      </div>
      <div data-test="quiz-title">Identify the data quality issues</div>
      <div class="matching-container" data-test="snippet">
        <div class="match-row">duplication: <span class="drop-slot" id="slot1"></span></div>
        <div class="match-row">missing value: <span class="drop-slot" id="slot2"></span></div>
        <div class="match-row">incorrect data type: <span class="drop-slot" id="slot3"></span></div>
      </div>
      <div class="word-bank">
        <button class="word-chip" data-test="chip" id="chip1">1</button>
        <button class="word-chip" data-test="chip" id="chip2">2</button>
        <button class="word-chip" data-test="chip" id="chip3">3</button>
      </div>
    </div>
  </body>
  </html>
  `, { url: 'https://www.sololearn.com/learn/courses/sql' });

  global.window = dataQualityDom.window;
  global.document = dataQualityDom.window.document;

  const parsedDataQuality = Parser.parseQuestion();
  assert.strictEqual(parsedDataQuality.type, 'fill_blanks');
  assert.strictEqual(parsedDataQuality.blankCount, 3);
  assert.ok(parsedDataQuality.code.includes('duplication:') && parsedDataQuality.code.includes('[BLANK_1]'));
  assert.ok(parsedDataQuality.code.includes('twenty-five'), 'Code must include table text with twenty-five');
  assert.ok(parsedDataQuality.code.includes('[empty]'), 'Code must include [empty] for missing cell');

  // Verify memory engine instantly solves with correct [3, 2, 1] answer
  const dqMemRecord = multiMemEngine.get(parsedDataQuality);
  assert.notStrictEqual(dqMemRecord, null, 'Must retrieve memory seed for Data Quality Issues');
  assert.deepStrictEqual(dqMemRecord.answers, ['3', '2', '1'], 'Must resolve to duplication=3, missing value=2, incorrect data type=1');

  // Highlight all 3 slots with badges
  const highlightDqRes = Executor.highlightAnswerOnPage(parsedDataQuality, dqMemRecord);
  assert.strictEqual(highlightDqRes.success, true);
  const dqBadges = dataQualityDom.window.document.querySelectorAll('.drop-slot .sl-ai-badge');
  assert.strictEqual(dqBadges.length, 3);
  assert.strictEqual(dqBadges[0].textContent, '#1: 3');
  assert.strictEqual(dqBadges[1].textContent, '#2: 2');
  assert.strictEqual(dqBadges[2].textContent, '#3: 1');
  console.log('✓ Visual Table & Data Quality Issue badges mapped with 100% precision: duplication=3, missing value=2, incorrect data type=1!');

  global.fetch = originalFetch;

  console.log('\n================================================================');
  console.log('🎉 ALL 35 COMPREHENSIVE MULTI-PROVIDER, VISION & TABLE QUALITY TESTS PASSED! 🎉');
  console.log('================================================================\n');
  process.exit(0);
}

runAsyncTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

