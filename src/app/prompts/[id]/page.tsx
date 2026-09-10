import { supabase } from '@/lib/supabase';
import PromptDetailClient from './PromptDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;

  const { data: prompt } = await supabase
    .from('prompts')
    .select('title, content, tags, status')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (!prompt) {
    return {
      title: 'Prompt Not Found — PromptVault',
      description: 'The prompt you are looking for does not exist.',
    };
  }

  const description = prompt.content?.substring(0, 160) || 'Discover this prompt on PromptVault.';

  return {
    title: `${prompt.title} — PromptVault`,
    description,
    openGraph: {
      title: `${prompt.title} — PromptVault`,
      description,
      type: 'article',
    },
    twitter: {
      title: `${prompt.title} — PromptVault`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/prompts/${id}`,
    },
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (!prompt) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Prompt not found</h2>
          <p className="text-red-600 mb-4">The prompt you are looking for does not exist or has been removed.</p>
          <a href="/prompts" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            ← Back to Browse
          </a>
        </div>
      </div>
    );
  }

  return <PromptDetailClient prompt={prompt} />;
}
