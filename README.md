# SUIS Smart Hub / 智协

**SUIS Smart Hub (智协)** is a next-generation web application designed to empower educators with the full suite of Google's Gemini 3.0 AI tools. From deep lesson planning to generating 4K educational visuals and videos, this app is the ultimate teacher's assistant.

## Features

*   **Teacher's Command Center (ChatBot):**
    *   **Curriculum Mode:** Unit plans, quiz generation, and IEP accommodations (Powered by Gemini 3.0 Pro with Thinking).
    *   **Admin Mode:** Draft parent emails, behavioral reports, and newsletters instantly.
    *   **Creative Mode:** Story starters, roleplay scenarios, and text simplification.

*   **Literacy Station (K-3 Focus):**
    *   Generate decodable reading passages targeting specific phonics rules (e.g., "sh", "silent e") and sight words.

*   **Career Connector (6-12 Focus):**
    *   Connect academic topics (Math, History, Science) to real-world careers and generate job-related student challenges.

*   **PBL Architect (Project Based Learning):**
    *   Design rigorous, multi-week projects.
    *   Generates Driving Questions, Entry Events, Student Products, and Milestones.

*   **Science Lab Generator:**
    *   Design safe, hands-on experiments based on available materials (e.g., "Kitchen Supplies" or "Full Lab").
    *   Includes safety precautions and scientific explanations.

*   **Debate & Critical Thinking Coach:**
    *   Generate debate briefs for any topic.
    *   Includes arguments, counter-arguments, rebuttals, and logical fallacy checks.

*   **Worksheet Wizard:**
    *   Instantly generate Markdown-formatted printable worksheets.
    *   Types: Multiple choice, matching, word problems, reading comprehension.

*   **Rubric Builder:**
    *   Generate professional Markdown grading rubrics for any assignment.
    *   Customize by grade level and scale (4-point, 5-point, etc.).
    
*   **Differentiation Engine:**
    *   Instantly rewrite any text into three levels: **Support** (ESL/Lower Lexile), **On-Level**, and **Enrichment** (Advanced).
    *   Uses `gemini-3-flash-preview` JSON mode for structured output.

*   **SEL Hub (Social Emotional Learning):**
    *   Generate relatable scenarios, discussion questions, and role-play activities to teach empathy, conflict resolution, and emotional regulation.

*   **Flashcard Generator:**
    *   Generate study decks for any topic.
    *   Includes a 3D-flip interactive preview.

*   **STEM Step-by-Step Solver:**
    *   Uses Gemini 3.0 Pro's **Thinking Mode** to break down complex Math and Science problems logically.
    *   Accepts photo uploads of equations.

*   **Classroom Escape Room Builder:**
    *   Generates a narrative-driven game with a Mission, Goal, and 3 distinct subject-based puzzles (and answer keys) to engage students.

*   **Global Communicator:**
    *   Translate parent emails and announcements into 9+ languages (including Chinese Simplified/Traditional).
    *   Adjusts tone (Professional, Warm, Urgent) for appropriate context.

*   **AI Assessment & Grading:**
    *   **Handwriting Analysis:** Upload photos of student work. Gemini 3.0 Pro analyzes, grades, and provides constructive feedback.
    *   **Rubric Integration:** Adjustable grading criteria based on grade level and subject.

*   **Classroom Visuals Generator:**
    *   Create stunning, high-definition (up to 2K) educational diagrams, posters, and illustrations using `gemini-3-pro-image-preview`.
    *   **Analyze:** Upload student work or textbook images for AI-powered analysis and feedback.

*   **Edu-Shorts Creator (Veo 3.1):**
    *   Generate 720p educational videos for engaging lesson intros or summaries using `veo-3.1-generate-preview`.
    *   Supports text-to-video and image-to-video workflows.

*   **Live Language Tutor:**
    *   Real-time, low-latency voice conversation with Gemini using the Live API (`gemini-2.5-flash-native-audio-preview`).
    *   Perfect for language teachers to demonstrate pronunciation or for students to practice conversation.

*   **Grounded Fact Checker:**
    *   Uses Google Search Grounding to find the most recent events, news, and facts for current events classes.
    *   Includes Google Maps integration for geography lessons.

*   **Lesson Gamifier:**
    *   Turn any dry topic into an engaging classroom game concept instantly.

*   **Magic Resource Converter:**
    *   Digitize worksheets via OCR, extract table data to CSV, and reformat text using Gemini vision capabilities.

## To-Do List (Future Roadmap)

We are building this app in chunks. Here are the next planned updates:

1.  **LMS Integration:** Simulate connection to Google Classroom or Canvas to "push" assignments.
2.  **PDF Export:** Allow teachers to download generated worksheets and unit plans as formatted PDFs.
3.  **Seating Chart Optimizer:** Use AI reasoning to suggest seating arrangements based on student behavior profiles.
4.  **Voice Memos:** Allow teachers to dictate grades/notes instead of typing.

## Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Glassmorphism theme)
*   **3D Graphics:** Three.js (Interactive background particle system)
*   **AI SDK:** `@google/genai` (Official Google GenAI SDK)
*   **Models:**
    *   `gemini-3-pro-preview`
    *   `gemini-3-flash-preview`
    *   `gemini-3-pro-image-preview`
    *   `veo-3.1-fast-generate-preview`
    *   `gemini-2.5-flash-native-audio-preview-09-2025`

## Setup & Installation

1.  **Clone the repository.**
2.  **Environment Variables:**
    Ensure you have a valid Google Gemini API Key. The app expects `process.env.API_KEY` to be injected by the environment.
3.  **Install Dependencies:**
    (Note: This project uses CDN imports via `importmap` for React and GenAI SDK to run without a build step in some environments, but for local dev, install via npm).
    ```bash
    npm install
    ```
4.  **Run:**
    ```bash
    npm start
    ```

## Copyright

**© 2025 SUIS Smart Hub**
All rights reserved. This software is designed for educational assistance purposes.

---
*Built with ❤️ for Teachers.*