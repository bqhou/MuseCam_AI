### MuseCam AI 
is a sophisticated, AI-powered video recording studio and personal diarist designed to turn lonely monologues into engaging, reflective dialogues.
Instead of just recording a video in silence, MuseCam provides a real-time "AI Friend" that listens to you as you speak and keeps the conversation flowing.

### Core Value Proposition

The app is built for vloggers, journalers, and anyone who wants to capture their thoughts but finds it difficult to talk to a static camera. It bridges the gap between a private diary and a guided interview.
<div align="center">
<!-- <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" /> -->
   <img width="732" height="537" alt="Screenshot 2026-01-02 at 6 03 44 PM" src="https://github.com/user-attachments/assets/aa150ae2-e1d3-4988-bdad-d7a88486ac00" />
<!-- ### Run and deploy your AI Studio app
This contains everything you need to run your app locally.
View your app in AI Studio: https://ai.studio/apps/drive/1MrqUCscUBP9YqmJ1Bw1js5SgHj57gi4c -->
</div>

### Key Features

Friend AI Persona: Unlike typical chatbots, the AI in MuseCam is programmed to be a supportive listener. It follows a "User Speaks First" rule, waiting for you to initiate the conversation before jumping in with short, casual follow-up questions (e.g., "How did that make you feel?" or "What happened next?").

Real-Time Interaction: Using the Gemini Live API, the AI processes your audio in real-time with low latency, allowing it to react to pauses or specific points in your story just like a human friend would.

Dynamic Topic Ideas: To help with "blank page syndrome," the app uses Gemini to generate creative, thought-provoking "Topic Ideas" (e.g., "Describe a place where you feel most at peace") to help you get started.

### Professional Video Tools:

Multi-Aspect Ratio Support: Record in 9:16 (for TikTok/Reels), 16:9 (for YouTube), 1:1, or 3:4.

In-Video Overlays: The AI’s questions and prompts are elegantly transcribed and displayed as an overlay on your recording for a "podcast-style" feel.

High-Quality Exports: Captures video at 1080p (where available) and allows for instant MP4 downloads once the session is complete.

### Technical Highlights

Gemini 2.5 Flash Native Audio: Powers the low-latency voice interaction and real-time transcription.

MediaRecorder & Canvas API: Enables real-time video cropping and high-quality rendering of the specified aspect ratios.

Privacy-Centric: The recording happens within the browser, allowing users to discard or download their sessions immediately.

### Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
