/**
 * Unit Test Suite for SoloLearn AI Companion
 * Verifies DOM Parsing, OpenRouter payload cleaner, and In-Page Visual Highlighter.
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

const Config = require('../src/config.js');
const OpenRouterClient = require('../src/openrouter.js');

console.log('--- RUNNING SOLOLEARN AI COMPANION TEST SUITE ---');

// 1. Test OpenRouter Response Cleaning & Parsing
console.log('\n[Test 1] OpenRouter JSON Cleaning');
const client = new OpenRouterClient('mock-key');

const json1 = '{"thought": "Python print requires parentheses", "type": "single_choice", "confidence": 0.99, "answers": ["print(\'Hello\')"], "explanation": "Standard print"}';
assert.deepStrictEqual(client.cleanJsonResponse(json1), {
  thought: 'Python print requires parentheses',
  type: 'single_choice',
  confidence: 0.99,
  answers: ["print('Hello')"],
  explanation: 'Standard print'
}, 'Should parse direct JSON with thought');

const json2 = '```json\n{"thought": "C++ variable declaration", "type": "fill_blanks", "confidence": 0.98, "answers": ["int", ";"], "explanation": "C++ declaration"}\n```';
assert.deepStrictEqual(client.cleanJsonResponse(json2), {
  thought: 'C++ variable declaration',
  type: 'fill_blanks',
  confidence: 0.98,
  answers: ['int', ';'],
  explanation: 'C++ declaration'
}, 'Should strip markdown fences');

console.log('✓ OpenRouter JSON cleaner passed all cases.');

// 2. Test DOM Parser & Visual Highlighter
console.log('\n[Test 2] SoloLearn DOM Parsing & Visual Highlighter');

const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div data-test="lesson-content">
    <h2 data-test="quiz-title">What is the output of the following code?</h2>
    <pre data-test="code-snippet">
x = 5
y = 10
print(x + y)
    </pre>
    <div class="choices">
      <button data-test="quiz-option">15</button>
      <button data-test="quiz-option">510</button>
      <button data-test="quiz-option">Error</button>
    </div>
    <button data-test="check-button">Check</button>
  </div>
</body>
</html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLElement.prototype.scrollIntoView = function() {};
global.performance = { now: () => Date.now() };

const Parser = require('../src/parser.js');
const Executor = require('../src/executor.js');

async function runAsyncTests() {
  const parsed = Parser.parseQuestion();
  assert.strictEqual(parsed.type, 'single_choice');
  assert.strictEqual(parsed.options.length, 3);
  console.log('✓ Single-choice question detected & parsed correctly.');

  // Test Visual Highlighting on Single Choice
  const highlightResult = Executor.highlightAnswerOnPage(parsed, {
    type: 'single_choice',
    answers: ['15'],
    explanation: '5 + 10 equals 15'
  });

  assert.strictEqual(highlightResult.success, true);
  assert.strictEqual(parsed.choices[0].element.classList.contains('sl-ai-highlighted-choice'), true);
  assert.notStrictEqual(parsed.choices[0].element.querySelector('.sl-ai-badge'), null);
  console.log('✓ Correct answer card visually highlighted with glowing green badge on page.');

  // Test Fill-in-the-blanks Highlighting
  const fillDom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div data-test="quiz-container">
      <h2 data-test="quiz-title">Fill in the blanks to print Hello World</h2>
      <div data-test="code-snippet">
        <code><input type="text" id="blank1" />("Hello World")<input type="text" id="blank2" /></code>
      </div>
      <button data-test="check-button">Check</button>
    </div>
  </body>
  </html>
  `);

  global.window = fillDom.window;
  global.document = fillDom.window.document;

  const parsedBlanks = Parser.parseQuestion();
  assert.strictEqual(parsedBlanks.type, 'fill_blanks');

  Executor.highlightAnswerOnPage(parsedBlanks, {
    type: 'fill_blanks',
    answers: ['print', ';']
  });

  const input1 = fillDom.window.document.getElementById('blank1');
  const input2 = fillDom.window.document.getElementById('blank2');
  assert.strictEqual(input1.placeholder, 'print');
  assert.strictEqual(input2.placeholder, ';');
  console.log('✓ Fill-in-the-blanks placeholders populated with answer guide.');

  console.log('\n========================================');
  console.log('🎉 ALL COMPANION TESTS PASSED! 🎉');
  console.log('========================================\n');
  process.exit(0);
}

runAsyncTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
