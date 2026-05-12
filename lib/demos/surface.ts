import { z } from 'zod';

export const DemoSurfaceSchema = z.enum(['clipboard_walkie', 'vitals_monitor', 'whiteboard']);

export type DemoSurface = z.infer<typeof DemoSurfaceSchema>;

export const DEFAULT_DEMO_SURFACE: DemoSurface = 'clipboard_walkie';

export function parseDemoSurface(value: unknown): DemoSurface | null {
  const result = DemoSurfaceSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseRoomSurfaceMetadata(metadata: string | undefined): DemoSurface | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { surface?: unknown };
    return parseDemoSurface(parsed.surface);
  } catch {
    return null;
  }
}
