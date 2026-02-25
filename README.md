# WODLab: AI-Powered CrossFit "Meta-Coach"

WODLab is a sophisticated workout generation system that internalizes the **CrossFit Level 1 Manual** to deliver safe, functional, and variation-aware programming. Unlike random generators, WODLab uses a multi-layered rules engine to ensure physical skill development and optimal stimulus.

## 🚀 Core Philosophy
- **Intelligence over Randomness:** Rule-based movement selection grounded in G/W/M modalities.
- **Data-Driven Adaptation:** Performance data feeds back into the model to identify weaknesses.
- **Methodology-First:** AI logic is grounded in the "Hopper" model and the "Theoretical Hierarchy of Development".

## 🏗️ The 4 Pillars of Architecture

### Pillar 1: The Movement Library (Rules Layer)
The source of truth for all movements, categorized by modality (G/W/M), family (Squat, Hinge, etc.), and progressive skill ladders (Beginner -> Scaled -> RX).

### Pillar 2: The Rules Engine (Context Layer)
- **Equipment Filtering:** Dynamically adapts to what you have.
- **Variance Checker:** Prevents muscle-group dominance and ensures pattern rotation via high-accuracy history analysis.
- **Template Assembly:** Supports 13 CrossFit protocols (AMRAP, EMOM, RFT, Tabata, Death-By, 21-15-9, Ladder, Chipper, Interval, Strength, and more).

### Pillar 3: The Coach Agent (AI Layer)
A RAG-powered middleware (Vertex AI + MongoDB Atlas Vector Search) that interprets the L1 Manual to provide:
- The "Why" behind the workout's stimulus.
- Personalized coaching and motivational cues.
- Dynamic scaling options based on athlete level.

### Pillar 4: The Performance Loop (Data Layer)
Structured performance tracking (numeric scoring, RPE, and completion rates) that informs future programming variance.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, TanStack Query.
- **Backend:** Node.js, Express, TypeScript.
- **Database:** MongoDB Atlas (Mongoose).
- **AI/RAG:** Vertex AI (Gemini 2.0) + Atlas Vector Search.

## 📁 Project Structure
- `/WODLab-V2/frontend`: React application.
- `/WODLab-V2/backend`: Express API and Logic Services.
- `/Docs`: Archive of implementation plans and manual summaries.
- `/Docs/Engineering`: Technical specifications (Architecture, Tasks, Master Prompt).
- `README.md`: This project entry point.
