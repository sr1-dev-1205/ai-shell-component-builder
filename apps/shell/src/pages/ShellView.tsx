import { useState, useEffect, useCallback, Component, ReactNode } from 'react';
import { transform } from '@babel/standalone';
import { bus } from '@shell-platform/event-bus';
import { useShellStore } from '../store';

interface DynamicModuleProps {
  moduleId: string;
  componentName: string;
  scaffoldedCode: string;
  onStatusChange: (moduleId: string, status: 'loaded' | 'error') => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function prepareForRuntime(scaffoldedCode: string): string {
  const withoutImports = scaffoldedCode
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n');

  const code = `
const React = window.__REACT__;
const { useEffect, useRef, useState } = React;
${withoutImports}
`;

  const result = transform(code, {
    presets: ['react'],
    plugins: [],
  }).code;

  return result ?? code;
}

function DynamicModule({
  moduleId,
  scaffoldedCode,
  onStatusChange,
}: Omit<DynamicModuleProps, 'componentName'>) {
  const [LoadedComponent, setLoadedComponent] =
    useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let blobUrl: string | null = null;
    let cancelled = false;

    async function loadModule() {
      try {
        const blob = new Blob([prepareForRuntime(scaffoldedCode)], {
          type: 'text/javascript',
        });
        blobUrl = URL.createObjectURL(blob);
        const mod = await import(/* @vite-ignore */ blobUrl);

        if (cancelled) return;

        const DefaultExport = mod.default;
        if (!DefaultExport) {
          throw new Error('No default export found');
        }

        setLoadedComponent(() => DefaultExport);
        onStatusChange(moduleId, 'loaded');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Load failed');
          onStatusChange(moduleId, 'error');
        }
      } finally {
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      }
    }

    loadModule();

    return () => {
      cancelled = true;
      bus.clear(moduleId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [moduleId, scaffoldedCode, onStatusChange]);

  if (error) {
    return <p className="p-4 text-sm status-error">Error: {error}</p>;
  }

  if (!LoadedComponent) {
    return <p className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  }

  return <LoadedComponent />;
}

export default function ShellView() {
  const loadedModules = useShellStore((s) => s.loadedModules);
  const removeModule = useShellStore((s) => s.removeModule);
  const eventLog = useShellStore((s) => s.eventLog);

  const [moduleStatuses, setModuleStatuses] = useState<
    Record<string, 'loaded' | 'error' | 'loading'>
  >({});
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const [testEventName, setTestEventName] = useState('');
  const [testPayload, setTestPayload] = useState('{}');

  const handleStatusChange = useCallback(
    (moduleId: string, status: 'loaded' | 'error') => {
      setModuleStatuses((prev) => ({ ...prev, [moduleId]: status }));
    },
    []
  );

  const toggleEvent = (index: number) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleEmitTest = () => {
    if (!testEventName.trim()) return;

    let payload: unknown = {};
    try {
      payload = JSON.parse(testPayload);
    } catch {
      payload = { raw: testPayload };
    }

    bus.emit(testEventName.trim(), payload, 'shell-debug');
  };

  const displayEvents = eventLog.slice(0, 20);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-0">
      {/* Left: Module Grid */}
      <div className="w-[70%] overflow-y-auto pr-4">
        {loadedModules.length === 0 ? (
          <div className="cs-card flex h-full items-center justify-center">
            <div className="text-center">
              <p style={{ color: 'var(--text-secondary)' }}>No modules loaded</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Load modules from the Module Gallery
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {loadedModules.map((mod) => {
              const status = moduleStatuses[mod.moduleId] || 'loading';
              const dotColor =
                status === 'loaded'
                  ? 'var(--accent-green)'
                  : status === 'error'
                    ? 'var(--error)'
                    : 'var(--warning)';

              return (
                <div key={mod.moduleId} className="cs-card !p-0">
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border-split)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: dotColor }}
                      />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {mod.componentName}
                      </span>
                    </div>
                    <button
                      onClick={() => removeModule(mod.moduleId)}
                      className="btn-secondary !h-7 text-xs"
                    >
                      Unload
                    </button>
                  </div>
                  <ErrorBoundary
                    fallback={
                      <p className="p-4 text-sm status-error">Component crashed</p>
                    }
                  >
                    <DynamicModule
                      moduleId={mod.moduleId}
                      scaffoldedCode={mod.scaffoldedCode}
                      onStatusChange={handleStatusChange}
                    />
                  </ErrorBoundary>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Event Bus Monitor */}
      <div className="event-bus-panel cs-card flex w-[30%] flex-col !p-0">
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-split)' }}
        >
          <span
            className="pulse-dot inline-block h-2 w-2 rounded-full"
            style={{ background: 'var(--accent-green)' }}
          />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Event Bus Monitor
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {displayEvents.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No events yet
            </p>
          ) : (
            <ul className="space-y-2">
              {displayEvents.map((entry, index) => (
                <li
                  key={`${entry.timestamp.getTime()}-${index}`}
                  className="event-bus-entry"
                  onClick={() => toggleEvent(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="event-bus-name">{entry.event}</span>
                    <span className="event-bus-time">
                      {entry.timestamp.toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    from: {entry.sourceModuleId}
                  </p>
                  {expandedEvents.has(index) && (
                    <pre className="event-bus-payload">
                      {JSON.stringify(entry.payload, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-3" style={{ borderTop: '1px solid var(--border-split)' }}>
          <p className="mb-2 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            Manual Event Emitter
          </p>
          <input
            type="text"
            placeholder="Event name"
            value={testEventName}
            onChange={(e) => setTestEventName(e.target.value)}
            className="cs-input mb-2"
          />
          <input
            type="text"
            placeholder='JSON payload e.g. {"key": "value"}'
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            className="cs-input mb-2"
          />
          <button onClick={handleEmitTest} className="btn-primary w-full">
            Emit
          </button>
        </div>
      </div>
    </div>
  );
}
