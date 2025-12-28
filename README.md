
# SUIS Smart Hub / 智协 🚀

![Status](https://img.shields.io/badge/Status-Production_Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Tech](https://img.shields.io/badge/Stack-React_19_|_TypeScript_|_Vite-3178c6)
![AI](https://img.shields.io/badge/Powered_By-Google_Gemini_3.0-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**The AI Operating System for Next-Generation Educators.**

SUIS Smart Hub is a comprehensive, bilingual (English/Chinese), web-based dashboard designed to empower teachers with the full suite of Google's Gemini API capabilities. From generating 4K visual aids and cinematic educational videos to real-time voice tutoring and complex curriculum architecture, this platform unifies disjointed AI tools into a single, cohesive interface.

---

## 📑 Table of Contents

1.  [✨ Key Features](#-key-features)
2.  [🧠 AI Model Architecture](#-ai-model-architecture)
3.  [🛠 Tech Stack](#-tech-stack)
4.  [📂 Project Structure](#-project-structure)
5.  [🚀 Getting Started](#-getting-started)
6.  [🔑 Configuration & Environment](#-configuration--environment)
7.  [🐳 Docker & Deployment](#-docker--deployment)
8.  [🎨 UI/UX Design System](#-uiux-design-system)
9.  [⚠️ Troubleshooting](#-troubleshooting)

---

## ✨ Key Features

The application is organized into four primary domains, accessible via a responsive sidebar navigation.

### 1. Core (Planning & Pedagogy)
*   **Smart Assistant (ChatBot):** Context-aware chat with three modes: *Curriculum Designer* (Thinking model), *Admin Assistant* (Flash model), and *Creative Muse*.
*   **AI Training Academy:** Interactive modules teaching teachers how to use AI (Prompt Engineering, Ethics, Differentiation).
*   **Class Manager:** Automates report card comment generation and analyzes classroom CSV data for trends.
*   **Worksheet Wizard:** Generates formatted Markdown worksheets (Quizzes, Matching, Reading Comp).
*   **Listening Lab:** Creates full exam-style listening scripts, generates the corresponding questions, and synthesizes the audio using multi-speaker TTS.
*   **Assessment Tools:** AI grading of student work (supports text input and image uploads of handwriting).
*   **Wellbeing & SEL:** Generates mindfulness scripts, check-in questions, and student support plans.
*   **Differentiation Engine:** Instantly rewrites text into three tiers: Support, Core, and Enrichment.

### 2. Media (Content Creation)
*   **Visual Studio:** Generates high-fidelity educational diagrams and illustrations using `gemini-3-pro-image-preview`.
*   **Veo Video Engine:** Creates 720p/1080p educational videos using `veo-3.1-fast-generate-preview`.
*   **Video Planner:** Analyzes uploaded video files to generate lesson plans, vocabulary lists, and quizzes.
*   **Classroom DJ:** Generates curated playlists based on classroom activity vibe and AI-composed melodies via Lyria logic.
*   **Coloring Page Maker:** Creates printable, high-contrast black and white line art for students.

### 3. Global (Language & World)
*   **Live Language Tutor:** Real-time, low-latency voice conversation using `gemini-2.5-flash-native-audio`.
*   **Phonics Lab:** Specialized tool for ESL learners focusing on specific phonemes with TTS examples.
*   **Geo Discovery:** Interactive geography games including landmark identification via image recognition.
*   **BioByte:** An evolutionary biology simulation game where answering quizzes evolves a digital creature.
*   **Grounded Search:** Fact-checking and research tool utilizing Google Search and Maps grounding.

### 4. Tools (Utilities & Games)
*   **Smart Whiteboard:** An interactive canvas where drawings can be analyzed and math problems solved by vision models.
*   **Gamified Quiz (Pixel Quest):** A Roguelike RPG where students fight monsters by answering subject-specific questions.
*   **Physics Lab:** Interactive Canvas simulations (Projectile, Pendulum) analyzed by AI for physics principles.
*   **CS Voyager:** Coding curriculum for Web Dev and Algorithms with an AI code reviewer.
*   **T.O.M (The Omniscient Mind):** A sarcastic, British-accented persona chatbot showcasing advanced system instruction and TTS.

---

## 🧠 AI Model Architecture

This application strictly adheres to the `@google/genai` SDK standards and utilizes specific models for specific tasks to optimize for cost, latency, and quality.

| Feature Type | Model Used | Reason |
| :--- | :--- | :--- |
| **Complex Reasoning** | `gemini-3-pro-preview` | Used for lesson planning, STEM solving, and coding. High thinking budget (up to 8k tokens) enabled. |
| **Fast Text/Chat** | `gemini-3-flash-preview` | Used for admin tasks, translations, and real-time UI updates. Low latency. |
| **Image Generation** | `gemini-3-pro-image-preview` | Generates photorealistic and vector art (1K resolution). |
| **Video Generation** | `veo-3.1-fast-generate-preview` | Creates short video clips. Requires specific paid API key flow. |
| **Audio/Speech** | `gemini-2.5-flash-preview-tts` | Text-to-Speech with specific voice configs (Kore, Puck, Zephyr). |
| **Real-time Voice** | `gemini-2.5-flash-native-audio` | Used in Live Tutor and T.O.M for websocket-based low-latency audio streaming. |
| **Vision Analysis** | `gemini-3-pro-preview` | Analyzing handwriting, whiteboard sketches, and video frames. |

---

## 🛠 Tech Stack

### Frontend Core
*   **Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite 5](https://vitejs.dev/)
*   **Language:** [TypeScript 5](https://www.typescriptlang.org/)

### Styling & UI
*   **CSS Framework:** [Tailwind CSS 3.4](https://tailwindcss.com/)
*   **Design Paradigm:** Glassmorphism (Backdrop blur, translucent layers).
*   **3D Graphics:** [Three.js](https://threejs.org/) (Interactive background particles and dragons).
*   **Icons:** Custom SVG Icon Set.

### AI & Data
*   **SDK:** [`@google/genai`](https://www.npmjs.com/package/@google/genai)
*   **Markdown Rendering:** Custom parser for safe HTML output.
*   **Audio Processing:** Web Audio API (`ScriptProcessorNode`, `AudioContext`) for PCM encoding/decoding.

---

## 📂 Project Structure

```text
.
├── components/            # 50+ Specialized React Components
│   ├── AiTraining.tsx     # AI Learning Modules
│   ├── ChatBot.tsx        # Main Assistant
│   ├── GamifiedQuiz.tsx   # RPG Game Component
│   ├── LiveChat.tsx       # Real-time Audio
│   ├── ThreeBackground.tsx# 3D Background Visuals
│   └── ... (and many more)
├── services/
│   └── geminiService.ts   # Centralized API Configuration
├── utils/
│   └── audioUtils.ts      # PCM/WAV Encoding & Decoding helpers
├── App.tsx                # Main Router & Layout Logic
├── index.tsx              # Entry Point
├── index.html             # HTML Shell
├── package.json           # Dependencies & Scripts
├── Dockerfile             # Multi-stage build definition
├── vite.config.ts         # Bundler Configuration
└── tsconfig.json          # TypeScript Configuration
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   npm or yarn
*   A Google Cloud Project with the **Gemini API** enabled.

### Local Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/suis-smart-hub.git
    cd suis-smart-hub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    To run locally, you need to define your API key.
    
    *Option A (Quick):* Create a `.env` file in the root:
    ```env
    VITE_API_KEY=your_google_api_key_here
    ```
    *Note: The code uses `process.env.API_KEY` via a Vite define replacement.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 🔑 Configuration & Environment

The application relies heavily on the `API_KEY`.

*   **Standard Features:** Most features use the key injected at build time or runtime via `process.env.API_KEY`.
*   **Veo (Video) & Paid Features:** The `VideoTools.tsx` component includes an `ApiKeySelector`. This triggers a special OAuth/API key selection flow (`window.aistudio.openSelectKey`) required by Google for high-cost model usage like Veo.

**Metadata:**
Permissions for microphone and geolocation are requested in `metadata.json` for the Live API and Grounded Maps search features.

---

## 🐳 Docker & Deployment

The project includes a multi-stage `Dockerfile` optimized for Google Cloud Run.

### Building the Container

```bash
docker build -t suis-smart-hub .
```

### Running Locally (Docker)

```bash
# You must pass the API KEY as an environment variable
docker run -p 8080:8080 -e API_KEY="your_actual_api_key" suis-smart-hub
```

### Deploying to Google Cloud Run

1.  **Build and Submit:**
    ```bash
    gcloud builds submit --tag gcr.io/PROJECT-ID/suis-smart-hub
    ```
2.  **Deploy:**
    ```bash
    gcloud run deploy suis-smart-hub \
      --image gcr.io/PROJECT-ID/suis-smart-hub \
      --platform managed \
      --allow-unauthenticated \
      --set-env-vars API_KEY=your_api_key
    ```

---

## 🎨 UI/UX Design System

*   **Themes:** Fully supported Dark Mode (Space/Cyberpunk aesthetic) and Light Mode (Clean/Professional).
*   **Animations:** Uses native CSS animations (`animate-fade-in`, `animate-pulse`, `animate-float`) for performance.
*   **Responsiveness:** Mobile-first approach. Sidebar converts to an off-canvas drawer on smaller screens.
*   **Interactivity:** Glass panels, hover glows, and 3D background elements create a depth-rich environment.

---

## ⚠️ Troubleshooting

**1. "Microphone Access Denied" in Live Tutor:**
*   Ensure you are serving the app over `https://` or `localhost`. Browsers block audio input on insecure origins.

**2. Video Generation Fails:**
*   Veo models often require a specific billing-enabled project key. Use the "Select API Key" button within the Video Creator tab to authorize correctly.

**3. Audio Playback Issues:**
*   The raw PCM audio returned by Gemini is 24kHz. The `audioUtils.ts` handles downsampling/decoding. If audio sounds "chipmunk-like" or slow, check the `sampleRate` in `AudioTools.tsx`.

**4. Three.js Background Lag:**
*   The particle system scales based on device pixel ratio. If laggy on high-DPI screens, the renderer explicitly caps pixel ratio to 2 in `ThreeBackground.tsx`.

---

© 2025 SUIS Smart Hub. Built for the SUIS AI Competition.
