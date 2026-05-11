import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { PRE_PAINT_MODE_SCRIPT } from '@/lib/mode';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/brand.css';
import '@/styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    metadataBase: new URL(siteUrl),
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
  const { companyName, logo, logoDark } = appConfig;

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth font-sans antialiased">
      <head>{styles && <style>{styles}</style>}</head>
      <body className="overflow-x-hidden">
        <Script id="mahimai-mode-pre-paint" strategy="beforeInteractive">
          {PRE_PAINT_MODE_SCRIPT}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://livekit.io"
              className="scale-100 transition-transform duration-300 hover:scale-110"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={`${companyName} Logo`} className="block size-6 dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoDark ?? logo}
                alt={`${companyName} Logo`}
                className="hidden size-6 dark:block"
              />
            </a>
            <span className="text-foreground font-mono text-xs font-bold tracking-wider uppercase">
              Built with{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.livekit.io/agents"
                className="underline underline-offset-4"
              >
                LiveKit Agents
              </a>
            </span>
          </header>

          {children}
          <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2">
            <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
