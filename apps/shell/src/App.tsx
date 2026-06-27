import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { bus } from '@shell-platform/event-bus';
import { mockData } from '@shell-platform/mock-data';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ModuleGallery from './pages/ModuleGallery';
import ShellView from './pages/ShellView';
import { useShellStore } from './store';

const Playground = lazy(() => import('./pages/Playground'));

(window as Window & { __REACT__?: typeof React }).__REACT__ = React;

function App() {
  const logEvent = useShellStore((s) => s.logEvent);

  useEffect(() => {
    window.__SHELL_BUS__ = bus;
    window.__SHELL_DATA__ = mockData;
    (window as Window & { __REACT__?: typeof React }).__REACT__ = React;

    const originalEmit = bus.emit.bind(bus);
    bus.emit = (event: string, payload: unknown, sourceModuleId: string) => {
      logEvent({
        event,
        payload,
        sourceModuleId,
        timestamp: new Date(),
      });
      originalEmit(event, payload, sourceModuleId);
    };

    return () => {
      bus.emit = originalEmit;
    };
  }, [logEvent]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/playground"
          element={
            <Suspense
              fallback={
                <p style={{ color: 'var(--text-secondary)' }}>Loading Playground...</p>
              }
            >
              <Playground />
            </Suspense>
          }
        />
        <Route path="/modules" element={<ModuleGallery />} />
        <Route path="/shell-view" element={<ShellView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
