import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DemoBundleLoader } from '@/components/demos/DemoBundleLoader';
import { Canvas } from '@/components/generative/Canvas';
import { CredentialsBanner } from '@/components/playground/CredentialsBanner';
import { CredentialsDrawer } from '@/components/playground/CredentialsDrawer';
import { VoiceSurface } from '@/components/playground/VoiceSurface';
import { getAllDemos, getDemoBySlug } from '@/lib/demos';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getAllDemos().map((demo) => ({ slug: demo.slug }));
}

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);
  if (!demo) return { title: 'Demo not found · voice playground' };
  return {
    title: `${demo.title} · voice playground`,
    description: demo.description,
  };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);
  if (!demo) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-28">
      <p className="tiny-mono">
        · listing ·{' '}
        <Link href="/demos" className="underline underline-offset-4">
          /demos
        </Link>{' '}
        / {demo.slug}
      </p>

      <header className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1
          className="leading-[0.92]"
          style={{
            fontFamily: 'var(--hand-title)',
            fontWeight: 700,
            fontSize: 'clamp(32px, 4.5vw, 48px)',
          }}
        >
          {demo.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{demo.category}</span>
          {demo.recording_url && (
            <a href={demo.recording_url} target="_blank" rel="noopener noreferrer" className="chip">
              recording ↗
            </a>
          )}
        </div>
      </header>

      {demo.required_credentials.length > 0 && (
        <div className="mt-6">
          <CredentialsBanner requiredCredentials={demo.required_credentials} />
        </div>
      )}

      <section
        aria-label="Live call and listing"
        className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
      >
        {/* LEFT: walkie talkie shell wrapping the voice surface */}
        <div>
          <div
            className="relative"
            style={{
              border: '1.5px solid var(--ink)',
              borderRadius: '14px 16px 13px 15px',
              background: 'var(--paper-2)',
              boxShadow: '4px 4px 0 var(--ink)',
              padding: 12,
            }}
          >
            {/* antenna */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -22,
                left: 22,
                width: 8,
                height: 24,
                background: 'var(--ink)',
                borderRadius: '4px 4px 0 0',
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -28,
                left: 18,
                width: 16,
                height: 8,
                border: '1.5px solid var(--ink)',
                borderRadius: '50%',
                background: 'var(--paper-2)',
              }}
            />

            <div className="flex items-center justify-between gap-2">
              <p className="tiny-mono">· walkie · ch 01</p>
              <p className="tiny-mono">· local push-to-talk</p>
            </div>

            <div className="mt-2">
              <VoiceSurface slug={demo.slug} requiredCredentials={demo.required_credentials} />
            </div>
          </div>
        </div>

        {/* RIGHT: clipboard listing — about / who-for / agent-mounted canvas */}
        <div
          className="relative"
          style={{
            border: '1.5px solid var(--ink)',
            borderRadius: '10px 12px 9px 11px',
            background: 'var(--paper-2)',
            boxShadow: '4px 4px 0 var(--ink)',
            padding: 0,
          }}
        >
          {/* clipboard clip */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 64,
              height: 12,
              borderRadius: 3,
              background: 'var(--ink)',
            }}
          />
          <div style={{ padding: 18 }}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="tiny-mono">· listing · {demo.slug.toUpperCase()}</p>
              <span
                className="chip accent brand-accent"
                style={{ fontSize: 11, transform: 'rotate(-2deg)' }}
              >
                {demo.category}
              </span>
            </div>
            <h2
              className="mt-1"
              style={{
                fontFamily: 'var(--hand-title)',
                fontWeight: 700,
                fontSize: 22,
                lineHeight: 1.05,
              }}
            >
              {demo.title}
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="box" style={{ padding: 12, background: 'var(--paper)' }}>
                <p className="tiny-mono">· what it does</p>
                <p className="p-hand sm mt-2">{demo.description}</p>
              </div>
              <div className="box" style={{ padding: 12, background: 'var(--paper)' }}>
                <p className="tiny-mono">· who it&apos;s for</p>
                <p className="p-hand sm mt-2">{demo.who_for}</p>
              </div>
            </div>

            <div className="line mt-5 mb-3"></div>

            <p className="tiny-mono">· agent mounted ↓</p>
            <div className="mt-2 rounded-[6px]" style={{ background: 'var(--paper)' }}>
              <DemoBundleLoader slug={demo.slug} />
              <Canvas slug={demo.slug} className="p-3" />
            </div>
          </div>
        </div>
      </section>

      {demo.required_credentials.length > 0 && (
        <section aria-label="Required credentials" className="mt-8">
          <div className="box" style={{ padding: 16 }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="tiny-mono">· vault · local only</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {demo.required_credentials.map((key) => (
                    <span key={key} className="chip">
                      {key}
                    </span>
                  ))}
                </div>
              </div>
              <CredentialsDrawer requiredCredentials={demo.required_credentials} />
            </div>
            <p className="p-hand sm mt-3">
              Your tokens are generated in your browser. Pasted keys live only in your
              browser&apos;s localStorage. Our server never sees the raw values.
            </p>
          </div>
        </section>
      )}

      <section className="mt-16">
        <div className="line soft"></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/demos" className="tiny-mono underline underline-offset-4">
            ← back to the corkboard
          </Link>
          <Link href="/about" className="btn">
            About the playground →
          </Link>
        </div>
      </section>
    </main>
  );
}
