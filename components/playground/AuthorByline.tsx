/**
 * The author credit under a writeup title. With a github handle it shows the
 * author's avatar (github.com/<handle>.png, a public redirect, no API) and links
 * the name to their profile. Without one it is the plain "by {author}" text,
 * unchanged from before.
 */
export function AuthorByline({ author, github }: { author: string; github?: string }) {
  const className =
    'mt-1.5 flex items-center gap-2 font-mono text-[12px] tracking-[0.04em] text-[color:var(--color-text-mute)]';

  if (!github) {
    return <p className={className}>by {author}</p>;
  }

  const profile = `https://github.com/${github}`;
  return (
    <p className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${profile}.png?size=48`}
        alt=""
        width={20}
        height={20}
        className="rounded-full border border-[color:var(--color-border)]"
      />
      <span>
        by{' '}
        <a
          href={profile}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[color:var(--color-accent-dim)] hover:underline"
        >
          {author}
        </a>
      </span>
    </p>
  );
}
