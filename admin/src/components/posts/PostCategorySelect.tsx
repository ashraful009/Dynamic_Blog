"use client";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import { FolderTree } from "lucide-react";

interface PostCategorySelectProps {
  selectedIds: string[];
  onChange: (categoryIds: string[]) => void;
}

export default function PostCategorySelect({ selectedIds, onChange }: PostCategorySelectProps) {
  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const categories = res?.data?.data || [];
  const parentCategories = categories.filter((c: any) => !c.parentId);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl p-5 shadow-glass">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-text flex items-center gap-2">
          <FolderTree size={16} />
          Categories ({selectedIds.length})
        </label>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-text-muted hover:text-danger transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-[13px] text-text-muted">Loading categories...</div>
      ) : (
        <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
          {parentCategories.map((cat: any) => {
            const subCategories = categories.filter((sub: any) => sub.parentId === cat.id);
            return (
              <div key={cat.id} className="space-y-1">
                <label className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-text">{cat.name}</span>
                </label>

                {subCategories.length > 0 && (
                  <div className="pl-6 space-y-1 border-l border-border/60 ml-4">
                    {subCategories.map((sub: any) => (
                      <label
                        key={sub.id}
                        className="flex items-center gap-2.5 px-2.5 py-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sub.id)}
                          onChange={() => toggleCategory(sub.id)}
                          className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-[13px] text-text-secondary">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
