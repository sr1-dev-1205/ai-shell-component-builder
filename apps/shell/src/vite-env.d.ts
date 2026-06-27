/// <reference types="vite/client" />

import { ShellEventBus } from '@shell-platform/event-bus';
import { mockData } from '@shell-platform/mock-data';

declare global {
  interface Window {
    __SHELL_BUS__?: ShellEventBus;
    __SHELL_DATA__?: typeof mockData;
    __MODULE_REGISTRY__?: Record<string, { componentName: string }>;
    __REACT__?: typeof import('react');
  }
}

export {};
