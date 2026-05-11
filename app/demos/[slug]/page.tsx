import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CredentialsDrawer } from '@/components/playground/CredentialsDrawer';
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
  if (!demo) return { title: 'Demo not found · Mahimai AI playground' };
  return {
    title: `${demo.title} · Mahimai AI playground`,
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
        <Link href="/demos" className="underline underline-offset-4">
          /demos
        </Link>{' '}
        / {demo.slug}
      </p>

      <header className="mt-3">
        <h1 className="h-hand xxl leading-[0.95]">{demo.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="chip">{demo.category}</span>
          {demo.recording_url && (
            <a href={demo.recording_url} target="_blank" rel="noopener noreferrer" className="chip">
              recording ↗
            </a>
          )}
        </div>
      </header>

      <section
        aria-label="Demo overview"
        className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]"
      >
        <div className="box" style={{ padding: 18 }}>
          <p className="tiny-mono">/about</p>
          <p className="p-hand mt-3">{demo.description}</p>
        </div>
        <div className="box" style={{ padding: 18 }}>
          <p className="tiny-mono">/who-for</p>
          <p className="p-hand mt-3">{demo.who_for}</p>
        </div>
      </section>

      <section aria-label="Voice surface" className="mt-10">
        <div className="ab">
          <div className="ab-head">
            <span className="label">/call</span>
            <span className="meta">voice surface</span>
          </div>
          <div className="ab-body">
            <div
              className="box dashed"
              data-placeholder="VoiceSurface"
              style={{ padding: 28, textAlign: 'center' }}
            >
              <p className="tiny-mono">voice surface · pending T23</p>
              <p className="p-hand mt-3">
                The mic / audio visualizer / end-call control bar mounts here. It is wired by
                <span className="kbd" style={{ marginLeft: 4, marginRight: 4 }}>
                  hooks/useDemoSession
                </span>
                (T22), which reads keys from the credentials store (T17) and mints a token via
                <span className="kbd" style={{ marginLeft: 4, marginRight: 4 }}>
                  app/api/token
                </span>
                (T21).
              </p>
              <p className="p-hand sm mt-4">Until T19/T21/T22/T23 land, this slot is empty.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Generative UI canvas" className="mt-8">
        <div className="ab">
          <div className="ab-head">
            <span className="label">/canvas</span>
            <span className="meta">
              {demo.ui_components.length > 0
                ? `${demo.ui_components.length} component${demo.ui_components.length === 1 ? '' : 's'}`
                : 'none'}
            </span>
          </div>
          <div className="ab-body">
            <div
              className="box dashed"
              data-placeholder="Canvas"
              style={{ padding: 28, minHeight: 160, textAlign: 'center' }}
            >
              <p className="tiny-mono">canvas · pending T28</p>
              {demo.ui_components.length > 0 ? (
                <p className="p-hand mt-3">
                  The agent for this demo can mount {demo.ui_components.length} component
                  {demo.ui_components.length === 1 ? '' : 's'}:{' '}
                  {demo.ui_components.map((c) => (
                    <span key={c} className="kbd" style={{ marginRight: 6 }}>
                      {c}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="p-hand mt-3">This demo declares no generative UI components.</p>
              )}
              <p className="p-hand sm mt-4">
                The dispatcher (T27) decodes mount/update/unmount events on the LiveKit data channel
                and the Canvas (T28) renders them through the registry (T26).
              </p>
            </div>
          </div>
        </div>
      </section>

      {demo.required_credentials.length > 0 && (
        <section aria-label="Required credentials" className="mt-8">
          <div className="box" style={{ padding: 18 }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="tiny-mono">required keys</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {demo.required_credentials.map((key) => (
                    <span key={key} className="chip">
                      {key}
                    </span>
                  ))}
                </div>
              </div>
              <CredentialsDrawer requiredCredentials={demo.required_credentials} />
            </div>
            <p className="p-hand sm mt-4">
              The drawer collects these in your browser&apos;s localStorage and passes them to the
              token endpoint. Keys never reach the server log.
            </p>
          </div>
        </section>
      )}

      <section className="mt-20">
        <div className="line soft"></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/demos" className="tiny-mono underline underline-offset-4">
            ← back to demos
          </Link>
          <Link href="/about" className="btn">
            About Mahimai AI →
          </Link>
        </div>
      </section>
    </main>
  );
}
