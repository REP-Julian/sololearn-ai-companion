/**
 * Unit Test Suite for SoloLearn AI Companion
 * Tests 3-Pass OpenRouter Response Cleaning, SoloLearn Internal React Inspector, and DOM Parser & Highlighter.
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

const Config = require('../src/config.js');
const OpenRouterClient = require('../src/openrouter.js');

console.log('--- RUNNING SOLOLEARN AI COMPANION 3-PASS & INTERNAL INSPECTOR TEST SUITE ---');

// 1. Test OpenRouter 3-Pass Response Cleaning & Parsing
console.log('\n[Test 1] 3-Pass JSON Cleaning & Boundary Sanitization');
const client = new OpenRouterClient('mock-key');

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

console.log('✓ OpenRouter JSON cleaner passed all 3-pass cases.');

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

  // Test 6: OpenRouter Solver with Ground Truth Payload
  console.log('\n[Test 6] OpenRouterClient with Ground Truth Bypass');
  const solverClient = new OpenRouterClient('mock-key');
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

  console.log('\n======================================================');
  console.log('🎉 ALL 3-PASS, REACT INSPECTOR & REORDER TESTS PASSED! 🎉');
  console.log('======================================================\n');
  process.exit(0);
}

runAsyncTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
