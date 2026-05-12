'use client';

import { useEffect } from 'react';
import { type Room, RoomEvent } from 'livekit-client';
import { create } from 'zustand';
import { UI_EVENT_TOPIC, decodeUiEvent } from './protocol';

/**
 * Generative UI dispatcher.
 *
 * Owns a Zustand store of active component instances keyed by id. The
 * 'useUiDispatcher(room)' hook binds a LiveKit Room to the store: it
 * subscribes to 'RoomEvent.DataReceived', decodes the payload via
 * 'protocol.decodeUiEvent', and applies the action (mount/update/unmount).
 * The Canvas (T28) reads from the store and renders each instance through
 * the registry (T26).
 *
 * Event coalescing: 'update' events for the same id within a single animation
 * frame are merged via 'requestAnimationFrame'. A burst of 100 prop updates
 * for one component flushes once at frame end. mount/unmount go through
 * synchronously so structural changes are not delayed.
 *
 * Malformed events are dropped with a single throttled 'console.warn' (one
 * per session, not one per frame, to stay friendly to the devtools console).
 */

export interface UiInstance {
  id: string;
  component: string;
  props: Record<string, unknown>;
  mountedAt: number;
}

interface UiStoreState {
  instances: Record<string, UiInstance>;
  mount: (id: string, component: string, props: Record<string, unknown>) => void;
  update: (id: string, props: Record<string, unknown>) => void;
  unmount: (id: string) => void;
  clear: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  instances: {},
  mount: (id, component, props) =>
    set((state) => ({
      instances: {
        ...state.instances,
        [id]: { id, component, props, mountedAt: Date.now() },
      },
    })),
  update: (id, props) =>
    set((state) => {
      const existing = state.instances[id];
      if (!existing) return state;
      return {
        instances: {
          ...state.instances,
          [id]: { ...existing, props: { ...existing.props, ...props } },
        },
      };
    }),
  unmount: (id) =>
    set((state) => {
      if (!(id in state.instances)) return state;
      const next = { ...state.instances };
      delete next[id];
      return { instances: next };
    }),
  clear: () => set({ instances: {} }),
}));

/**
 * Returns the active instances as an array, ordered by mount time.
 * Convenience selector for the Canvas.
 */
export function selectInstances(state: UiStoreState): UiInstance[] {
  return Object.values(state.instances).sort((a, b) => a.mountedAt - b.mountedAt);
}

/**
 * Binds a LiveKit Room to the dispatcher. Pass null when the session is not
 * live (the hook becomes a no-op and the store is left intact). Call once
 * inside a component that lives inside the active RoomContext.
 *
 * Pass 'slug' so the store can be cleared when the visitor switches demos.
 * The room-disconnect cleanup intentionally does NOT clear the store; the
 * end-of-call Cost panel needs to persist into the EndedBody view in
 * 'components/playground/VoiceSurface.tsx'. The slug-keyed effect below
 * does the clearing on demo change (and on first mount, which is a no-op
 * when the store is already empty).
 */
export function useUiDispatcher(room: Room | null, slug?: string): void {
  useEffect(() => {
    if (!room) return;

    let warned = false;

    const pendingUpdates = new Map<string, Record<string, unknown>>();
    let rafHandle: number | null = null;

    const flush = () => {
      rafHandle = null;
      const entries = Array.from(pendingUpdates.entries());
      pendingUpdates.clear();
      for (const [id, props] of entries) {
        useUiStore.getState().update(id, props);
      }
    };

    const scheduleUpdate = (id: string, props: Record<string, unknown>) => {
      const merged = { ...(pendingUpdates.get(id) ?? {}), ...props };
      pendingUpdates.set(id, merged);
      if (rafHandle === null && typeof window !== 'undefined') {
        rafHandle = window.requestAnimationFrame(flush);
      }
    };

    const onData = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) => {
      if (topic && topic !== UI_EVENT_TOPIC) return;
      const event = decodeUiEvent(payload);
      if (!event) {
        if (!warned) {
          warned = true;
          console.warn('[ui-dispatcher] dropped malformed UI event payload (warn shown once).');
        }
        return;
      }

      const id = event.id ?? event.component;

      switch (event.action) {
        case 'mount':
          useUiStore.getState().mount(id, event.component, event.props);
          break;
        case 'update':
          scheduleUpdate(id, event.props);
          break;
        case 'unmount':
          useUiStore.getState().unmount(id);
          break;
      }
    };

    room.on(RoomEvent.DataReceived, onData);

    return () => {
      room.off(RoomEvent.DataReceived, onData);
      if (rafHandle !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafHandle);
        rafHandle = null;
      }
      pendingUpdates.clear();
      // Intentionally do NOT clear the store here. EndedBody reads it
      // post-disconnect to show the final Cost panel.
    };
  }, [room]);

  useEffect(() => {
    // Reset the store whenever the visitor switches demos. Also runs on
    // first mount, which is a no-op when the store is already empty.
    useUiStore.getState().clear();
  }, [slug]);
}
