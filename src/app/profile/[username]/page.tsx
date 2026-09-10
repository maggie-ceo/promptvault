'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PromptCard from '@/components/PromptCard';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) loadProfile();
  }, [username]);

  async function loadProfile() {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: promptsData } = await supabase
        .from('prompts')
        .select('*')
        .eq('author_id', profileData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setPrompts(promptsData || []);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Profile not found</h2>
          <Link href="/prompts" className="text-blue-600 hover:underline">← Back to Browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
            {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.display_name || profile.username}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{prompts.length}</p>
            <p className="text-sm text-gray-500">Prompts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{profile.total_saves || 0}</p>
            <p className="text-sm text-gray-500">Total Saves</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
            </p>
            <p className="text-sm text-gray-500">Joined</p>
          </div>
        </div>
      </div>

      {/* Published Prompts */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Published Prompts</h2>
      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No published prompts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
