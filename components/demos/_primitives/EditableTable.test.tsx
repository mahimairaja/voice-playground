import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EditableTablePanel } from './EditableTable';

describe('EditableTablePanel', () => {
  it('renders the columns and seeds each cell from rows', () => {
    const html = renderToStaticMarkup(
      <EditableTablePanel
        title="your quiz"
        columns={['Question', 'Answer']}
        rows={[['What planet is closest to the sun?', 'Mercury']]}
        submitLabel="Use these"
      />
    );
    expect(html).toContain('Question');
    expect(html).toContain('Answer');
    expect(html).toContain('value="What planet is closest to the sun?"');
    expect(html).toContain('value="Mercury"');
    expect(html).toContain('Use these');
  });

  it('disables Save off-session, when there is no live room to publish to', () => {
    const html = renderToStaticMarkup(
      <EditableTablePanel columns={['Question', 'Answer']} rows={[['Q', 'A']]} />
    );
    expect(html).toContain('disabled');
    expect(html).toContain('Save');
  });
});
