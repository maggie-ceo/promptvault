'use client';

import { useState } from 'react';
import Link from 'next/link';

const typeLabels: Record<string, string> = {
  prompt: 'Prompt',
  skill: 'Skill',
  workflow: 'Workflow',
};

function extractExcerpt(content: string, maxLen: number = 120): string {
  if (!content) return '';
  let cleaned = content.replace(/```[\s\S]*?```/g, ' ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length > maxLen) {
    cleaned = cleaned.substring(0, maxLen).trim() + '…';
  }
  return cleaned;
}

export default function PromptCard({ prompt, isBookmarked, onToggleBookmark }: { prompt: any; isBookmarked?: boolean; onToggleBookmark?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (prompt.content) {
      navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tags = prompt.tags || [];
  const excerpt = extractExcerpt(prompt.content);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
          {typeLabels[prompt.type] || 'Prompt'}
        </span>
        <div className="flex items-center gap-2">
          {(prompt.copies_count || 0) > 0 && (
            <span className="text-xs text-[var(--muted)]">{prompt.copies_count} copies</span>
          )}
          {onToggleBookmark && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBookmark(); }}
              className={`text-sm ${isBookmarked ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--accent)]'}`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this prompt'}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <Link href={`/prompts/${prompt.id}`} className="block group">
        <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition mb-2 line-clamp-2">
          {prompt.title}
        </h3>
      </Link>

      {/* Excerpt */}
      <p className="text-sm text-[var(--muted)] line-clamp-3 mb-4 flex-1">
        {excerpt}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag: string) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs bg-[var(--background)] text-[var(--muted)] px-2 py-0.5 rounded hover:bg-[var(--border)]"
            >
              {tag}
            </Link>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-[var(--muted)]">+{tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--muted)]">
          {prompt.author_name || 'Community'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-[var(--accent)] hover:underline"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
