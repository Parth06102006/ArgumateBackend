# 🧠 Argumate: AI-Powered Debate Platform

**Argumate** is a real-time, AI-driven debate simulation platform where users can engage through **live speech**. It simulates structured debate formats like **British** and **Asian Parliamentary** using advanced AI technologies, delivering logical, role-based rebuttals and insights.

---

## 🚀 Features

- 🎙️ Live **speech-to-text** using **AssemblyAI**
- 🤖 AI-generated rebuttals and structured arguments via **Gemini API** and **Hugging Face Transformers (Zephyr-7B)**
- 🧠 NLP capabilities including:
  - **Argument mining**
  - **Sentiment analysis**
  - **Emotion detection**
  - **Summarization**
  - **Topic classification**
- 🗣️ Role-based response generation for **British** and **Asian Parliamentary** debate styles
- ✉️ Email verification using **Zoho Mail + Nodemailer**
- ✅ Email validity checking via **Hunter.io API**
- 🔧 Backend routes:
  - `getTopics`
  - `restartDebate`
  - `sentimentAnalysis`
  - `emotionalAnalysis`
  - ...and more

---

## 🧩 Tech Stack

### ⚙️ Backend
- **Node.js** with **Express.js**
- **MongoDB** (via Mongoose)
- **JWT** for authentication
- **cookie-parser** for session handling
- **Nodemailer** with **Zoho Mail** for secure email delivery
- **Hunter.io API** for email verification

### 🤖 AI/NLP Integration
- [**AssemblyAI**](https://www.assemblyai.com/) – Real-time speech transcription
- [**Gemini API (Google AI)**](https://ai.google.dev/) – Argument generation and rebuttals
- [**Hugging Face Transformers**](https://huggingface.co/docs/api-inference/) – NLP tasks (Zephyr-7B for natural language generation)

---

## 🧠 AI Capabilities Implemented

- **Argument mining**: Identifying claims, evidence, and rebuttals in real-time
- **Sentiment analysis**: Understanding emotional tone of the speaker
- **Emotion detection**: Classifying emotional states expressed in speech
- **Topic classification**: Mapping inputs to relevant debate motions
- **Summarization**: Concise reformulation of verbose or unclear inputs
- **Natural language generation**: Generating responses based on debate roles and logic
