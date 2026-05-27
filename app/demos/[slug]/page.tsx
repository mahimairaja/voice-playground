import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DemoRuntime } from '@/components/playground/DemoRuntime';
import { getAllShipped, getShippedBySlug } from '@/lib/demos';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const shipped = await getAllShipped();
  return shipped.map((demo) => ({ slug: demo.slug }));
}

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = await getShippedBySlug(slug);
  if (!demo) return { title: 'Demo not found · voice playground' };
  return {
    title: `${demo.title} · voice playground`,
    description: demo.description,
  };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const demo = await getShippedBySlug(slug);
  if (!demo) notFound();
  return <DemoRuntime demo={demo} />;
}
