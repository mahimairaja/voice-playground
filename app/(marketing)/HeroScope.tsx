'use client';

import { Grain, OscWave, ScopeFrame } from '@/components/phosphor';

/**
 * The hero oscilloscope panel. Client-only because OscWave drives a canvas via
 * requestAnimationFrame. Pure decoration; no data flows through here.
 */
export function HeroScope() {
  return (
    <ScopeFrame
      title="SCOPE · 1MΩ"
      right={<span className="text-[color:var(--color-live)]">● REC</span>}
      footer={[
        ['FREQ', '440 Hz'],
        ['TTFB', '0.38 s'],
        ['CH', 'mono'],
      ]}
    >
      <Grain
        scan
        className="flex items-center px-[6px]"
        style={{
          height: 184,
          background: 'var(--color-scope)',
          backgroundImage:
            'repeating-linear-gradient(90deg,var(--color-border-dim) 0 1px,transparent 1px 40px),repeating-linear-gradient(0deg,var(--color-border-dim) 0 1px,transparent 1px 40px)',
        }}
      >
        <div className="absolute inset-0 flex items-center px-[6px]">
          <OscWave height={154} />
        </div>
      </Grain>
    </ScopeFrame>
  );
}
