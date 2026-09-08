import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Increment copies count
  await supabase
    .from('prompts')
    .update({ copies_count: (data.copies_count || 0) + 1 })
    .eq('id', id);

  const content = `# ${data.title}\n\nType: ${data.type}\nAuthor: @${data.author_name}\nTags: ${data.tags.join(', ')}\nLicense: ${data.license || 'N/A'}\n\n---\n\n${data.content}`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt"`,
    },
  });
}
