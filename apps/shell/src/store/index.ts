export interface ModuleEntry {
  moduleId: string;
  componentName: string;
  description: string;
  scaffoldedCode: string;
  createdAt: string;
}

export interface EventLogEntry {
  event: string;
  payload: unknown;
  sourceModuleId: string;
  timestamp: Date;
}

interface ShellStore {
  loadedModules: ModuleEntry[];
  eventLog: EventLogEntry[];
  addModule: (module: ModuleEntry) => void;
  removeModule: (moduleId: string) => void;
  logEvent: (entry: EventLogEntry) => void;
  clearEventLog: () => void;
}

import { create } from 'zustand';

export const useShellStore = create<ShellStore>((set) => ({
  loadedModules: [],
  eventLog: [],

  addModule: (module) =>
    set((state) => {
      if (state.loadedModules.some((m) => m.moduleId === module.moduleId)) {
        return state;
      }
      return { loadedModules: [...state.loadedModules, module] };
    }),

  removeModule: (moduleId) =>
    set((state) => ({
      loadedModules: state.loadedModules.filter((m) => m.moduleId !== moduleId),
    })),

  logEvent: (entry) =>
    set((state) => ({
      eventLog: [entry, ...state.eventLog].slice(0, 50),
    })),

  clearEventLog: () => set({ eventLog: [] }),
}));
