import Link from 'next/link';
import { Prompt } from '@/lib/types';

const typeColors: Record<string, string> = {
  prompt: 'bg-blue-100 text-blue-800',
  skill: 'bg-purple-100 text-purple-800',
  workflow: 'bg-green-100 text-green-800',
};

export default function PromptCard({ prompt }: { prompt: Prompt }) {
  const typeColor = typeColors[prompt.type] || 'bg-gray-100 text-gray-800';

  return (
    <Link href={`/prompts/${prompt.id}`} className="block group">
      <div className="border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColor}`}>
            {prompt.type}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            ❤️ {prompt.likes_count}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-2">
          {prompt.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">
          {prompt.content}
        </p>
        <div className="flex flex-wrap gap-1">
          {(prompt.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
          {(prompt.tags || []).length > 3 && (
            <span className="text-xs text-gray-400">+{(prompt.tags || []).length - 3}</span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">@{prompt.author_name}</span>
          <span className="text-xs text-gray-400">
            {new Date(prompt.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
