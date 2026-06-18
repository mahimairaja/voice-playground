/**
 * Pure helpers for a demo's provider stack. No 'server-only' so the cards
 * (server components) and the unit tests both import them.
 *
 * The cookbook's `stack` is `{ stt, llm, tts }` of lowercase provider ids. For
 * display and filtering we reduce it to the ordered-unique providers, so a
 * single-provider demo (clinic: openai/openai/openai) reads as one provider and
 * a three-provider demo reads as three.
 */

export interface DemoStack {
  stt: string;
  llm: string;
  tts: string;
}

/** Ordered-unique, lowercased providers across stt, llm, tts. */
export function stackProviders(stack: DemoStack | undefined): string[] {
  if (!stack) return [];
  const out: string[] = [];
  for (const role of [stack.stt, stack.llm, stack.tts]) {
    const provider = role?.toLowerCase().trim();
    if (provider && !out.includes(provider)) out.push(provider);
  }
  return out;
}

/** True when the demo's stack uses the given provider (case-insensitive). */
export function demoUsesProvider(stack: DemoStack | undefined, provider: string): boolean {
  return stackProviders(stack).includes(provider.toLowerCase().trim());
}
