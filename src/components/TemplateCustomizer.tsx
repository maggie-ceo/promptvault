'use client';

import { useState, useMemo } from 'react';

interface Props {
  content: string;
}

export default function TemplateCustomizer({ content }: Props) {
  // Detect {{variables}} in content
  const variables = useMemo(() => {
    const regex = /\{\{([^}]+)\}\}/g;
    const found: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const varName = match[1].trim();
      if (!found.includes(varName)) found.push(varName);
    }
    return found;
  }, [content]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [showCustomizer, setShowCustomizer] = useState(false);

  const rendered = useMemo(() => {
    let result = content;
    for (const [key, val] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `[${key}]`);
    }
    return result;
  }, [content, values]);

  const hasUnresolved = variables.some(v => !values[v]);

  if (variables.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowCustomizer(!showCustomizer)}
        className="text-sm font-medium text-[var(--accent)] hover:underline"
      >
        {showCustomizer ? 'Hide Customizer' : `Customize Template (${variables.length} variables)`}
      </button>

      {showCustomizer && (
        <div className="mt-4 p-5 bg-[var(--background)] rounded-xl border border-[var(--border)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {variables.map(v => (
              <div key={v}>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </label>
                <input
                  type="text"
                  value={values[v] || ''}
                  onChange={(e) => setValues(prev => ({ ...prev, [v]: e.target.value }))}
                  placeholder={`Enter ${v}...`}
                  className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)]"
                />
              </div>
            ))}
          </div>

          {/* Live Preview */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Preview</label>
            <pre className="whitespace-pre-wrap text-sm font-mono bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)] text-[var(--muted)]">
              {rendered}
            </pre>
          </div>

          {hasUnresolved && (
            <p className="text-xs text-[var(--accent)] mb-3">
              ⚠️ Fill in all variables for a complete template
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(rendered)}
              className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg font-medium hover:opacity-90"
            >
              Copy Customized
            </button>
            <button
              onClick={() => setValues({})}
              className="px-4 py-2 border border-[var(--border)] text-sm rounded-lg hover:bg-[var(--surface)]"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
