# GraphWeave 🌐
### The Agentic Architecture & Real-Time Threat-Modeling Canvas for WebMCP

[![OpenAI WebMCP Challenge](https://img.shields.io/badge/OpenAI%20WebMCP-Challenge-blueviolet?style=for-the-badge&logo=openai)](https://webmcp.devpost.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12.4.2-ff0072?style=for-the-badge)](https://reactflow.dev/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

> **Submission for the OpenAI WebMCP Challenge (Devpost)**  
> Built for the future of human-agent software co-creation.

---

## 🚀 Live Demo & Video Pitch
- **Live Canvas Application:** [https://graphweave-app.vercel.app](https://graphweave-app.vercel.app)
- **Production Alias:** [https://graphweave-mbo2wbmzn-sujeendrans-projects.vercel.app](https://graphweave-mbo2wbmzn-sujeendrans-projects.vercel.app)
- **Demo Video:** Included in Devpost submission (3-minute pitch demonstrating autonomous architecture generation and STRIDE threat healing).

---

## 💡 What is GraphWeave?

Software architecture diagrams and threat models suffer from a fundamental disconnect:
1. **Static & Fragile:** Standard diagramming tools (Draw.io, Lucidchart) require tedious manual positioning and immediately fall out of sync with real systems.
2. **Text-Only Agents Hallucinate Topology:** Standard LLMs produce flat text or ASCII art that engineers cannot manipulate, inspect, or stress-test interactively.
3. **No Bi-directional State:** Existing AI design tools operate as one-way code generators rather than real-time collaborative partners inside the browser DOM.

**GraphWeave** is an intelligent, reactive architecture canvas powered by the **W3C WebMCP Standard**. Instead of writing code or outputting static diagrams, an AI agent directly manipulates, traverses, analyzes, and heals distributed software architectures live in the user's browser.

---

## ⚡ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Browser Window (Client Side)                      │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │               AI Agent / WebMCP Client Interface                │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │ WebMCP Tool Calls (JSON-RPC)         │
│                                  ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    WebMCP Host Bridge Hook                      │   │
│   │                  (window.navigator.modelContext)                │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │ Dispatches Direct Action             │
│                                  ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                 Zustand Global State Store                      │   │
│   │        - Nodes (id, type, threatLevel, metadata, pos)           │   │
│   │        - Edges (source, target, protocol, animated)             │   │
│   │        - Telemetry & Activity Feed                              │   │
│   └───────────────┬───────────────────────────────▲─────────────────┘   │
│                   │ Synchronous State Push        │ Drag / Drop / Click │
│                   ▼                               │ User Adjustments    │
│   ┌───────────────────────────────────────────────┴─────────────────┐   │
│   │            Interactive React Flow Visual Canvas                 │   │
│   │     - Custom Hardware/Cloud Service Nodes                       │   │
│   │     - Pulsing Threat Badges & Security Overlays                 │   │
│   │     - Dynamic Edge Routing (gRPC, TCP, HTTPS, AMQP)             │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │ Layout Geometry Pipeline             │
│                                  ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     Dagre Graph Layout Engine                   │   │
│   │      (Hierarchical left-to-right auto-positioning)              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ W3C WebMCP Protocol Tools & Resources

GraphWeave exposes fine-grained client-side tools and live resources via `navigator.modelContext`:

### 1. Tools Registered
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `add_service_node` | `id`, `label`, `serviceType`, `tier` | Spawn infrastructure components (gateway, compute, database, queue, cache, storage). |
| `connect_services` | `sourceId`, `targetId`, `protocol`, `isEncrypted` | Establish directed network edge with protocol attributes (HTTPS, gRPC, RESP3, TCP). |
| `flag_threat` | `nodeId`, `riskLevel`, `description`, `category` | Annotate services with STRIDE vulnerabilities (SPOF, Unencrypted, DDoS, Breach). |
| `apply_auto_layout` | `direction` (`LR` \| `TB`) | Trigger Dagre graph layout engine to balance and optimize node hierarchy. |

### 2. Resource Registered
- **URI:** `canvas://topology`
- **MIME:** `application/json`
- **Function:** Real-time snapshot of nodes, edges, unencrypted channels, and calculated security posture score (0-100) allowing agents to evaluate STRIDE compliance in real time.

---

## 🌟 Key Features

- **True WebMCP Leverage:** Tools mutate browser state synchronously with zero backend roundtrips.
- **Bi-Directional Co-Creation:** The human drags nodes, edits connections, or mitigates risks; the agent senses changes through `canvas://topology` and recalculates threats.
- **Autonomous Threat Healing:** One-click automated remediation provisions standby replicas and upgrades plaintext channels to mutual TLS (`mTLS`).
- **Real-Time Telemetry Stream:** Live HUD displaying incoming WebMCP JSON-RPC actions with distinction between agent and human operations.
- **Battle-Tested Presets:**
  - *PCI-DSS E-Commerce Pipeline*
  - *GenAI RAG Architecture with Vector DB*
  - *Event-Driven Microservices Mesh with Kafka*
- **100% Client-Side Deterministic State:** Zero external database or backend needed. Hosted globally on Vercel Edge.

---

## 💻 Local Development

### Prerequisites
- Node.js 20+ LTS
- npm 10+

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/<your-username>/graphweave.git
cd graphweave

# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## ☁️ Deploy to Vercel

```bash
# Install Vercel CLI (if needed)
npm install -g vercel

# Deploy directly to Vercel
vercel --prod
```

---

## 📜 License
MIT License. Created for the OpenAI WebMCP Challenge.
