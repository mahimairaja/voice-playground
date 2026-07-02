'use client';

import { Grain, OscWave, ScopeFrame } from '@/components/phosphor';

/**
 * The hero oscilloscope panel. Client-only because OscWave drives a canvas via
 * requestAnimationFrame. Pure decoration; no data flows through here.
 */
export function HeroScope() {
  return (
    <ScopeFrame
      title="SCOPE · LIVE"
      right={<span className="text-[color:var(--color-live)]">● REC</span>}
      screen
      footer={[
        ['TTFB', '0.38 s'],
        ['TURN', '0.62 s'],
        ['AUDIO', '16 kHz'],
      ]}
    >
      <Grain
        scan
        className="flex items-center px-[6px]"
        style={{
          height: 184,
          background: 'var(--color-scope)',
          backgroundImage:
            'repeating-linear-gradient(90deg,rgba(232,238,242,0.06) 0 1px,transparent 1px 40px),repeating-linear-gradient(0deg,rgba(232,238,242,0.06) 0 1px,transparent 1px 40px)',
        }}
      >
        {/* OscWave sits directly in Grain: the `.ph-grain > *` rule lifts it
            above the grain/scan overlays (z-index 2), and width:100% resolves
            against the full screen. An extra absolute wrapper here would be
            clobbered by that same rule (position:relative wins, unlayered) and
            collapse the canvas to its intrinsic width. */}
        <OscWave height={154} />
      </Grain>
    </ScopeFrame>
  );
}
