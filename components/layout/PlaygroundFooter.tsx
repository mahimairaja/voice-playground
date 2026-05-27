import pkg from '../../package.json';

/**
 * Global footer. Single thin row, separated by a top hairline.
 *
 *   left:   MIT · BYO PROVIDERS
 *   center: cookbook GitHub link
 *   right:  vX.Y.Z (read from package.json at build time)
 */

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';

export function PlaygroundFooter() {
  const version = `v${pkg.version}`;

  return (
    <footer
      role="contentinfo"
      className="flex h-11 items-center gap-6 border-t border-[color:var(--color-border-dim)] px-6 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase"
    >
      <span>MIT · BYO PROVIDERS</span>
      <a
        href={COOKBOOK_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="mx-auto hover:text-[color:var(--color-text-mute)]"
      >
        awesome-voice-apps ↗
      </a>
      <span>{version}</span>
    </footer>
  );
}
