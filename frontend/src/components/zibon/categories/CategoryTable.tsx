"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Edit3, Trash2 } from "lucide-react";

interface CategoryTableProps {
  categories: { id: string; name: string; slug: string; parentId?: string | null; _count?: { posts: number } }[];
  isLoading: boolean;
  onEdit: (category: { id: string; name: string; slug: string; parentId?: string | null }) => void;
}

export default function CategoryTable({ categories, isLoading, onEdit }: CategoryTableProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: Error | unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete category");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <div className="spinner mx-auto border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-10 text-center text-text-muted">
        No categories found. Create one.
      </div>
    );
  }

  const topLevel = categories.filter(c => !c.parentId);
  const orderedCategories: typeof categories = [];
  topLevel.forEach(parent => {
    orderedCategories.push(parent);
    const children = categories.filter(c => c.parentId === parent.id);
    orderedCategories.push(...children);
  });
  categories.filter(c => c.parentId && !topLevel.find(p => p.id === c.parentId)).forEach(c => orderedCategories.push(c));

  return (
    <div className="w-full overflow-x-auto bg-bg-card rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-bg-elevated/50">
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Slug</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Posts</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orderedCategories.map((cat) => (
            <tr key={cat.id} className="hover:bg-bg-elevated transition-colors group">
              <td className={`px-4 py-3 text-sm ${cat.parentId ? 'pl-8 font-normal' : 'pl-4 font-semibold text-text'}`}>
                {cat.parentId ? "— " : ""}{cat.name}
              </td>
              <td className="px-4 py-3 text-sm text-text-muted">{cat.slug}</td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-elevated text-text-secondary">
                  {cat._count?.posts || 0}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors bg-transparent border-none cursor-pointer"
                    onClick={() => onEdit(cat)}
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50 bg-transparent border-none cursor-pointer"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
