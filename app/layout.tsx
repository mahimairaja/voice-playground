import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { TopBar } from '@/components/brand/TopBar';
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

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth font-sans antialiased">
      <head>{styles && <style>{styles}</style>}</head>
      <body className="overflow-x-hidden">
        <Script id="mahimai-mode-pre-paint" strategy="beforeInteractive">
          {PRE_PAINT_MODE_SCRIPT}
        </Script>
        <TopBar />
        {children}
      </body>
    </html>
  );
}
