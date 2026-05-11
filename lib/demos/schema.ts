import { z } from 'zod';

/**
 * Slug constraint: lowercase letters, digits, and single hyphens between
 * segments. URL-safe, file-system-safe, mirrors the demo folder name in
 * 'awesome-voice-apps/demos/<slug>/'.
 */
export const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, digits, and single hyphens (e.g. drive-thru-coffee)',
  });

export type Slug = z.infer<typeof SlugSchema>;

/**
 * The shape of 'awesome-voice-apps/demos/<slug>/playground.json'. Loaded at
 * build time by 'lib/demos/index.ts' (T10) and validated against this schema.
 * A malformed manifest fails the build fast.
 */
export const DemoManifestSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  who_for: z.string().min(1),
  recording_url: z.url().optional(),
  required_credentials: z.array(z.string().min(1)).default([]),
  ui_components: z.array(z.string().min(1)).default([]),
});

export type DemoManifest = z.infer<typeof DemoManifestSchema>;

/**
 * Parse and validate a manifest payload. Throws 'z.ZodError' on failure with
 * a structured 'issues' array, suitable for build-time error reporting.
 */
export function parseDemoManifest(input: unknown): DemoManifest {
  return DemoManifestSchema.parse(input);
}
