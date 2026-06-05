import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { headers } from 'next/headers';
import { PlaygroundFooter } from '@/components/layout/PlaygroundFooter';
import { PlaygroundHeader } from '@/components/layout/PlaygroundHeader';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

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
  if (!raw) return new URL(FALLBACK_SITE_URL);

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate);
  } catch {
    console.warn(
      `[playground] NEXT_PUBLIC_SITE_URL is not a valid URL: ${JSON.stringify(raw)}. ` +
        `Falling back to ${FALLBACK_SITE_URL}.`
    );
    return new URL(FALLBACK_SITE_URL);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return {
    metadataBase: resolveMetadataBase(),
    title: appConfig.pageTitle,
    description: appConfig.pageDescription,
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
      title: appConfig.pageTitle,
      description: appConfig.pageDescription,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: appConfig.pageTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: appConfig.pageTitle,
      description: appConfig.pageDescription,
      images: ['/og-image.png'],
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);

  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>{styles && <style>{styles}</style>}</head>
      <body className="bg-[color:var(--color-bg)] text-[color:var(--color-text)] antialiased">
        <PlaygroundHeader />
        <main className="min-h-[calc(100dvh-56px-44px)]">{children}</main>
        <PlaygroundFooter />
      </body>
    </html>
  );
}
