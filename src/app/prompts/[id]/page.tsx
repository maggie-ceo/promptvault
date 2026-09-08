import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getPrompt(id: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prompt = await getPrompt(id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/prompts" className="text-blue-600 hover:underline text-sm">
          ← Back to Browse
        </a>
      </div>

      <article className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              prompt.type === 'skill' ? 'bg-purple-100 text-purple-800' :
              prompt.type === 'workflow' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {prompt.type}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              ❤️ {prompt.likes_count}
            </span>
            <span className="text-sm text-gray-500">
              📋 {prompt.copies_count}
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{prompt.title}</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {prompt.tags.map((tag: string) => (
            <a
              key={tag}
              href={`/prompts?tag=${tag}`}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
            >
              #{tag}
            </a>
          ))}
        </div>

        <div className="prose max-w-none mb-8">
          <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm font-mono border">
            {prompt.content}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            <span className="text-sm text-gray-500">By</span>
            <span className="ml-1 text-sm font-medium text-gray-900">@{prompt.author_name}</span>
            {prompt.license && (
              <span className="ml-3 text-xs bg-gray-100 px-2 py-1 rounded">
                {prompt.license}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {new Date(prompt.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </article>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(prompt.content)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          📋 Copy to Clipboard
        </button>
        <a
          href={`/api/prompts/${prompt.id}/download`}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          ⬇️ Download
        </a>
      </div>
    </div>
  );
}
