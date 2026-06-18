import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StackLine } from './StackLine';

describe('StackLine', () => {
  it('joins the ordered-unique providers', () => {
    const html = renderToStaticMarkup(
      <StackLine stack={{ stt: 'deepgram', llm: 'openai', tts: 'cartesia' }} />
    );
    expect(html).toContain('deepgram · openai · cartesia');
  });

  it('collapses a single-provider stack', () => {
    const html = renderToStaticMarkup(
      <StackLine stack={{ stt: 'openai', llm: 'openai', tts: 'openai' }} />
    );
    expect(html).toContain('openai');
    expect(html).not.toContain('·');
  });

  it('renders nothing without a stack', () => {
    expect(renderToStaticMarkup(<StackLine />)).toBe('');
  });
});
