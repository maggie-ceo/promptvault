'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PromptCard from '@/components/PromptCard';
import Link from 'next/link';

export default function SavedPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  async function loadSaved() {
    try {
      // Load from localStorage first (device-local)
      const localSaved: string[] = JSON.parse(localStorage.getItem('promptvault_bookmarks') || '[]');
      
      if (localSaved.length > 0) {
        // Fetch full prompt data from Supabase
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .in('id', localSaved)
          .eq('status', 'published');

        if (!error && data) {
          setPrompts(data);
        }
      }

      // Also try loading from Supabase (if logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('prompt_id, prompts(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const supabasePrompts: any[] = data.map(b => b.prompts).filter(Boolean);
          // Merge without duplicates
          const merged: any[] = [...prompts];
          for (const p of supabasePrompts) {
            if (!merged.find(m => m.id === p.id)) merged.push(p);
          }
          setPrompts(merged);
        }
      }
    } catch (err) {
      console.error('Error loading saved:', err);
    } finally {
      setLoading(false);
    }
  }

  const exportBookmarks = () => {
    const data = JSON.stringify(prompts.map(p => p.id));
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promptvault-bookmarks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBookmarks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          localStorage.setItem('promptvault_bookmarks', JSON.stringify(imported));
          loadSaved();
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--foreground)]">Saved Prompts</h1>
          <p className="text-sm text-[var(--muted)]">Your bookmarked prompts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportBookmarks}
            disabled={prompts.length === 0}
            className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] disabled:opacity-50"
          >
            Export
          </button>
          <label className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] cursor-pointer">
            Import
            <input type="file" accept=".json" onChange={importBookmarks} className="hidden" />
          </label>
        </div>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--muted)] text-lg mb-4">No saved prompts yet.</p>
          <p className="text-sm text-[var(--muted)] mb-4">Save prompts while browsing to find them here later.</p>
          <Link href="/prompts" className="inline-block px-6 py-2 bg-[var(--accent)] text-white rounded-lg">
            Browse Prompts
          </Link>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)] mb-4">Saved on this browser</p>
      )}

      {prompts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {prompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
