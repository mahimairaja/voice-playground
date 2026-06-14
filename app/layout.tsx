import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { PlaygroundFooter } from '@/components/layout/PlaygroundFooter';
import { PlaygroundHeader } from '@/components/layout/PlaygroundHeader';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';

const SITE_TITLE = 'voice playground';
const SITE_DESCRIPTION =
  'Talk to open-source voice agents from the awesome-voice-apps cookbook, right in your browser.';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const FALLBACK_SITE_URL = 'http://localhost:3000';

/**
 * Resolve NEXT_PUBLIC_SITE_URL into a metadataBase URL without ever throwing.
 * A bare domain (no scheme) is coerced to https so a value like
 * 'playground.mahimai.ca' still works; a genuinely unparseable value falls
 * back to localhost with a warning. A malformed env var must never crash
 * generateMetadata, since that errors metadata on every route and surfaces the
 * global error boundary site-wide.
 */
function resolveMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    // Coerce a scheme-less bare domain to https; keep an existing scheme so a
    // non-http(s) one (ftp://, ws://, or a scheme typo) is rejected below
    // rather than silently mangled into a bogus origin.
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url;
    } catch {
      // fall through to the warning and fallback below
    }
    console.warn(
      `[playground] NEXT_PUBLIC_SITE_URL is not a valid http(s) URL: ${JSON.stringify(raw)}. ` +
        `Falling back to ${FALLBACK_SITE_URL}.`
    );
  }
  return new URL(FALLBACK_SITE_URL);
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: resolveMetadataBase(),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE_TITLE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: ['/og-image.png'],
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[color:var(--color-bg)] text-[color:var(--color-text)] antialiased">
        <PlaygroundHeader />
        <main className="min-h-[calc(100dvh-56px-44px)]">{children}</main>
        <PlaygroundFooter />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
