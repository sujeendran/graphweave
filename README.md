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
│   │               (document.modelContext.registerTool)              │   │
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

GraphWeave natively implements the **WebMCP (Web Model Context Protocol)** standard by exposing fine-grained architecture tools and live resources directly via **`document.modelContext.registerTool()`**:

### Standard WebMCP Registration Pattern
Each tool is registered imperatively on `document.modelContext` with standard schemas and abort lifecycle signals:

```javascript
// Exposing tools via document.modelContext.registerTool()
document.modelContext.registerTool({
  name: 'run_architecture_audit',
  description: 'Execute the real-time Architecture Linter on the canvas to detect SPOFs, unencrypted channels, and compliance violations.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const report = getAuditReport();
    return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
  },
}, { signal: controller.signal });
```

### 1. Tools Registered via `document.modelContext.registerTool()`
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `run_architecture_audit` | `{}` | Execute real-time Architecture Linter across canvas nodes & edges to detect SPOFs and plaintext risks. |
| `auto_remediate_violation` | `violationId` | Autonomously execute architectural remediation (provision replicas, upgrade to mTLS, insert message queues). |
| `add_service_node` | `id`, `label`, `serviceType`, `tier` | Spawn infrastructure components (gateway, compute, database, queue, cache, storage). |
| `remove_service_node` | `nodeId` | Decommission a service node from the canvas and safely clean up all connected edges. |
| `add_connection` | `sourceId`, `targetId`, `protocol`, `isEncrypted` | Establish directed network edge with protocol attributes (HTTPS, gRPC, PostgreSQL Wire, Redis, Kafka, TCP). |
| `remove_connection` | `sourceId`, `targetId` | Sever a network communication link between two services. |
| `flag_threat` | `nodeId`, `riskLevel`, `description`, `category` | Annotate services with STRIDE vulnerabilities (SPOF, Unencrypted, DDoS, Breach, Tampering, Chaos_Outage). |
| `resolve_threat` | `nodeId`, `remediationNote` | Resolve identified threat on a node, restoring healthy compliance posture. |
| `simulate_chaos_outage` | `nodeId`, `scenario` (`crash` \| `high_latency` \| `ddos`) | Simulate chaos engineering service outage and evaluate cascading dependency impacts across the graph. |
| `reset_canvas` | `{}` | Reset visual canvas to a blank slate by clearing all nodes and connections. |
| `apply_auto_layout` | `direction` (`LR` \| `TB`) | Trigger Dagre graph layout engine to balance and optimize node hierarchy. |
| `get_topology_snapshot` | `{}` | Return complete architecture topology, node metadata, connections, and posture score. |

### 2. Live Resources Registered via `document.modelContext.registerResource()`
| Resource URI | MIME Type | Purpose |
| :--- | :--- | :--- |
| `canvas://topology` | `application/json` | Real-time snapshot of nodes, edges, encrypted channels, and overall security posture score (0-100). |
| `canvas://audit-report` | `application/json` | Structured report of current violations, severity counts, and automated remediation quick-fix actions. |

*(For maximum compatibility across experimental agent runtimes and extensions, `document.modelContext` is also mirrored to `window.modelContext` and `navigator.modelContext`, with a standard-compliant polyfill installed if the browser environment does not natively expose it yet).*

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
