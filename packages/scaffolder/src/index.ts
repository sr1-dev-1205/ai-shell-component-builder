function toKebabCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function sanitizeRawCode(rawCode: string): string {
  const lines = rawCode.split('\n');
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ')) return false;
    if (trimmed.startsWith('export ') && !trimmed.startsWith('export default')) return false;
    return true;
  });
  return filtered
    .join('\n')
    .trim()
    .replace(/export\s+default\s+function\s+/g, 'function ')
    .replace(/export\s+default\s+class\s+/g, 'class ')
    .replace(/export\s+default\s+/g, '');
}

export function scaffoldComponent(
  rawCode: string,
  componentName: string,
  description: string
): string {
  const moduleId = `${toKebabCase(componentName)}-${randomHex(4)}`;
  const timestamp = new Date().toISOString();
  const sanitizedRawCode = sanitizeRawCode(rawCode);

  return `// === SCAFFOLDED BY SHELL PLATFORM ===
// Component: ${componentName}
// Description: ${description}
// Scaffolded at: ${timestamp}

import React, { useEffect, useRef } from 'react'

// Shell contracts injected by scaffolder
const useShellBus = (moduleId) => {
  const emit = (event, payload) => {
    window.__SHELL_BUS__?.emit(event, payload, moduleId)
  }
  const on = (event, callback) => {
    window.__SHELL_BUS__?.on(event, moduleId, callback)
  }
  const off = (event) => {
    window.__SHELL_BUS__?.off(event, moduleId)
  }
  return { emit, on, off }
}

const useShellData = (key) => {
  return window.__SHELL_DATA__?.[key] ?? []
}

// ---- AI GENERATED LOGIC BELOW ----
const __MODULE_ID__ = '${moduleId}';
${sanitizedRawCode.replace(/useShellBus\s*\(\s*['"][^'"]*['"]\s*\)/g, 'useShellBus(__MODULE_ID__)')}
// ---- AI GENERATED LOGIC ABOVE ----

// Shell module registration
if (typeof window !== 'undefined') {
  window.__MODULE_REGISTRY__ = window.__MODULE_REGISTRY__ || {}
  window.__MODULE_REGISTRY__['${moduleId}'] = { componentName: '${componentName}' }
}

export default ${componentName}
`;
}

export function extractModuleId(scaffoldedCode: string): string | null {
  const match = scaffoldedCode.match(
    /window\.__MODULE_REGISTRY__\['([^']+)'\]/
  );
  return match ? match[1] : null;
}
