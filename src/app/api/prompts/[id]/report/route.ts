import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/prompts/[id]/report - Report a prompt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id: promptId } = await params;

  const body = await request.json();
  const { reason, details } = body;

  if (!reason || !['spam', 'copyright', 'unsafe', 'duplicate', 'low_quality', 'other'].includes(reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
  }

  // Check for duplicate reports from same user
  if (user) {
    const { data: existing } = await supabase
      .from('prompt_reports')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('reporter_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already reported' }, { status: 409 });
    }
  }

  const { error } = await supabase
    .from('prompt_reports')
    .insert({
      prompt_id: promptId,
      reporter_id: user?.id || null,
      reason,
      details: details?.trim() || null,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
