"use client";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";

interface PostCategorySelectProps {
  categoryId: string;
  onChange: (categoryId: string) => void;
}

export default function PostCategorySelect({ categoryId, onChange }: PostCategorySelectProps) {
  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const categories = res?.data?.data || [];

  return (
    <div className="bg-bg-elevated p-4 rounded-lg">
      <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
      {isLoading ? (
        <div className="text-[13px] text-text-muted">Loading categories...</div>
      ) : (
        <select
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
          value={categoryId}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- No Category --</option>
          {categories
            .filter((c: any) => !c.parentId)
            .map((cat: any) => (
              <optgroup key={cat.id} label={cat.name}>
                <option value={cat.id}>{cat.name} (Parent)</option>
                {categories
                  .filter((sub: any) => sub.parentId === cat.id)
                  .map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      — {sub.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          {categories
            .filter((c: any) => c.parentId && !categories.find((p: any) => p.id === c.parentId))
            .map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
      )}
    </div>
  );
}
