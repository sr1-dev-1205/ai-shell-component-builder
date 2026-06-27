export const SHELL_ORIGIN =
  import.meta.env.VITE_SHELL_ORIGIN || 'http://localhost:3000';

export const REGISTRY_API_URL =
  import.meta.env.VITE_REGISTRY_API_URL || 'http://localhost:4000';

export const OLLAMA_API_URL =
  import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434';

export const OLLAMA_MODELS = ['deepseek-coder', 'codellama'] as const;

export const ORG_NAME = 'demo-org';
