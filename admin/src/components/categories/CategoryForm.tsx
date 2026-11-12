"use client";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
    showInHeader?: boolean;
  } | null;
  categories: {
    id: string;
    name: string;
    parentId?: string | null;
    showInHeader?: boolean;
  }[];
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({
  initialData,
  categories,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [showInHeader, setShowInHeader] = useState(false);

  useEffect(() => {
    if (initialData) {
      const timeoutId = setTimeout(() => {
        setName(initialData.name || "");
        setSlug(initialData.slug || "");
        setParentId(initialData.parentId || "");
        setShowInHeader(Boolean(initialData.showInHeader));
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      setName("");
      setSlug("");
      setParentId("");
      setShowInHeader(false);
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      slug?: string;
      parentId?: string | null;
      showInHeader?: boolean;
    }) => {
      if (initialData) {
        return (await categoriesApi.update(initialData.id, data)).data;
      }
      return (await categoriesApi.create(data)).data;
    },
    onSuccess: () => {
      toast.success(initialData ? "Category updated" : "Category created");
      setName("");
      setSlug("");
      setParentId("");
      setShowInHeader(false);
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
    mutation.mutate({
      name: name.trim(),
      slug: slug.trim() || undefined,
      parentId: parentId || null,
      showInHeader,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Name
        </label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          placeholder="e.g. বইয়ের আলাপ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Slug (Optional)
        </label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          placeholder="e.g. boiyer-alap"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <p className="text-[11px] text-text-muted mt-1">
          Leave empty to auto-generate from name (supports Bengali & English)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Parent Category
        </label>
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

      {!parentId && (
        <label className="flex items-start gap-2.5 p-3 rounded-lg bg-bg-card border border-border cursor-pointer">
          <input
            type="checkbox"
            checked={showInHeader}
            onChange={(e) => setShowInHeader(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-primary rounded border-border"
          />
          <div className="text-xs">
            <span className="font-semibold text-text block">
              Show in Top Header Navbar
            </span>
            <span className="text-text-muted">
              Enable for top menu items like &quot;প্রকাশিত বই&quot; or &quot;দিনলিপি&quot;. Leave unchecked to display in the Sidebar &quot;বিষয় নির্বাচন&quot; list.
            </span>
          </div>
        </label>
      )}

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
