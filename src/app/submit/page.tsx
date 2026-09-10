'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [tool, setTool] = useState('general');
  const [promptType, setPromptType] = useState('text');
  const [difficulty, setDifficulty] = useState('beginner');
  const [exampleInput, setExampleInput] = useState('');
  const [exampleOutput, setExampleOutput] = useState('');
  const [usageNotes, setUsageNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tools = [
    { value: 'general', label: 'General AI' },
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'claude', label: 'Claude' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'midjourney', label: 'Midjourney' },
    { value: 'stable-diffusion', label: 'Stable Diffusion' },
    { value: 'other', label: 'Other' },
  ];

  const types = [
    { value: 'text', label: 'Text' },
    { value: 'coding', label: 'Coding' },
    { value: 'image', label: 'Image' },
    { value: 'system', label: 'System' },
    { value: 'research', label: 'Research' },
    { value: 'productivity', label: 'Productivity' },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!title.trim() || !description.trim() || !content.trim() || !category) {
        throw new Error('Title, description, content, and category are required.');
      }

      if (content.length < 20) {
        throw new Error('Prompt content must be at least 20 characters.');
      }

      if (content.length > 10000) {
        throw new Error('Prompt content must be under 10,000 characters.');
      }

      const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5);

      const { data, error: insertError } = await supabase
        .from('prompts')
        .insert({
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          category_id: category,
          tags: tagArray,
          tool,
          prompt_type: promptType,
          difficulty,
          example_input: exampleInput.trim() || null,
          example_output: exampleOutput.trim() || null,
          usage_notes: usageNotes.trim() || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push('/prompts?submitted=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
        <strong>Note:</strong> Your prompt will be submitted as pending. It will be reviewed by an admin before publishing.
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit a Prompt</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="A short, descriptive title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of what this prompt does..."
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="The actual prompt text... Use {{variable}} for placeholders."
              rows={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/10,000 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select category</option>
                <option value="coding">Coding</option>
                <option value="writing">Writing</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="productivity">Productivity</option>
                <option value="education">Education</option>
                <option value="research">Research</option>
                <option value="image-generation">Image Generation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Tool</label>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {tools.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Type</label>
              <select
                value={promptType}
                onChange={(e) => setPromptType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated, max 5)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="writing, email, marketing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Example Input (optional)</label>
            <textarea
              value={exampleInput}
              onChange={(e) => setExampleInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Example of how to use this prompt..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Example Output (optional)</label>
            <textarea
              value={exampleOutput}
              onChange={(e) => setExampleOutput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Expected output from the AI..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Notes (optional)</label>
            <textarea
              value={usageNotes}
              onChange={(e) => setUsageNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional tips or instructions..."
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
