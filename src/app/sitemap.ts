import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  // Fetch all published prompts for sitemap
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, slug, updated_at')
    .eq('status', 'published');

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at');

  // Fetch all tags
  const { data: tags } = await supabase
    .from('tags')
    .select('slug, updated_at')
    .limit(500);

  const baseUrl = 'https://promptvault.vercel.app';

  // Static routes
  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/prompts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/tags`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/saved`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Prompt routes
  const promptRoutes = prompts?.map(prompt => ({
    url: `${baseUrl}/prompts/${prompt.id}`,
    lastModified: prompt.updated_at ? new Date(prompt.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) || [];

  // Category routes
  const categoryRoutes = categories?.map(cat => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  })) || [];

  // Tag routes
  const tagRoutes = tags?.map(tag => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: tag.updated_at ? new Date(tag.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  })) || [];

  return [...staticRoutes, ...promptRoutes, ...categoryRoutes, ...tagRoutes];
}
