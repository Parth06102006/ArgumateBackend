# 🧠 Argumate: AI-Powered Debate Platform

**Argumate** is a real-time, AI-driven debate simulation platform where users can interact through **live speech**. The system processes user input via advanced AI models and responds logically by simulating various roles in formal debate formats like **British** and **Asian Parliamentary**.

---

## 🚀 Features

- 🎙️ Live **speech-to-text** using **AssemblyAI**
- 🤖 AI-generated rebuttals and arguments using **Gemini API** and **Hugging Face Transformers (Zephyr-7B)**
- 🧠 Support for **argument mining**, **sentiment analysis**, **emotion detection**, **summarization**, and **topic classification**
- 🗳️ Multi-role response simulation in British and Asian Parliamentary debate styles
- 🌐 Real-time interaction using **Socket.IO**
- 🔐 Backend authentication with **JWT** and session handling via **cookie-parser**
- 💾 Persistent session and user data stored in **MongoDB**

---

## 🧩 Tech Stack

### ⚙️ Backend
- **Node.js** with **Express.js**
- **MongoDB** (via Mongoose)
- **JWT** for authentication
- **cookie-parser** for session management
- **Socket.IO** for real-time bi-directional communication

### 🤖 AI/NLP Integration
- [**AssemblyAI**](https://www.assemblyai.com/) – Real-time speech transcription
- [**Gemini API (Google AI)**](https://ai.google.dev/) – Debate response generation
- [**Hugging Face Transformers**](https://huggingface.co/docs/api-inference/) – NLP tasks and Zephyr-7B for natural language generation

---

🔗 API Documentation

You can explore and test the available API endpoints using our shared Postman Collection:

👉 [Click here to view the Postman Collection](https://web.postman.co/workspace/My-Workspace~538649de-b637-4c17-809a-7b9aef500a67/collection/41274135-5070144e-c727-45af-8703-ff1cea3abf4c?action=share&source=copy-link&creator=41274135)


## 🧠 AI Capabilities Implemented

- Argument mining: Identifying claims, evidence, rebuttals
- Sentiment & emotion analysis: Understanding speaker tone
- Topic classification: Mapping speech to relevant motions
- Summarization: Concise reformulation of long inputs
- Natural language generation: Role-based AI responses
