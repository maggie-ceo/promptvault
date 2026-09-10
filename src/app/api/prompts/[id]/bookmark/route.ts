import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/prompts/[id]/bookmark - Add bookmark
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const { id: promptId } = await params;

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('prompt_id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: user.id, prompt_id: promptId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/prompts/[id]/bookmark - Remove bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const { id: promptId } = await params;

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('prompt_id', promptId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// GET /api/prompts/[id]/bookmark - Check if bookmarked
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ bookmarked: false });
  }

  const { id: promptId } = await params;

  const { data, error } = await supabase
    .from('bookmarks')
    .select('prompt_id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single();

  return NextResponse.json({ bookmarked: !!data && !error });
}
