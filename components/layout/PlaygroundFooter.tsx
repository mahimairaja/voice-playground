import pkg from '../../package.json';

/**
 * Global footer. Single row over a top hairline, mono fade text.
 *
 *   left:   voice·playground: a browser oscilloscope for voice agents
 *   right:  awesome-voice-apps ↗ · source ↗ · vX.Y.Z · ● SIGNAL
 */

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';
const SOURCE_URL = 'https://github.com/mahimairaja/voice-playground';
const PARENT_SITE = 'https://mahimai.ca';

export function PlaygroundFooter() {
  const version = `v${pkg.version}`;

  return (
    <footer
      role="contentinfo"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-border)] px-6 py-7 font-mono text-[12px] text-[color:var(--color-text-mute)] sm:px-8"
    >
      <span>
        World of Voice Agents ● Built by{' '}
        <a
          href={PARENT_SITE}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-text)]"
        >
          Mahimai ↗
        </a>
      </span>
      <div className="flex items-center gap-5">
        <a
          href={COOKBOOK_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-text)]"
        >
          awesome-voice-apps ↗
        </a>
        {/*<a
          href={SOURCE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-text)]"
        >
          source ↗
        </a>*/}
        {/*<span>{version}</span>*/}
        <span className="text-[color:var(--color-live)]">● ConversationalX</span>
      </div>
    </footer>
  );
}
