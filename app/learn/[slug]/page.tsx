import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleView } from '@/components/learn/ArticleView';
import { fetchTutorial } from '@/lib/cookbook/blog';
import { getAllShipped, getShippedBySlug } from '@/lib/demos';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const shipped = await getAllShipped();
  return shipped.map((demo) => ({ slug: demo.slug }));
}

interface LearnPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = await getShippedBySlug(slug);
  const tutorial = demo ? await fetchTutorial(slug) : null;
  if (!demo || !tutorial) return { title: 'Tutorial not found · voice playground' };
  return {
    title: `${tutorial.frontmatter.title} · voice playground`,
    description: tutorial.frontmatter.summary,
  };
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params;
  const demo = await getShippedBySlug(slug);
  if (!demo) notFound();
  const tutorial = await fetchTutorial(slug);
  if (!tutorial) notFound();
  return <ArticleView writeup={tutorial} slug={slug} demoTitle={demo.title} />;
}
