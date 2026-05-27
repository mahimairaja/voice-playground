import { z } from 'zod';

/**
 * Mirrors 'catalog.schema.json' in the awesome-voice-apps cookbook. The
 * cookbook's catalog.json is the source of truth; this schema is the
 * playground's narrowed type guard. If the cookbook adds an optional field,
 * extend here; if the cookbook tightens a field, this schema breaks the
 * build at the next fetch and we update.
 */

export const CategorySchema = z.enum([
  'Receptionist & Booking',
  'Drive-thru & Ordering',
  'Customer Support',
  'Companion & Coaching',
  'Education',
  'Data Extraction',
  'Tool Calling',
  'Multilingual',
  'Multi-Agent',
  'Telephony & SIP',
]);

export type Category = z.infer<typeof CategorySchema>;

export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: 'slug must be lowercase letters, digits, and single hyphens',
});

export const CatalogValueSchema = z.object({
  title: z.string().min(1),
  category: CategorySchema,
  description: z.string().min(1).max(160),
  who_for: z.string().min(1),
  recording_url: z.union([z.string().url(), z.null()]),
  required_credentials: z.array(z.string().min(1)).min(1),
  ui_components: z.array(z.string().min(1)),
  /** Optional one-line stat shown on the card (e.g. 'menu: 12 items'). */
  card_stat: z.string().min(1).optional(),
});

/**
 * Raw catalog.json payload: a record keyed by slug. The playground reshapes
 * this into a sorted 'CatalogEntry[]' before exposing it to consumers.
 */
export const CatalogPayloadSchema = z.record(SlugSchema, CatalogValueSchema);

export type CatalogValue = z.infer<typeof CatalogValueSchema>;
export type CatalogEntry = CatalogValue & { slug: string };
