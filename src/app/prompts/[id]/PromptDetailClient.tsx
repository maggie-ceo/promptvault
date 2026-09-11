'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  prompt: any;
}

export default function PromptDetailClient({ prompt }: Props) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    if (prompt?.content) {
      try {
        await navigator.clipboard.writeText(prompt.content);
        setCopied(true);
        setCopyFailed(false);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 3000);
      }
    }
  };

  const tags = prompt.tags || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/prompts" className="text-[var(--accent)] hover:underline text-sm">
          ← Back to Browse
        </Link>
      </div>

      <article className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
              {prompt.type || 'Prompt'}
            </span>
            {prompt.tool && prompt.tool !== 'general' && (
              <span className="text-xs bg-[var(--background)] text-[var(--muted)] px-2 py-0.5 rounded">
                {prompt.tool}
              </span>
            )}
            {prompt.difficulty && (
              <span className="text-xs bg-[var(--background)] text-[var(--muted)] px-2 py-0.5 rounded">
                {prompt.difficulty}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <span>❤️ {prompt.likes_count || 0}</span>
            <span>📋 {prompt.copies_count || 0}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">{prompt.title}</h1>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="text-sm bg-[var(--background)] text-[var(--muted)] px-3 py-1 rounded-full hover:bg-[var(--border)]"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Prompt Content */}
        <div className="prose max-w-none mb-8">
          <pre className="whitespace-pre-wrap bg-[var(--background)] p-6 rounded-lg text-sm font-mono border border-[var(--border)]">
            {prompt.content}
          </pre>
        </div>

        {/* Author & Date */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted)]">By</span>
            <span className="text-sm font-medium text-[var(--foreground)]">
              {prompt.author_name || 'Community'}
            </span>
            {prompt.license && (
              <span className="text-xs bg-[var(--background)] text-[var(--muted)] px-2 py-0.5 rounded">
                {prompt.license}
              </span>
            )}
          </div>
          <div className="text-sm text-[var(--muted)]">
            {prompt.created_at
              ? new Date(prompt.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : ''}
          </div>
        </div>
      </article>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {copied ? 'Copied!' : copyFailed ? 'Copy failed — try again' : 'Copy to Clipboard'}
        </button>
        <a
          href={`/api/prompts/${prompt.id}/download`}
          className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--background)]"
        >
          Download .txt
        </a>
      </div>

      {/* Usage Notes */}
      {prompt.usage_notes && (
        <div className="mt-8 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Usage Notes</h2>
          <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{prompt.usage_notes}</p>
        </div>
      )}

      {/* Example Input/Output */}
      {(prompt.example_input || prompt.example_output) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {prompt.example_input && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Example Input</h3>
              <pre className="text-sm text-[var(--muted)] whitespace-pre-wrap font-mono">{prompt.example_input}</pre>
            </div>
          )}
          {prompt.example_output && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Example Output</h3>
              <pre className="text-sm text-[var(--muted)] whitespace-pre-wrap font-mono">{prompt.example_output}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
