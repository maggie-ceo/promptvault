import { supabase } from '@/lib/supabase';
import { Tag } from '@/lib/categories';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PromptCard from '@/components/PromptCard';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', slug)
    .single();

  if (!tag) {
    return { title: 'Tag Not Found — PromptVault' };
  }

  return {
    title: `#${tag.name} Prompts — PromptVault`,
    description: `Browse prompts tagged with ${tag.name} on PromptVault.`,
    alternates: {
      canonical: `/tags/${slug}`,
    },
  };
}

async function getTag(slug: string): Promise<Tag | null> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function getTagPrompts(tagId: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      prompt_tags!inner(tag_id)
    `)
    .eq('prompt_tags.tag_id', tagId)
    .eq('status', 'published')
    .order('likes_count', { ascending: false });

  if (error) {
    console.error('Error fetching tag prompts:', error);
    return [];
  }

  return data || [];
}

export default async function TagDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) notFound();

  const prompts = await getTagPrompts(tag.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">#{tag.name}</h1>
        <p className="text-gray-600">{prompts.length} prompts</p>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No prompts with this tag yet.</p>
          <Link
            href="/submit"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit a Prompt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
