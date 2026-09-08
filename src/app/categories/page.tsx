import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/categories';
import Link from 'next/link';

export const revalidate = 60;

async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Group by parent
  const parentCategories = categories.filter(c => !c.parent_id);
  const subcategoriesByParent = new Map<string, Category[]>();

  for (const cat of categories) {
    if (cat.parent_id) {
      const subs = subcategoriesByParent.get(cat.parent_id) || [];
      subs.push(cat);
      subcategoriesByParent.set(cat.parent_id, subs);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">Browse prompts by category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parentCategories.map((category) => {
          const subs = subcategoriesByParent.get(category.id) || [];
          const totalCount = category.count + subs.reduce((sum, s) => sum + s.count, 0);

          return (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon || '📁'}</span>
                <div>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {category.name}
                  </Link>
                  <p className="text-sm text-gray-500">{totalCount} prompts</p>
                </div>
              </div>

              {category.description && (
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              )}

              {subs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subcategories</p>
                  <div className="flex flex-wrap gap-2">
                    {subs.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                      >
                        {sub.icon && <span>{sub.icon}</span>}
                        {sub.name}
                        <span className="text-gray-400 text-xs">({sub.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
