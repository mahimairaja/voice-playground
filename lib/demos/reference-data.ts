import { type DemoManifest } from './schema';

export const REFERENCE_DEMO_SLUG = 'concierge-re';
export const REFERENCE_PINNED_COUNT = 10;

export interface ReferencePreviewCard {
  title: string;
  body: string;
  slug?: string;
  cta?: string;
}

export interface ReferenceCorkboardCard {
  category: string;
  title: string;
  stat: string;
  slug?: string;
  description?: string;
}

export const REFERENCE_DEMO_MANIFEST: DemoManifest = {
  slug: REFERENCE_DEMO_SLUG,
  title: 'concierge / RE',
  category: 'real estate',
  description: 'tour a listing by voice',
  who_for: 'Real estate teams that need a listing concierge to answer questions and book viewings.',
  card_stat: '−68% missed',
  default_surface: 'clipboard_walkie',
  required_credentials: ['openai', 'deepgram', 'cartesia'],
  ui_components: [],
};

export const REFERENCE_LANDING_CARDS: ReferencePreviewCard[] = [
  {
    title: 'real estate concierge',
    body: 'tour a listing by voice',
    slug: REFERENCE_DEMO_SLUG,
    cta: '▶ play',
  },
  {
    title: 'restaurant reservations',
    body: 'book a table, end-to-end',
  },
  {
    title: 'plumber dispatch',
    body: 'route an emergency call',
  },
];

export const REFERENCE_CATEGORIES = [
  'all',
  'restaurant',
  'auto',
  'trades',
  'real estate',
  'hotel',
  'legal',
];

export const REFERENCE_CORKBOARD_CARDS: ReferenceCorkboardCard[] = [
  { category: 'health', title: 'north end dental', stat: '+42% bookings' },
  { category: 'restaurant', title: 'the maple bistro', stat: '180 res/wk' },
  {
    category: 'real estate',
    title: 'concierge / RE',
    stat: '−68% missed',
    slug: REFERENCE_DEMO_SLUG,
    description: 'tour a listing by voice',
  },
  { category: 'auto', title: 'drive-thru auto', stat: '11s avg' },
  { category: 'trades', title: 'plumb dispatch', stat: '<600ms' },
  { category: 'hotel', title: 'hotel stay', stat: '24/7 desk' },
  { category: 'retail', title: 'retail returns', stat: '$0.06/min' },
  { category: 'legal', title: 'legal intake', stat: '4.7★' },
  { category: 'health', title: 'fit studio', stat: '300 cls/wk' },
];
