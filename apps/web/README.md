---

# Oneiromantia — Frontend UI

The web-based visualizer for **Oneiromantia: Agentic Dream Journal & Pattern Analyst**. Built with **Next.js**, styled with TailwindCSS, and deployed globally via **Cloudflare Pages**, this interface provides an interactive dashboard to view multi-agent analysis pipelines, trace emotional arcs, and render procedural p5.js canvas visualizations.

---

## 🏗️ Architecture Flow

The frontend acts as a presentation layer that interacts with the Antigravity multi-agent workspace over a secure network boundary:

```
[ Next.js UI (Cloudflare) ] 
          │ (JSON over HTTPS)
          ▼
[ OrchestratorAgent (Antigravity ADK Runtime) ]
    ├── SymbolExtractorAgent
    ├── PatternAnalystAgent
    └── ArtGeneratorAgent ──► [ DreamJournalMCPServer Tools ]

```

---

## ✨ Features

* **Dream Intake Pipeline:** Interactive markdown logging window that passes entries smoothly to the `OrchestratorAgent`.
* **Visual Graph Execution Trace:** Real-time visibility into the parallel agent fan-outs (`SymbolExtractor` and `PatternAnalyst`).
* **Procedural Canvas:** Seamless client-side compilation of custom p5.js art scripts generated on-the-fly by the `ArtGeneratorAgent`.
* **Privacy First:** Secure session handling. No raw PII or plaintext session identifiers hit long-term storage (hashed immediately via SHA-256 server-side).

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js installed on your machine alongside your active WSL2/Ubuntu Antigravity ADK workspace.

```bash
node -v # Recommended: Node 18+ or 20+

```

### 2. Environment Configuration

Create a `.env.local` file in the root of this frontend folder:

```env
# URL where your agents-cli playground server is exposed locally
NEXT_PUBLIC_ADK_GATEWAY_URL="http://localhost:8000"

```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install

```

### 4. Run the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to view your dream journal interface.

---

## 🌐 Deployment to Cloudflare Pages

This project is optimized for execution on Cloudflare’s global edge network.

### Automated Git Deployments

1. Connect your GitHub repository to your **Cloudflare Dashboard**.
2. Select **Pages** -> **Create a Project** -> **Connect to Git**.
3. Use the following build settings:
* **Framework Preset:** `Next.js (Static HTML Export)` or `Next.js (SSR via Cloudflare Workers Advanced Mode)`
* **Build Command:** `npm run build`
* **Output Directory:** `.next` or `out` (depending on your static rendering mode)



---

## 🔒 Security Summary

* All user authentication parameters map to ephemeral session tokens.
* The frontend never stores un-hashed session keys or cache structures, keeping in line with the course evaluation rubric requirements for session security.

---