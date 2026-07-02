import pkg from '../../package.json';

/**
 * Global footer. Single row over a top hairline, small gray text in the
 * mahimai.ca footer voice (Inter, gray-500, links darken on hover).
 *
 *   left:   World of Voice Agents · Built by Mahimai ↗
 *   right:  awesome-voice-apps ↗ · ● ConversationalX
 */

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';
const SOURCE_URL = 'https://github.com/mahimairaja/voice-playground';
const PARENT_SITE = 'https://mahimai.ca';

export function PlaygroundFooter() {
  const version = `v${pkg.version}`;

  return (
    <footer role="contentinfo" className="border-t border-[color:var(--color-border)]">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-7 text-sm text-[color:var(--color-text-mute)]">
        <span>
          World of Voice Agents · Built by{' '}
          <a
            href={PARENT_SITE}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-[color:var(--color-text-dim)] transition-colors hover:text-[color:var(--color-text)]"
          >
            Mahimai ↗
          </a>
        </span>
        <div className="flex items-center gap-5">
          <a
            href={COOKBOOK_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-[color:var(--color-text)]"
          >
            awesome-voice-apps ↗
          </a>
          {/*<a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-[color:var(--color-text)]"
          >
            source ↗
          </a>*/}
          {/*<span>{version}</span>*/}
          <span className="font-medium text-[color:var(--color-live)]">● ConversationalX</span>
        </div>
      </div>
    </footer>
  );
}
