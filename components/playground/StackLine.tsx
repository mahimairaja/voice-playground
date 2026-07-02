import { type DemoStack, stackProviders } from '@/lib/demos/stack';

/**
 * The demo's provider stack as a quiet line, e.g. "deepgram · openai ·
 * cartesia". Renders nothing when the demo has no stack. Shown on the demo
 * cards under the description.
 */
export function StackLine({ stack }: { stack?: DemoStack }) {
  const providers = stackProviders(stack);
  if (providers.length === 0) return null;
  return (
    <p className="mt-3 text-xs text-[color:var(--color-text-mute)]">{providers.join(' · ')}</p>
  );
}
