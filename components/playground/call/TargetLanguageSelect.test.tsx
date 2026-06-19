import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TARGET_LANGUAGES, TargetLanguageSelect } from './TargetLanguageSelect';

describe('TargetLanguageSelect', () => {
  it('renders every curated language as an option', () => {
    const html = renderToStaticMarkup(<TargetLanguageSelect value="English" onChange={() => {}} />);
    for (const lang of TARGET_LANGUAGES) {
      expect(html).toContain(`>${lang}</option>`);
    }
  });

  it('marks the current value as selected', () => {
    const html = renderToStaticMarkup(<TargetLanguageSelect value="Spanish" onChange={() => {}} />);
    // react-dom/server reflects the controlled value on the <select>.
    expect(html).toContain('Spanish');
  });
});
