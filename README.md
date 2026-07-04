# Oneiromantia 🌙 → Agentic Dream Journal & Pattern Analyst

"A multi-agent system that ingests dream logs, extracts recurring symbols and emotional arcs, and generates procedural art visualizations from them."
---
---

## 📖 Overview
Oneiromantia is an agentic engineering solution designed for the *AI Agents: Intensive Vibe Coding Capstone Project*. It transforms fragmented dream journals into a structured, visual, and analytical experience. By utilizing a multi-agent swarm, Oneiromantia extracts Jungian archetypes, identifies long-term emotional patterns, and translates the subconscious into interactive p5.js 3D generative art.

### The Problem

Dream journaling is often a passive, unstructured task. Traditional apps fail to identify recurring symbolic clusters or provide a meaningful visual representation of the dreamer's internal landscape.

### The Solution

Oneiromantia employs a split-environment architecture using the Google Agent Development Kit (ADK) and the Model Context Protocol (MCP) to orchestrate specialized sub-agents that handle normalization, extraction, and artistic rendering.

---

## 🏗 Architecture: The Multi-Agent Swarm

Oneiromantia follows a Sequential Orchestration pattern with a parallel dispatch phase:

  1. **Process Orchestrator (oneiromantia_orchestrator):** Manages the 4-phase pipeline (Intake, Context Loading, Parallel Dispatch, and Assembly).
  2. **Symbol Extractor:** A specialist sub-agent that identifies archetypal motifs (e.g., "water," "tower") and flags recurring symbols via historical context.
  3. **Pattern Analyst:** Conducts cross-session analysis to report on emotional arcs and emerging themes.
  4. **Art Generator:** Translates symbol graphs into a complete p5.js 3D sketch using manual projection and depth-sorting (Painter's Algorithm).

### Data Layer: DreamJournalMCPServer

The MCP Server acts as the project's source of truth, providing resources like dream://entries and tools like save_entry to ensure the agents remain grounded in the user's historical data.

---

## 🛠 Technical Implementation (Kaggle Rubric)

This project demonstrates the three required key concepts from the Kaggle course:

  * Multi-agent System (ADK): Orchestrator + 3 specialized sub-agents.
  * MCP Server: Decoupled data management and tool execution.
  * Security Features: No plaintext PII storage and ephemeral session handling via UUIDs.

---

## 🚀 Getting Started

### **Local Development (Antigravity)**

  1. **Prerequisites:** Python 3.11+, WSL2 (Ubuntu 20.04), and the Antigravity CLI (agy).
  2. **Install ADK:** $"source .venv/bin/activate" + $"uv add google-adk"
  3. **Setup Skills:** Use agents-cli setup to install coding and scaffold skills.
  4. **Run:** Launch the interactive environment:

### **Cloud Deployment (Google Cloud Run)**

Oneiromantia is designed to be containerized and deployed as a serverless microservice.

  * **Backend:** FastAPI/MCP/Uvicorn running the ADK Orchestrator in a Docker container.
  * **Frontend:** React+Vite or Next.js hosted on Cloud Run, communicating via HTTPS.
  * **Database:** Persistent storage via Cloud Firestore or MongoDB Atlas.

---

## 🔒 Security & AI Generated Coding Principles

  * **PII Protection:** Raw dream text is never exposed in internal storage keys.
  * **Environment Safety:** All API keys are managed via .env (Local) or Kaggle Secrets (Online).
  * **AI Coding Agent:** Moving from "impressive" to "useful and sustainable" by utilizing Spec-Driven Development (SDD).

---

## 📜 License

This project is licensed under the Apache License, Version 2.0.

## ✍️ Author
CRENAZ (C) 2026 | Capstone Project submission to [AI Agents: Intensive Vibe Coding Capstone Project | Kaggle](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)
From:
[5-Day AI Agents: Intensive Vibe Coding Course With Google | Kaggle](https://www.kaggle.com/competitions/5-day-ai-agents-intensive-vibecoding-course-with-google/overview)
