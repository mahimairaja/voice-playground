import type { ComponentType } from 'react';
import {
  ButtonRowPanel,
  CaptionsPanel,
  CardPanel,
  CostPanel,
  EditableTablePanel,
  KeyValuePanel,
  ListPanel,
  MetersPanel,
  StatPanel,
  TablePanel,
} from '@/components/demos/_primitives';
import { Score } from '@/components/demos/_vocabulary/Score';

/**
 * The contribute-page component gallery. One entry per name in the global
 * generative-UI vocabulary (components/demos/_vocabulary/index.tsx). Each entry
 * renders the REAL component with sample props, so the gallery can never drift
 * from what ships; gallery-manifest.test.ts fails if a registered name is
 * missing here or a name here is not registered.
 */

export type GalleryComponent = ComponentType<Record<string, unknown>>;

export interface GalleryEntry {
  /** The ui_event "component" key the agent sends. */
  name: string;
  /** The real component, rendered live with sampleProps. */
  Component: GalleryComponent;
  /** One-line description. */
  description: string;
  /** Props the agent sends; fed to the live render and the contract snippet. */
  sampleProps: Record<string, unknown>;
  /** Short prop signatures shown under the contract. */
  propHints: string[];
  /** For semantic aliases: the primitive they wrap (shown as a note). */
  aliasOf?: string;
  /** Default title an alias injects. Applied to the live render only, not the contract. */
  defaultTitle?: string;
}

// Mirror of the registry's g(): the components accept Record<string, unknown>
// off the wire, so the cast is intentional and safe.
function c<P>(Component: ComponentType<P>): GalleryComponent {
  return Component as unknown as GalleryComponent;
}

export const GALLERY: GalleryEntry[] = [
  {
    name: 'List',
    Component: c(ListPanel),
    description: 'titled rows with subtitle, badge, image, link',
    sampleProps: {
      items: [
        { title: 'Flat white', subtitle: 'oat milk · large', right: '$4.50' },
        { title: 'Almond croissant', right: '$3.75' },
      ],
    },
    propHints: ['items: { title, subtitle?, right?, image_url?, href? }[]', 'title?: string'],
  },
  {
    name: 'KeyValue',
    Component: c(KeyValuePanel),
    description: 'label/value rows, last one emphasized',
    sampleProps: {
      items: [
        { label: 'subtotal', value: '$8.25' },
        { label: 'tax', value: '$0.74' },
        { label: 'total', value: '$8.99', accent: true },
      ],
    },
    propHints: ['items: { label, value, accent? }[]', 'title?: string'],
  },
  {
    name: 'Stat',
    Component: c(StatPanel),
    description: 'big number with label and progress bar',
    sampleProps: { value: 7, label: 'open slots', of: 10 },
    propHints: ['value: string | number', 'label?: string', 'of?: number', 'caption?: string'],
  },
  {
    name: 'Meters',
    Component: c(MetersPanel),
    description: 'labeled 0-to-1 bars with band coloring and a driver mark',
    sampleProps: {
      title: 'audio health',
      items: [
        { label: 'noise', value: 0.72, band: 'bad', driver: true },
        { label: 'reverb', value: 0.18, band: 'good' },
        { label: 'loudness', value: 0.55, neutral: true },
      ],
    },
    propHints: [
      'items: { label, value: number (0..1), band?: "good"|"warn"|"bad", neutral?: boolean, driver?: boolean }[]',
      'title?: string',
    ],
  },
  {
    name: 'Card',
    Component: c(CardPanel),
    description: 'article: subtitle, title, body, footer',
    sampleProps: {
      subtitle: 'appointment',
      title: 'Tue 14 Jun · 3:30 PM',
      body: 'Dr. Lewis · 30 min checkup',
      footer: 'confirmed',
      accent: true,
    },
    propHints: [
      'title?: string',
      'subtitle?: string',
      'body?: string',
      'image_url?: string',
      'footer?: string',
      'accent?: boolean',
    ],
  },
  {
    name: 'Buttons',
    Component: c(ButtonRowPanel),
    description: 'button row; emits a CTA event on click',
    sampleProps: {
      buttons: [
        { label: 'Confirm order', action: 'confirm', primary: true },
        { label: 'Add a note', action: 'note' },
      ],
    },
    propHints: ['buttons: { label, href?, action?, primary? }[]', 'title?: string'],
  },
  {
    name: 'Table',
    Component: c(TablePanel),
    description: 'header row plus string-cell rows',
    sampleProps: {
      columns: ['item', 'qty', 'price'],
      rows: [
        ['Flat white', '1', '$4.50'],
        ['Croissant', '2', '$7.50'],
      ],
    },
    propHints: ['columns: string[]', 'rows: string[][]', 'title?: string'],
  },
  {
    name: 'EditableTable',
    Component: c(EditableTablePanel),
    description: 'editable grid; publishes the saved rows back to the agent',
    sampleProps: {
      title: 'your quiz',
      columns: ['Question', 'Answer'],
      rows: [
        ['What planet is closest to the sun?', 'Mercury'],
        ['How many sides does a hexagon have?', 'Six'],
      ],
      submitLabel: 'Use these',
      actionId: 'quiz',
    },
    propHints: [
      'columns: string[]',
      'rows: string[][]',
      'submitLabel?: string',
      'actionId?: string (echoed in the ui_action it publishes)',
      'title?: string',
    ],
  },
  {
    name: 'Captions',
    Component: c(CaptionsPanel),
    description: 'rolling transcript with original + translation',
    sampleProps: {
      items: [
        { text: 'Good morning, how can I help?' },
        { text: 'I would like to book a table.', original: 'Je voudrais reserver une table.' },
      ],
    },
    propHints: [
      'items: { text, original? }[] (last 20 shown)',
      'title?: string (default "live captions")',
    ],
  },
  {
    name: 'Order',
    Component: c(ListPanel),
    description: 'List with a "your order" default title',
    aliasOf: 'List',
    defaultTitle: 'your order',
    sampleProps: {
      items: [
        { title: 'Flat white', right: '$4.50' },
        { title: 'Almond croissant', right: '$3.75' },
      ],
    },
    propHints: ['items: { title, subtitle?, right?, image_url?, href? }[]', 'title?: string'],
  },
  {
    name: 'Total',
    Component: c(KeyValuePanel),
    description: 'KeyValue with a "running total" default title',
    aliasOf: 'KeyValue',
    defaultTitle: 'running total',
    sampleProps: {
      items: [
        { label: 'items', value: '2' },
        { label: 'total', value: '$8.25', accent: true },
      ],
    },
    propHints: ['items: { label, value, accent? }[]', 'title?: string'],
  },
  {
    name: 'Checkout',
    Component: c(ButtonRowPanel),
    description: 'Buttons with a "ready when you are" default title',
    aliasOf: 'Buttons',
    defaultTitle: 'ready when you are',
    sampleProps: { buttons: [{ label: 'Place order', action: 'checkout', primary: true }] },
    propHints: ['buttons: { label, href?, action?, primary? }[]', 'title?: string'],
  },
  {
    name: 'Cost',
    Component: c(CostPanel),
    description: 'itemized cost lines with a total box',
    sampleProps: {
      total_usd: 0.012,
      lines: [
        { label: 'STT', value: '$0.004', sublabel: 'deepgram' },
        { label: 'LLM', value: '$0.006', sublabel: 'gpt-4o-mini' },
        { label: 'TTS', value: '$0.002', sublabel: 'cartesia' },
      ],
    },
    propHints: ['total_usd: number', 'lines: { label, value, sublabel? }[]'],
  },
  {
    name: 'Score',
    Component: c(Score),
    description: 'trivia scorecard: correct + answered progress',
    sampleProps: { correct: 4, total: 5, outOf: 8 },
    propHints: [
      'correct?: number (answers right)',
      'total?: number (answered so far)',
      'outOf?: number (total questions)',
    ],
  },
];
