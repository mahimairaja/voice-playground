import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DemoRuntime } from '@/components/playground/DemoRuntime';
import { Writeup } from '@/components/playground/Writeup';
import { fetchTutorial, fetchWriteup } from '@/lib/cookbook/blog';
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
  const writeup = demo.blog ? await fetchWriteup(slug) : null;
  return {
    title: `${demo.title} · voice playground`,
    description: writeup?.frontmatter.summary ?? demo.description,
  };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const demo = await getShippedBySlug(slug);
  if (!demo) notFound();
  const writeup = demo.blog ? await fetchWriteup(slug) : null;
  const tutorial = writeup ? await fetchTutorial(slug) : null;
  return (
    <>
      <DemoRuntime demo={demo} />
      {writeup ? (
        <Writeup writeup={writeup} tutorialHref={tutorial ? `/learn/${slug}` : undefined} />
      ) : null}
    </>
  );
}
