import { supabase } from '@/lib/supabase';
import { Tag } from '@/lib/categories';
import Link from 'next/link';

export const revalidate = 60;

async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('count', { ascending: false });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

export default async function TagsPage() {
  const tags = await getTags();

  // Group by first letter
  const tagsByLetter = new Map<string, Tag[]>();
  for (const tag of tags) {
    const letter = tag.name[0]?.toUpperCase() || '#';
    const group = tagsByLetter.get(letter) || [];
    group.push(tag);
    tagsByLetter.set(letter, group);
  }

  const letters = Array.from(tagsByLetter.keys()).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
        <p className="text-gray-600">Browse prompts by tag</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-semibold transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      <div className="space-y-8">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              {letter}
            </h2>
            <div className="flex flex-wrap gap-2">
              {tagsByLetter.get(letter)?.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg transition-colors"
                >
                  {tag.name}
                  <span className="text-gray-400 text-sm">({tag.count})</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
