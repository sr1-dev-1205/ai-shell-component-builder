# ShellOS — AI-Native Supply Chain Shell Platform

A prototype of an AI-native Micro Frontend Shell 
Platform built for supply chain analytics. Users 
describe components in natural language, AI generates 
them, and they are dynamically loaded into the shell 
at runtime — no deployments, no code changes.

Built to demonstrate the core architecture of an 
AI-driven platform where every UI component is 
generated, scaffolded, validated, and deployed 
entirely through AI pipelines.

---

## What This Is

ShellOS is a proof-of-concept for a platform where:

- Users describe what they want in plain English
- AI generates a React component with supply chain logic
- A multi-stage pipeline validates and scaffolds it
- The component is registered and loaded dynamically
- Components communicate only through a shell event bus
- No static components, no hardcoded UI, everything is live

---

## Architecture
User Prompt (Playground)

↓

Stage 1: AI Generation (Ollama / deepseek-coder)

↓

Stage 2: AI Validation & Auto-fix

↓

Stage 3: Scaffolder (injects shell contracts)

↓

Stage 4: UIMem Integration Check (platform context)

↓

Sandpack Live Preview

↓

Registry API (persisted to registry.json)

↓

Shell View (Blob URL + dynamic import())

↓

Event Bus Monitor (real-time cross-module events)

### Shell Communication Model
Module A          Shell Event Bus         Module B

|                    |                    |

|── emit(event) ────>|                    |

|                    |── on(event) ──────>|

|                    |                    |
Modules never talk directly.

All communication goes through the shell only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Shell UI | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Event Bus | Custom hand-rolled ShellEventBus |
| AI Generation | Ollama (deepseek-coder) — local |
| Live Preview | Sandpack (@codesandbox/sandpack-react) |
| JSX Runtime | @babel/standalone (browser transpilation) |
| Registry API | Express + TypeScript |
| Storage | registry.json (file-based) |
| Platform Context | UIMem (UI Memory Module) |

---

## Project Structure
shell-platform/

├── apps/

│   ├── shell/                  # Vite + React shell (port 3000)

│   │   └── src/

│   │       ├── components/     # Layout, ErrorBoundary

│   │       ├── pages/          # Dashboard, Playground,

│   │       │                   # ModuleGallery, ShellView

│   │       ├── config/

│   │       │   ├── index.ts    # URL constants

│   │       │   └── uimem.ts    # UI Memory Module

│   │       ├── store/          # Zustand store

│   │       └── utils/

│   │           └── ollamaClient.ts

│   └── registry-api/           # Express API (port 4000)

│       └── src/

│           └── index.ts        # GET/POST/DELETE /modules

├── packages/

│   ├── event-bus/              # ShellEventBus class + singleton

│   ├── scaffolder/             # scaffoldComponent() function

│   └── mock-data/              # Supply chain mock data

├── pnpm-workspace.yaml

└── package.json

---

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Ollama ([https://ollama.com/download](https://ollama.com/download))

---

## Setup & Run

### 1. Install Ollama and pull the model

```bash
# Install Ollama (Ubuntu)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the code generation model (~776MB)
ollama pull deepseek-coder

# Ollama runs automatically as a service
# Verify it is running
ollama list
```

### 2. Install dependencies

```bash
cd shell-platform
pnpm install
```

### 3. Start all services

```bash
pnpm dev
```

This starts both services in parallel:
- Shell UI → http://localhost:3000
- Registry API → http://localhost:4000

---

## How to Use

### Generate a Component

1. Open [http://localhost:3000/playground](http://localhost:3000/playground)
2. Describe your component in the textarea
3. Enter a PascalCase component name
4. Click **Generate**
5. Watch the 4-stage AI pipeline run
6. Preview the live component in Sandpack
7. Click **Save to Registry**

### Example Prompt
Create an interactive supply chain command center.

Show a summary bar with total orders, in-transit

shipments, low stock alerts and supplier count as

clickable stat chips. Below show a filterable orders

table where user can filter by status and region.

When a row is clicked emit a shell event order:selected

with the full order object as payload.

Component name: `SupplyChainCommandCenter`

### Load in Shell View

1. Go to **Module Gallery**
2. Click **Load in Shell View** on your component
3. Go to **Live Shell View**
4. Your component renders dynamically from a Blob URL
5. Watch the **Event Bus Monitor** light up when 
   you interact with the component

### Modify with AI Chat

After generating a component, click:
**✦ Ask AI to modify this component**

Examples:
- "Change the table header color to match primary green"
- "Add a search bar above the orders table"
- "Make the status badges larger with bold text"
- "Add a click handler that emits supplier:selected"

---

## Key Concepts

### ShellEventBus
Hand-rolled pub/sub event emitter. Modules register 
on mount, emit events on user interaction, and listen 
to events from other modules — all through the shell. 
No direct module-to-module communication.

### UIMem (UI Memory Module)
A structured context object (`config/uimem.ts`) that 
holds complete platform knowledge:
- Shell contracts (available hooks and globals)
- Code generation rules
- Design system tokens
- Data schemas
- Event naming conventions
- Integration checklist

Every AI stage in the pipeline reads from UIMem to 
ensure generated components always integrate correctly.

### Scaffolder
Wraps raw AI-generated code with shell contracts:
- Injects `useShellBus()` hook
- Injects `useShellData()` hook
- Adds `window.__MODULE_REGISTRY__` registration
- Generates unique moduleId

### Dynamic Module Loading
Registered components are loaded at runtime:
1. Fetch scaffolded code string from registry
2. Transpile JSX with @babel/standalone
3. Create a Blob from transpiled code
4. Dynamic `import()` from Blob URL
5. Render returned default export

---

## Environment Variables

Copy `.env.example` and customize:

```bash
cp apps/shell/.env.example apps/shell/.env
```

```env
VITE_REGISTRY_API_URL=http://localhost:4000
VITE_OLLAMA_API_URL=http://localhost:11434
```

---

## Future Roadmap

- [ ] Replace Ollama with Claude API
- [ ] Replace registry.json with PostgreSQL
- [ ] Replace Blob URLs with esbuild + Cloudflare R2
- [ ] Add MCP servers to feed UIMem dynamically
  - GitHub MCP (live codebase context)
  - Design System MCP (Figma sync)
  - Registry MCP (live module awareness)
- [ ] Per-org module isolation
- [ ] Usage tracking + billing per AI call
- [ ] Module versioning and rollback
- [ ] Cross-module event schema registry

---

## Contributing

This is a private prototype. Not open for 
external contributions at this time.

---

## License

Private — All rights reserved.
Built as an internal prototype for ConverSight.ai.
