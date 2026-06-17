import { describe, expect, it } from 'vitest';
import { COLOR } from '@/lib/design/tokens';
import { bandColor } from './health';

describe('bandColor', () => {
  it('maps good to live green', () => expect(bandColor('good')).toBe(COLOR.live));
  it('maps warn to warning ochre', () => expect(bandColor('warn')).toBe(COLOR.warning));
  it('maps bad to danger red', () => expect(bandColor('bad')).toBe(COLOR.danger));
});
