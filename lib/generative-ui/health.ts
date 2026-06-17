import { COLOR } from '@/lib/design/tokens';
import { useUiStore } from './dispatcher';

/** The fixed instance id the agent uses for the scope health signal. */
export const HEALTH_INSTANCE_ID = 'health';

export type Band = 'good' | 'warn' | 'bad';

export interface HealthState {
  risk: number;
  band: Band;
}

/** Band color for the scope waveform and RISK readout. Mirrors the agent bands. */
export function bandColor(band: Band): string {
  switch (band) {
    case 'good':
      return COLOR.live;
    case 'warn':
      return COLOR.warning;
    case 'bad':
      return COLOR.danger;
  }
}

/**
 * Reads the agent-published health signal from the shared dispatcher store.
 * The agent mounts a `Health` ui-event with id `health` carrying { risk, band }.
 * Selecting the instance (a stable ref) and deriving outside avoids returning a
 * fresh object from the selector. Returns null until the first health event.
 */
export function useHealth(): HealthState | null {
  const inst = useUiStore((s) => s.instances[HEALTH_INSTANCE_ID]);
  if (!inst) return null;
  const { risk, band } = inst.props as Partial<HealthState>;
  if (typeof risk !== 'number') return null;
  if (band !== 'good' && band !== 'warn' && band !== 'bad') return null;
  return { risk, band };
}
