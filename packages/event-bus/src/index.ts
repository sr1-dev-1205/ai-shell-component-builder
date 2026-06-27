export class ShellEventBus {
  private listeners: Record<string, Record<string, Function>> = {};

  on(event: string, moduleId: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = {};
    }
    this.listeners[event][moduleId] = callback;
  }

  off(event: string, moduleId: string): void {
    if (this.listeners[event]) {
      delete this.listeners[event][moduleId];
      if (Object.keys(this.listeners[event]).length === 0) {
        delete this.listeners[event];
      }
    }
  }

  emit(event: string, payload: unknown, sourceModuleId: string): void {
    const eventListeners = this.listeners[event];
    if (!eventListeners) return;

    for (const [moduleId, callback] of Object.entries(eventListeners)) {
      if (moduleId !== sourceModuleId) {
        callback(payload, sourceModuleId);
      }
    }
  }

  clear(moduleId: string): void {
    for (const event of Object.keys(this.listeners)) {
      if (this.listeners[event][moduleId]) {
        delete this.listeners[event][moduleId];
        if (Object.keys(this.listeners[event]).length === 0) {
          delete this.listeners[event];
        }
      }
    }
  }

  listEvents(): string[] {
    return Object.keys(this.listeners);
  }
}

export const bus = new ShellEventBus();
