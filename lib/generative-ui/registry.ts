import type { ComponentType } from 'react';

/**
 * Per-demo registry of components that the agent can mount via the
 * generative-UI dispatcher (T27).
 *
 * Each demo (slug) registers a record of '{ ComponentName: Component }'
 * inside its 'components/demos/<slug>/index.ts' (M2 territory). The
 * dispatcher reads the active demo's slug, looks up the component name from
 * the wire envelope (T25), and renders it through the Canvas (T28).
 *
 * The registry is a module-level singleton, populated at import time. There
 * is no global state to clean up; reloading the page resets it.
 */

/**
 * Components registered for generative UI must accept arbitrary prop maps
 * decoded from the data channel. They are responsible for their own runtime
 * validation if they care about strict types.
 */
export type GenerativeComponent = ComponentType<Record<string, unknown>>;
export type ComponentMap = Record<string, GenerativeComponent>;

const REGISTRY = new Map<string, ComponentMap>();

/**
 * Registers (or replaces) the component map for a demo slug. Pass a fresh
 * 'map' object; the registry holds a reference, so external mutations leak.
 *
 * Idempotent. Calling twice with the same slug replaces the previous map
 * wholesale, so per-demo bundles can be hot-reloaded without leaking stale
 * components.
 */
export function registerForDemo(slug: string, map: ComponentMap): void {
  REGISTRY.set(slug, map);
}

/**
 * Removes a demo's component map from the registry. Useful for tests; not
 * called in production code.
 */
export function unregisterDemo(slug: string): void {
  REGISTRY.delete(slug);
}

/**
 * Returns the component for ('slug', 'componentName') or undefined if either
 * the slug is not registered or the name is missing from its map. The
 * dispatcher treats undefined as a no-op and warns once.
 */
export function resolve(slug: string, componentName: string): GenerativeComponent | undefined {
  const map = REGISTRY.get(slug);
  return map ? map[componentName] : undefined;
}

/**
 * Returns true when at least one component is registered for the slug. Lets
 * the Canvas (T28) render an empty-state hint when a demo has not loaded
 * its bundle yet.
 */
export function hasRegistration(slug: string): boolean {
  const map = REGISTRY.get(slug);
  return !!map && Object.keys(map).length > 0;
}

/**
 * Returns the names of every component registered for the slug, in the order
 * the bundle declared them. Useful for diagnostics / a debug panel.
 */
export function listComponents(slug: string): readonly string[] {
  const map = REGISTRY.get(slug);
  return map ? Object.keys(map) : [];
}

/**
 * Returns every slug that has at least one component registered.
 */
export function listRegisteredSlugs(): readonly string[] {
  return Array.from(REGISTRY.keys());
}
