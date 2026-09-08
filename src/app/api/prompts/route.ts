import { createClient } from '@/lib/supabase-server';
import { PromptFilters } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const filters: PromptFilters = {
    type: (searchParams.get('type') as PromptFilters['type']) || undefined,
    tag: searchParams.get('tag') || undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as PromptFilters['sort']) || 'latest',
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0'),
  };

  let query = supabase
    .from('prompts')
    .select('*')
    .eq('status', 'published');

  // Type filter
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  // Tag filter
  if (filters.tag) {
    query = query.contains('tags', [filters.tag]);
  }

  // Search using full-text search
  if (filters.search) {
    const searchTerm = filters.search.trim().replace(/[^\w\s]/g, '');
    query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
  }

  // Sort
  switch (filters.sort) {
    case 'popular':
      query = query.order('likes_count', { ascending: false });
      break;
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Pagination
  query = query.range(filters.offset!, filters.offset! + filters.limit! - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      title: body.title,
      content: body.content,
      type: body.type || 'prompt',
      author_id: user.id,
      author_name: user.email?.split('@')[0] || 'anonymous',
      tags: body.tags || [],
      license: body.license || 'MIT',
      status: 'published',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
