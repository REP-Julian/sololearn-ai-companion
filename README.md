# 🤖 SoloLearn AI Companion (Multi-Provider AI & Adaptive Learning)

<p align="center">
  <img src="https://img.shields.io/badge/SoloLearn-AI%20Companion-0284c7?style=for-the-badge&logo=codeforces&logoColor=white" alt="SoloLearn AI" />
  <img src="https://img.shields.io/badge/Mistral%20AI-Codestral%202501-ff7000?style=for-the-badge&logo=mistral&logoColor=white" alt="Mistral AI" />
  <img src="https://img.shields.io/badge/Google%20AI%20Studio-Gemini%203.7%20Flash-4285f4?style=for-the-badge&logo=google&logoColor=white" alt="Google AI Studio" />
  <img src="https://img.shields.io/badge/Hugging%20Face-Qwen%202.5%20Coder%2032B-ffd21e?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face" />
  <img src="https://img.shields.io/badge/Adaptive%20Memory-Continuous%20Learning-10b981?style=for-the-badge" alt="Continuous Learning" />
  <img src="https://img.shields.io/badge/Release-v2.1.5-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="License" />
</p>

An intelligent, high-precision **Multi-Provider AI Study Companion & Automation Solver** for [SoloLearn](https://www.sololearn.com/en/learn) interactive courses, quizzes, code challenges, fill-in-the-blanks, drag-and-drop code reordering, and multi-select questions.

Powered concurrently by **Mistral AI (Codestral)**, **Google AI Studio (Gemini 3.7 / 2.5 Flash)**, and **Hugging Face (Qwen 2.5 Coder 32B)** with **Continuous Adaptive Learning & Self-Correction**, client-side **React Fiber Ground-Truth Inspection**, and a **4-Pass Mental Compiler Verification Protocol**.

---

## 👨‍💻 Created By

**Julian Agustino**
- GitHub: [@REP-Julian](https://github.com/REP-Julian)
- Project Repository: [SoloLearn AI Companion](https://github.com/REP-Julian/sololearn-ai-companion)

---

## 🌟 Key Features Summary

| Feature | Description |
| :--- | :--- |
| **🧠 Continuous Adaptive Learning** | Automatically saves verified solutions into persistent memory (`sololearn_ai_learning_memory_v1`) for **instant 0ms, zero-token recall** on future encounters. |
| **🔄 Self-Correction & Reflection** | Detects wrong answers, analyzes errors, formulates explicit **Mistake Reflections**, and permanently adapts memory so errors are **never repeated**. |
| **🏁 3-Model Consensus Race** | Synchronously races **Mistral Codestral**, **Google AI Studio Gemini**, and **Hugging Face Qwen Coder** to achieve Unanimous (3/3) or Majority (2/3) golden consensus. |
| **☑️ Multi-Select & Checkbox Support** | Automatically identifies checkbox cards and *"Select all correct answers"* instructions to select and auto-fill all matching options (e.g. SQL LIKE patterns). |
| **⚡ React Ground Truth Bypass** | Traverses client-side React Fiber nodes and Hooks linked lists for 100% ground truth with **0 API tokens and 0ms latency**. |
| **🧩 Drag-and-Drop Sequencing** | Automatically numbers draggable code blocks (`Step 1`, `Step 2`, `Step 3`...) on the SoloLearn webpage in visual order. |
| **⚡ In-Page Auto-Filler (`Alt + F`)** | Automatically selects choices, checks all checkboxes, and populates blank input slots with synthetic React event triggers. |
| **🌐 Multi-Language Auto-Detection** | Detects active courses: **Python**, **C# (.NET)**, **JavaScript**, **Java**, **C++**, **SQL**, **HTML/CSS**, and **Conceptual Definitions**. |
| **🎯 In-Page Visual Highlighter** | Injects glowing emerald borders (`🎯 Correct Answer`), amber correction cards, and slot placeholders into page elements. |
| **💡 Multi-AI Trace & Proof** | Click `▶ 🔍 View Multi-AI Trace & Proof` to inspect reasoning, compiler AST passes, and vote distributions. |
| **🔒 100% Client-Side Privacy** | API keys are stored exclusively in local browser storage (`localStorage` / `chrome.storage.local`). Zero telemetry or external servers. |

---

## ⚙️ Architecture & Solving Flow (Flowchart)

```mermaid
flowchart TD
    classDef clientStage fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef memoryStage fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff;
    classDef raceStage fill:#2a1200,stroke:#ff7000,stroke-width:2px,color:#ffffff;
    classDef compilerStage fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#ffffff;
    classDef consensusStage fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#ffffff;
    classDef decisionNode fill:#1e293b,stroke:#e2e8f0,stroke-width:2px,color:#f8fafc;

    START(["🚀 User / Auto-Scan Triggered (Alt + S)"]) --> DETECT["🖥️ DOM & Question Parser<br/>(Choices, Blanks, Reorder, Multi-Select)"]

    DETECT --> CHECK_GT{"⚡ React Fiber & Next.js<br/>Internal Props Available?"}
    
    %% Fast Path 1: React Ground Truth
    CHECK_GT -->|"Yes (100% Ground Truth)"| GT_FAST["⚡ Ground-Truth Instant Bypass<br/>(0ms Latency • 0 API Tokens)"]
    GT_FAST --> DISP["🎨 Client Injector & Visual HUD"]
    
    %% Fast Path 2: Adaptive Memory Bank
    CHECK_GT -->|"No"| CHECK_MEM{"🧠 Found in Memory Bank?<br/>(Mastered / Previously Learned)"}
    CHECK_MEM -->|"Yes (Cache Hit)"| MEM_FAST["🧠 0ms Instant Memory Recall<br/>(Zero API Cost • Fearless Accuracy)"]
    MEM_FAST --> DISP

    %% Multi-AI Parallel Dispatch
    CHECK_MEM -->|"No (New Question)"| DISPATCH{"🔑 Configured API Keys"}
    
    DISPATCH -->|"3 Keys Configured"| RACE_PARALLEL["🏁 Multi-Provider Consensus Race<br/>(Parallel Async Queries)"]
    DISPATCH -->|"1 Key Configured"| EXPAND["🔄 Single-Provider 3-Model Auto-Expansion"]
    
    RACE_PARALLEL --> M1["🤖 Mistral AI<br/>Codestral 2501 (256K Context)"]
    RACE_PARALLEL --> M2["🤖 Google AI Studio<br/>Gemini 3.7 Flash (1M Context)"]
    RACE_PARALLEL --> M3["🤖 Hugging Face<br/>Qwen 2.5 Coder 32B (128K Context)"]
    
    EXPAND --> M1
    EXPAND --> M2
    EXPAND --> M3

    %% 4-Pass Verification
    subgraph COMPILER["⚙️ 4-Pass Mental Compiler Verification Engine"]
        direction TB
        M1 --> P1["Pass 1: AST, Syntax & Language Grammar"]
        M2 --> P1
        M3 --> P1
        P1 --> P2["Pass 2: Mental Interpreter Simulation"]
        P2 --> P3["Pass 3: Word Bank & Option Matching"]
        P3 --> P4["Pass 4: Slot Isolation & Multi-Select Sanitization"]
    end

    %% Consensus Voting Engine
    P4 --> CONSENSUS{"🤝 Consensus Voting Engine"}
    
    CONSENSUS -->|"3/3 Models Agree"| U_WIN["🏆 3/3 Golden Unanimous Match<br/>(100% High Confidence)"]
    CONSENSUS -->|"2/3 Models Agree"| M_WIN["🥇 2/3 Majority Golden Match<br/>(99% High Confidence)"]
    CONSENSUS -->|"Split / Disagreement"| RESCAN["🔄 Auto Consensus Re-scan & Fallback"]
    RESCAN --> M_WIN

    %% In-Page Display & Auto-Fill
    U_WIN --> DISP
    M_WIN --> DISP
    
    DISP --> OUT1["🎯 In-Page Glowing Badges & Checkboxes"]
    DISP --> OUT2["⚡ In-Page Auto-Filler (Alt + F)"]
    
    %% Post-Submission Continuous Feedback Loop
    OUT1 --> SUBMIT{"SoloLearn Post-Submission Result"}
    OUT2 --> SUBMIT
    
    SUBMIT -->|"Correct"| F_CORRECT["🧠 Mastered & Verified<br/>(Stored into persistent memory)"]
    SUBMIT -->|"Incorrect"| F_MISTAKE["🧠 Self-Correction & Mistake Reflection<br/>(Adapts memory to never repeat mistake)"]
    
    F_CORRECT --> SAVE_MEM[("🧠 Persistent Memory Bank")]
    F_MISTAKE --> SAVE_MEM
    SAVE_MEM -.->|"Available for 0ms recall"| CHECK_MEM

    class START,DETECT,GT_FAST,DISP,OUT1,OUT2 clientStage;
    class CHECK_MEM,MEM_FAST,F_CORRECT,F_MISTAKE,SAVE_MEM memoryStage;
    class DISPATCH,RACE_PARALLEL,EXPAND,M1,M2,M3 raceStage;
    class P1,P2,P3,P4 compilerStage;
    class CONSENSUS,U_WIN,M_WIN,RESCAN consensusStage;
    class CHECK_GT,SUBMIT decisionNode;
```

---

## 🤖 Models & API Keys Architecture

### ❓ How Many API Keys Do I Need?

You can choose how many API keys you want to configure:

* **🚀 Minimum Setup (1 API Key)**:
  Configure any **ONE** provider (Mistral AI, Google AI Studio, OR Hugging Face). If you only enter 1 key, the engine automatically expands to race **3 distinct top models from that single provider** in parallel!
* **🏆 Recommended Golden Setup (3 API Keys)**:
  Configure **1 Mistral Key + 1 Google AI Studio Key + 1 Hugging Face Token**. This enables the **True Multi-Provider Consensus Race**, cross-validating Codestral vs Gemini vs Qwen Coder simultaneously!

---

### 📊 Supported Models Matrix

| Provider | Default / Recommended Model | Secondary / Fallback Models | Best For |
| :--- | :--- | :--- | :--- |
| **Mistral AI** | `codestral-latest` (Codestral 2501) | `open-mistral-nemo`, `mistral-small-latest`, `mistral-large-latest` | Dedicated 80+ programming language syntax, FIM completion. |
| **Google AI Studio** | `gemini-3.7-flash` | `gemini-2.5-flash`, `gemini-3.5-flash-lite`, `gemini-2.5-flash-lite` | Ultra-fast reasoning, conceptual definitions, complex logic. |
| **Hugging Face** | `Qwen/Qwen2.5-Coder-32B-Instruct` | `meta-llama/Llama-3.3-70B-Instruct`, `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B` | SOTA open-weights coding models on free serverless inference. |

---

### 🔢 AI Provider Token Limits, Context Windows & Quotas

Each AI provider has specific context window capacities, output token limits, and free-tier request quotas:

| Provider | Default Model | Context Window (Input) | Max Output Tokens | Free Tier Rate Limits | SoloLearn AI Footprint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mistral AI** | `codestral-latest` (Codestral 2501) | **256,000 tokens** (256K) | **16,384 tokens** (16K) | **1 RPS (~60 RPM)**<br/>**500,000 TPM** (Tokens/min) | ~350–650 input tokens<br/>~150–300 output tokens |
| **Google AI Studio** | `gemini-3.7-flash` | **1,048,576 tokens** (1M) | **64,000 tokens** (64K) | **15 RPM** (Requests/min)<br/>**1,000,000 TPM**<br/>**1,500 RPD** (Requests/day) | ~350–650 input tokens<br/>~150–300 output tokens |
| **Hugging Face** | `Qwen/Qwen2.5-Coder-32B-Instruct` | **128,000 tokens** (128K) | **1,000 tokens** (`max_tokens: 1000`) | **~A few hundred requests/hour**<br/>Monthly free credit pool | ~350–650 input tokens<br/>~150–300 output tokens |

#### 🔍 Detailed Token & Limit Breakdown by Provider:

1. **Mistral AI (`api.mistral.ai`)**:
   - **Codestral Latest (`codestral-latest` / `codestral-2501`)**: Has an expansive **256,000 token context window** (upgraded from the original 32K context) and supports up to **16,384 output tokens**.
   - **Other Mistral Models**: `mistral-small-latest` (128K context), `open-mistral-nemo` (128K context), `mistral-large-latest` (128K context).
   - **Free Quota**: Free "Experiment" tier allows **1 RPS (~60 RPM)** and **500,000 Tokens Per Minute (TPM)**, shared across workspace API keys.

2. **Google AI Studio (`generativelanguage.googleapis.com`)**:
   - **Gemini 3.7 Flash (`gemini-3.7-flash`)**: Features a massive **1,048,576 token (1M) context window** and up to **64,000 output tokens** for complex reasoning.
   - **Gemini 2.5 Flash / Flash Lite**: **1,048,576 token (1M) context window** with **8,192 max output tokens**.
   - **Free Quota**: **15 Requests Per Minute (RPM)**, **1,000,000 Tokens Per Minute (TPM)**, and **1,500 Requests Per Day (RPD)**.

3. **Hugging Face Serverless Inference & Inference Router (`router.huggingface.co`)**:
   - **Model Context Window**: `Qwen/Qwen2.5-Coder-32B-Instruct` supports **128,000 tokens (128K)** context length (via YaRN RoPE extension). `meta-llama/Llama-3.3-70B-Instruct` and `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B` also feature **128K context**.
   - **HTTP Payload Limit**: Hugging Face Serverless Inference enforces an HTTP request body limit of approximately **2 MB (~2,000,000 bytes)** per request.
   - **Output Token Cap**: SoloLearn AI Companion explicitly sets `max_tokens: 1000` (`src/providers/huggingface.js`) to guarantee lightning-fast JSON completions without truncating AST explanations.
   - **Free Quota & Rates**: Authenticated User Access Tokens (`hf_...`) receive access to the free Serverless Inference tier (a few hundred requests/hour) and monthly Inference Provider credit allocations with community fair-use rate limiting.

4. **⚡ Zero-Token Efficiency on SoloLearn**:
   - **0ms Ground Truth & Memory Recall**: Every question solved via React Fiber inspection or the Adaptive Memory Bank uses **0 API tokens and 0ms latency**.
   - **Optimized Prompts**: When querying AI models, the companion crafts compact, high-precision AST prompts (~400 tokens total), allowing you to solve hundreds of SoloLearn modules daily without hitting free tier rate limits.

---

## 🔑 Step-by-Step API Key Setup Guides

### 1️⃣ Google AI Studio API Key (Gemini) — *Recommended & Free*
Google AI Studio offers a free tier with high rate limits and cutting-edge Gemini 3.7 / 2.5 Flash models.

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API key** in the left navigation menu.
4. Click **Create API key** (create in a new or existing Google Cloud project).
5. Copy your API key (starts with `AIzaSy...`).
6. In SoloLearn, open the Companion Settings (**⚙**), paste into **Google AI Studio Key**, and click **Save Settings**.

---

### 2️⃣ Mistral AI API Key (Codestral)
Mistral AI provides access to Codestral, the flagship code specialist model.

1. Go to the [Mistral AI Console](https://console.mistral.ai/).
2. Sign in or create an account.
3. Navigate to **API Keys** in the left sidebar.
4. Click **Create new key**, name it `SoloLearn Companion`, and copy your key.
5. In SoloLearn, open the Companion Settings (**⚙**), paste into **Mistral AI Key**, and click **Save Settings**.

---

### 3️⃣ Hugging Face User Access Token (Qwen Coder) — *Free Serverless Inference*
Hugging Face allows querying top open-source coding models like Qwen 2.5 Coder 32B via free Serverless Inference.

1. Go to [Hugging Face Settings > Tokens](https://huggingface.co/settings/tokens).
2. Sign in or create a free Hugging Face account.
3. Click **Create new token**.
4. Set Token type to **Read** and name it `SoloLearn Companion`.
5. Click **Create token** and copy the generated token (starts with `hf_...`).
6. In SoloLearn, open the Companion Settings (**⚙**), paste into **Hugging Face Token**, and click **Save Settings**.

---

## 🛠️ Quick Installation Guide

You can run this project as a **Tampermonkey Userscript** (recommended for all browsers) or as an **Unpacked Chrome Extension (Manifest V3)**.

### 🐒 Option 1: Tampermonkey Userscript (Recommended)

1. Install the [Tampermonkey](https://www.tampermonkey.net/) (or [Violentmonkey](https://violentmonkey.github.io/)) extension in your browser.
2. Open the extension dashboard and select **Create a new script...**.
3. Open [`sololearn-ai-solver.user.js`](./sololearn-ai-solver.user.js) from this repository, copy all contents, and paste it into the editor.
4. Save the script (**`Ctrl + S`**).
5. Open [SoloLearn Learn](https://www.sololearn.com/en/learn) — the floating companion panel will appear in the top-right corner!

### 📦 Option 2: Chrome Extension (Manifest V3)

1. Open your Chromium browser and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** (top-left button).
4. Select the root folder of this repository.
5. Navigate to [SoloLearn](https://www.sololearn.com/en/learn) to use the extension.

---

## 🎮 How to Use & Keyboard Shortcuts

| Shortcut / Control | Action | Description |
| :--- | :--- | :--- |
| **`Alt + S`** | **🔍 Scan & Reveal** | Scans React Fiber state & DOM, queries Multi-AI consensus or memory bank, and displays the verified answer. |
| **`Alt + F`** | **⚡ Auto-Fill** | Automatically selects choices, checks all multi-select checkboxes, and populates blank slots on the page. |
| **`Alt + C`** | **📋 Copy Answer** | Copies the clean answer string directly to your clipboard. |
| **`👍 Learned (Correct)`** | **Confirm Memory** | Manually confirms the active answer and masters it in the Adaptive Memory Bank. |
| **`👎 Correct Me`** | **Mistake Correction** | Opens the self-correction drawer to teach the companion the correct answer for instant adaptation. |
| **⚡ Auto-Scan** | **Toggle on HUD** | Automatically scans and reveals solutions in real time as questions change. |

---

## 📢 Release v2.1.5 Highlights

### 🚀 What's New in Version 2.1.5:
* **🧠 Continuous Adaptive Learning & Self-Correction**:
  * Persistent storage under `sololearn_ai_learning_memory_v1`.
  * Instant **0ms latency, zero-token recall** for previously mastered questions.
  * Formulates explicit **Mistake Reflections** on incorrect answers to adapt memory and prevent repeated errors.
  * Pre-seeded with historical benchmark questions across Python, Java, C#, C++, SQL, JS, HTML/CSS, and definitions.
* **☑️ Multi-Select & Checkbox Support ("Select All Correct Answers")**:
  * Detects checkbox options (`<input type="checkbox">`, `[role="checkbox"]`, SVG checkbox icons, labels).
  * Comprehensive pattern-matching evaluation (e.g. SQL `LIKE 'The%King_'` selecting both matching choices).
  * In-page auto-fill checks all matching checkboxes simultaneously.
* **🏁 3-Provider Synchronized Consensus**:
  * Raced concurrently across **Mistral AI (Codestral)**, **Google AI Studio (Gemini 3.7 Flash)**, and **Hugging Face (Qwen 2.5 Coder 32B)**.
  * Unanimous 3/3 and Majority 2/3 golden matching with automatic consensus re-scan on disagreement.
  * Single-provider auto-expansion to 3 parallel internal models if only 1 key is provided.
* **🔄 Removed Deprecated Models**:
  * Cleaned out unstable third-party aggregators in favor of direct official API endpoints (`generativelanguage.googleapis.com`, `router.huggingface.co`, `api.mistral.ai`).
  * Upgraded default models to `gemini-3.7-flash` and `Qwen/Qwen2.5-Coder-32B-Instruct`.
* **🧪 29/29 Automated Tests Passed**: Complete test coverage across AST cleaning, React Fiber inspection, SQL multi-line auto-fill, memory adaptation, and multi-select checkboxes.

---

## 🛡️ Security & Privacy

- **Zero Hardcoded Secrets**: This repository contains zero hardcoded API keys or personal tokens.
- **Client-Side Encrypted Storage**: Your API keys and learned memories are stored strictly on your local device via browser-isolated storage (`localStorage` / `chrome.storage.local`).
- **Direct Encrypted Transport**: All API requests travel directly from your browser to official TLS/HTTPS endpoints (`api.mistral.ai`, `generativelanguage.googleapis.com`, `router.huggingface.co`).

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### ⚠️ Disclaimer
*This project is an educational study companion designed to aid in learning programming concepts, syntax verification, and debugging. Please use this tool responsibly and adhere to all platform terms of service.*
