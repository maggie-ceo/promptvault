'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PromptDetailPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      loadPrompt();
    }
  }, [id]);

  async function loadPrompt() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError('Prompt not found');
        setLoading(false);
        return;
      }

      setPrompt(data);
    } catch (err) {
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    if (prompt?.content) {
      navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {error || 'Prompt not found'}
          </h2>
          <p className="text-red-600 mb-4">
            The prompt you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/prompts"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const tags = prompt.tags || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/prompts" className="text-blue-600 hover:underline text-sm">
          ← Back to Browse
        </Link>
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
              ❤️ {prompt.likes_count || 0}
            </span>
            <span className="text-sm text-gray-500">
              📋 {prompt.copies_count || 0}
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{prompt.title}</h1>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="prose max-w-none mb-8">
          <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm font-mono border">
            {prompt.content}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            <span className="text-sm text-gray-500">By</span>
            <span className="ml-1 text-sm font-medium text-gray-900">@{prompt.author_name || 'anonymous'}</span>
            {prompt.license && (
              <span className="ml-3 text-xs bg-gray-100 px-2 py-1 rounded">
                {prompt.license}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {prompt.created_at ? new Date(prompt.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : ''}
          </div>
        </div>
      </article>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
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
