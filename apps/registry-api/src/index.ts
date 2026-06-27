import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.REGISTRY_API_PORT) || 4000;
const SHELL_ORIGIN = process.env.SHELL_ORIGIN || 'http://localhost:3000';
const REGISTRY_PATH = path.join(__dirname, '..', 'data', 'registry.json');

export interface ModuleEntry {
  moduleId: string;
  componentName: string;
  description: string;
  scaffoldedCode: string;
  createdAt: string;
}

function ensureRegistryFile(): void {
  const dir = path.dirname(REGISTRY_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify([], null, 2));
  }
}

function readRegistry(): ModuleEntry[] {
  ensureRegistryFile();
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  return JSON.parse(raw) as ModuleEntry[];
}

function writeRegistry(modules: ModuleEntry[]): void {
  ensureRegistryFile();
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(modules, null, 2));
}

const app = express();

app.use(
  cors({
    origin: SHELL_ORIGIN,
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/modules', (_req: Request, res: Response) => {
  try {
    const modules = readRegistry();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read registry' });
  }
});

app.post('/modules', (req: Request, res: Response) => {
  try {
    const { moduleId, componentName, description, scaffoldedCode, createdAt } =
      req.body;

    if (!moduleId || !componentName || !scaffoldedCode) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const modules = readRegistry();
    const existing = modules.find((m) => m.moduleId === moduleId);
    if (existing) {
      res.status(409).json({ error: 'Module already exists' });
      return;
    }

    const entry: ModuleEntry = {
      moduleId,
      componentName,
      description: description || '',
      scaffoldedCode,
      createdAt: createdAt || new Date().toISOString(),
    };

    modules.push(entry);
    writeRegistry(modules);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save module' });
  }
});

app.delete('/modules/:moduleId', (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const modules = readRegistry();
    const index = modules.findIndex((m) => m.moduleId === moduleId);

    if (index === -1) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    modules.splice(index, 1);
    writeRegistry(modules);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

app.listen(PORT, () => {
  console.log(`Registry API running at http://localhost:${PORT}`);
});
