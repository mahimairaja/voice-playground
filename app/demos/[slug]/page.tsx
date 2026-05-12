import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DemoRuntime } from '@/components/playground/DemoRuntime';
import { getAllDemos, getDemoBySlug, isUsingReferenceSeed } from '@/lib/demos';
import { parseDemoSurface } from '@/lib/demos/surface';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getAllDemos().map((demo) => ({ slug: demo.slug }));
}

interface DemoPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ surface?: string | string[] }>;
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

export default async function DemoPage({ params, searchParams }: DemoPageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : {};
  const surfaceParam = Array.isArray(search.surface) ? search.surface[0] : search.surface;
  const demo = getDemoBySlug(slug);
  if (!demo) notFound();

  return (
    <DemoRuntime
      demo={demo}
      initialSurface={parseDemoSurface(surfaceParam)}
      isSeed={isUsingReferenceSeed()}
    />
  );
}
