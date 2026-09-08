'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Prompt {
  id: string;
  title: string;
  content: string;
  type: string;
  author_name: string;
  tags: string[];
  status: string;
  created_at: string;
  rejection_reason?: string;
}

export default function AdminPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login first');
      window.location.href = '/';
      return;
    }
    setUser(user);
    fetchPrompts();
  };

  const fetchPrompts = async () => {
    const res = await fetch('/api/admin/prompts');
    if (res.status === 403) {
      alert('Access denied. You are not admin.');
      window.location.href = '/';
      return;
    }
    const { data } = await res.json();
    setPrompts(data || []);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await fetch('/api/admin/prompts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'published' }),
    });
    fetchPrompts();
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason:') || 'Not specified';
    await fetch('/api/admin/prompts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected', rejection_reason: reason }),
    });
    fetchPrompts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/admin/prompts?id=${id}`, { method: 'DELETE' });
    fetchPrompts();
  };

  const filteredPrompts = prompts.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <p className="text-gray-600 mb-6">Logged in as: {user?.email}</p>

      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'published', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? prompts.length : prompts.filter(p => p.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No prompts found.</p>
        ) : (
          filteredPrompts.map(prompt => (
            <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{prompt.title}</h3>
                  <p className="text-sm text-gray-500">
                    by @{prompt.author_name} • {prompt.type} • {new Date(prompt.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  prompt.status === 'published' ? 'bg-green-100 text-green-800' :
                  prompt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {prompt.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{prompt.content}</p>
              <div className="flex gap-2">
                {prompt.status !== 'published' && (
                  <button
                    onClick={() => handleApprove(prompt.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    ✓ Approve
                  </button>
                )}
                {prompt.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(prompt.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    ✗ Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  🗑 Delete
                </button>
              </div>
              {prompt.rejection_reason && (
                <p className="text-xs text-red-600 mt-2">Reason: {prompt.rejection_reason}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
