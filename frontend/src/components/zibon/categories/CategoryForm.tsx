"use client";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface CategoryFormProps {
  initialData?: { id: string; name: string; slug: string; parentId?: string | null } | null;
  categories: { id: string; name: string; parentId?: string | null }[];
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({ initialData, categories, onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (initialData) {
      const timeoutId = setTimeout(() => {
        setName(initialData.name || "");
        setSlug(initialData.slug || "");
        setParentId(initialData.parentId || "");
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      setName("");
      setSlug("");
      setParentId("");
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; slug?: string; parentId?: string }) => {
      if (initialData) {
        return categoriesApi.update(initialData.id, data);
      }
      return categoriesApi.create(data);
    },
    onSuccess: () => {
      toast.success(initialData ? "Category updated" : "Category created");
      setName("");
      setSlug("");
      setParentId("");
      onSuccess();
    },
    onError: (error: Error | unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Operation failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    mutation.mutate({ name: name.trim(), slug: slug.trim() || undefined, parentId: parentId || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          placeholder="e.g. Systems"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Slug (Optional)</label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          placeholder="e.g. systems"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <p className="text-[11px] text-text-muted mt-1">
          Leave empty to auto-generate from name
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Parent Category</label>
        <select
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">None (Top-level)</option>
          {categories
            .filter((cat) => cat.id !== initialData?.id && !cat.parentId) 
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
      </div>

      <div className="flex gap-2 mt-2">
        {onCancel && (
          <button
            type="button"
            className="flex-1 px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : initialData ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
}
