import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGISTRY_API_URL } from '../config';
import { useShellStore, ModuleEntry } from '../store';

export default function ModuleGallery() {
  const [modules, setModules] = useState<ModuleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const addModule = useShellStore((s) => s.addModule);
  const navigate = useNavigate();

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${REGISTRY_API_URL}/modules`);
      if (!res.ok) throw new Error('Failed to fetch modules');
      const data = await res.json();
      setModules(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleLoad = (module: ModuleEntry) => {
    addModule(module);
    navigate('/shell-view');
  };

  const handleDelete = async (moduleId: string) => {
    try {
      await fetch(`${REGISTRY_API_URL}/modules/${moduleId}`, { method: 'DELETE' });
      await fetchModules();
    } catch {
      setError('Failed to delete module');
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading modules...</p>;
  }

  if (error) {
    return <p className="status-error">{error}</p>;
  }

  if (modules.length === 0) {
    return (
      <div className="cs-card text-center">
        <p style={{ color: 'var(--text-secondary)' }}>No modules registered yet.</p>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Use the Playground to generate and register components.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => (
        <div key={mod.moduleId} className="cs-card">
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {mod.componentName}
          </h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>
            {mod.description}
          </p>
          <p className="mt-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
            {mod.moduleId}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Created: {new Date(mod.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => handleLoad(mod)} className="btn-primary">
              Load in Shell View
            </button>
            <button onClick={() => handleDelete(mod.moduleId)} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
