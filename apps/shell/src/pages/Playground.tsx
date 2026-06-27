import { useState, useEffect, useCallback } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from '@codesandbox/sandpack-react';
import { scaffoldComponent, extractModuleId } from '@shell-platform/scaffolder';
import { mockData } from '@shell-platform/mock-data';
import { REGISTRY_API_URL, OLLAMA_API_URL, OLLAMA_MODELS } from '../config';

type Status = 'Idle' | 'Generating...' | 'Scaffolding...' | 'Ready' | string;

interface RegistryModule {
  moduleId: string;
  componentName: string;
  description: string;
  scaffoldedCode: string;
  createdAt: string;
}

const DATA_SOURCES = [
  {
    key: 'orders',
    description: 'id, customer, product, quantity, status, deliveryDate, region',
  },
  {
    key: 'shipments',
    description: 'id, orderId, carrier, origin, destination, status, eta, weight',
  },
  {
    key: 'inventory',
    description: 'id, sku, productName, warehouse, quantity, reorderLevel, lastUpdated',
  },
  {
    key: 'suppliers',
    description: 'id, name, country, rating, leadTimeDays, category',
  },
];

const sandpackEntryCode = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

const shellGlobals = `
window.__SHELL_DATA__ = ${JSON.stringify(mockData)};
window.__SHELL_BUS__ = { 
  emit: () => {}, 
  on: () => {}, 
  off: () => {},
  clear: () => {}
};
`;

function highlightCode(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
    .replace(
      /\b(import|export|default|const|let|var|function|return|if|else|from|typeof|window)\b/g,
      '<span class="keyword">$1</span>'
    )
    .replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span class="string">$1$2$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
}

function extractCodeFromResponse(text: string): string {
  const codeBlockMatch = text.match(/```(?:jsx?|tsx?|javascript|react)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  const functionMatch = text.match(/function\s+\w+[\s\S]*/);
  if (functionMatch) {
    return functionMatch[0].trim();
  }
  const arrowMatch = text.match(/const\s+\w+\s*=[\s\S]*/);
  if (arrowMatch) {
    return arrowMatch[0].trim();
  }
  return text.trim();
}

async function callOllama(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (const model of OLLAMA_MODELS) {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed for model ${model}`);
      }

      const data = await response.json();
      return data.response as string;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All Ollama models failed');
}

export default function Playground() {
  const [description, setDescription] = useState('');
  const [componentName, setComponentName] = useState('');
  const [scaffoldedCode, setScaffoldedCode] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [status, setStatus] = useState<Status>('Idle');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [registryModules, setRegistryModules] = useState<RegistryModule[]>([]);

  const fetchRegistry = useCallback(async () => {
    try {
      const res = await fetch(`${REGISTRY_API_URL}/modules`);
      if (res.ok) {
        const data = await res.json();
        setRegistryModules(data);
      }
    } catch {
      // Registry API may not be running yet
    }
  }, []);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  const handleGenerate = async () => {
    if (!description.trim() || !componentName.trim()) {
      setStatus('Error: Description and component name are required');
      return;
    }

    const pascalName = componentName.trim();
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(pascalName)) {
      setStatus('Error: Component name must be PascalCase');
      return;
    }

    try {
      setStatus('Generating...');
      setScaffoldedCode('');
      setModuleId('');

      const prompt = `You are a React component generator for a supply chain platform.
Generate a single valid React functional component named ${pascalName}.

Task: ${description.trim()}

Available data (already provided via useShellData hook):
- orders: array of { id, customer, product, quantity, status, deliveryDate, region }
- shipments: array of { id, orderId, carrier, origin, destination, status, eta, weight }
- inventory: array of { id, sku, productName, warehouse, quantity, reorderLevel, lastUpdated }
- suppliers: array of { id, name, country, rating, leadTimeDays, category }

RULES:
- Do NOT import React, it is already available
- Do NOT import data, use: const orders = useShellData('orders')
- Use useShellBus() for events: const { emit, on, off } = useShellBus('${pascalName}')
- Use only inline styles or Tailwind classes (Tailwind is available)
- Return only the component function code, no imports, no exports
- Component must be a valid function named exactly ${pascalName}
- Keep it simple and functional, max 80 lines`;

      const rawResponse = await callOllama(prompt);
      const rawCode = extractCodeFromResponse(rawResponse);

      setStatus('Scaffolding...');
      const scaffolded = scaffoldComponent(rawCode, pascalName, description.trim());
      const extractedId = extractModuleId(scaffolded);

      setScaffoldedCode(scaffolded);
      setModuleId(extractedId || '');
      setStatus('Ready');
      setActiveTab('preview');
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Generation failed'}`);
    }
  };

  const handleSave = async () => {
    if (!scaffoldedCode || !moduleId) return;

    try {
      const res = await fetch(`${REGISTRY_API_URL}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          componentName: componentName.trim(),
          description: description.trim(),
          scaffoldedCode,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      await fetchRegistry();
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Save failed'}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${REGISTRY_API_URL}/modules/${id}`, { method: 'DELETE' });
      await fetchRegistry();
    } catch {
      setStatus('Error: Failed to delete module');
    }
  };

  const statusColor =
    status === 'Idle'
      ? 'status-idle'
      : status === 'Generating...'
        ? 'status-generating'
        : status === 'Scaffolding...'
          ? 'status-scaffolding'
          : status === 'Ready'
            ? 'status-ready'
            : status.startsWith('Error')
              ? 'status-error'
              : 'status-generating';

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-0">
      {/* Left Panel */}
      <div className="playground-left-panel flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto p-4">
        <div className="cs-card !p-4">
          <textarea
            rows={4}
            placeholder="Describe your component..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="cs-textarea"
          />
          <input
            type="text"
            placeholder="Component name (PascalCase)"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            className="cs-input mt-3"
          />
          <button
            onClick={handleGenerate}
            disabled={status === 'Generating...' || status === 'Scaffolding...'}
            className="btn-primary mt-3 w-full"
          >
            Generate
          </button>
          <p className={`mt-3 text-sm ${statusColor}`}>
            Status: {status}
          </p>
        </div>

        <div className="playground-data-section">
          <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Available Data
          </h4>
          <ul className="space-y-3">
            {DATA_SOURCES.map((source) => (
              <li key={source.key}>
                <span className="playground-data-label">{source.key}</span>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {source.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Middle Panel */}
      <div className="cs-card flex min-w-0 flex-1 flex-col !p-0">
        <div className="flex border-b" style={{ borderColor: 'var(--border-split)' }}>
          <button
            onClick={() => setActiveTab('preview')}
            className={`cs-tab${activeTab === 'preview' ? ' cs-tab-active' : ''}`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`cs-tab${activeTab === 'code' ? ' cs-tab-active' : ''}`}
          >
            Code
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'preview' ? (
            scaffoldedCode ? (
              <SandpackProvider
                template="react"
                theme="dark"
                files={{
                  '/shell-globals.js': { code: shellGlobals, hidden: true },
                  '/index.js': {
                    code: `import './shell-globals.js';\n${sandpackEntryCode}`,
                  },
                  '/App.js': { code: scaffoldedCode },
                }}
                customSetup={{
                  dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0',
                  },
                }}
                options={{
                  externalResources: ['https://cdn.tailwindcss.com'],
                }}
              >
                <SandpackLayout style={{ height: '100%', border: 'none' }}>
                  <SandpackPreview style={{ height: '100%' }} showOpenInCodeSandbox={false} />
                </SandpackLayout>
              </SandpackProvider>
            ) : (
              <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Generate a component to see the preview
              </div>
            )
          ) : scaffoldedCode ? (
            <pre
              className="code-block m-4 h-[calc(100%-2rem)] overflow-auto"
              dangerouslySetInnerHTML={{ __html: highlightCode(scaffoldedCode) }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Generate a component to see the code
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-[280px] shrink-0 flex-col gap-4 overflow-y-auto p-4">
        <div className="cs-card !p-4">
          <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Register Module
          </h4>
          {scaffoldedCode ? (
            <div className="space-y-2 text-sm">
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Component:</span>{' '}
                <span className="font-medium">{componentName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Description:</span>{' '}
                <span>{description || '—'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Module ID:</span>{' '}
                <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {moduleId}
                </span>
              </div>
              <button onClick={handleSave} className="btn-primary mt-2 w-full">
                Save to Registry
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No component generated yet
            </p>
          )}
        </div>

        <div className="cs-card !p-4">
          <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Registered Modules
          </h4>
          {registryModules.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No modules registered
            </p>
          ) : (
            <ul className="space-y-2">
              {registryModules.map((mod) => (
                <li
                  key={mod.moduleId}
                  className="flex items-center justify-between rounded px-3 py-2 text-sm"
                  style={{ border: '1px solid var(--border-split)' }}
                >
                  <span className="truncate font-medium">{mod.componentName}</span>
                  <button
                    onClick={() => handleDelete(mod.moduleId)}
                    className="btn-danger ml-2 shrink-0 !h-7 !px-2 text-xs"
                    title="Delete"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
