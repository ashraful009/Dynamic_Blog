"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import CategoryTable from "@/components/zibon/categories/CategoryTable";
import CategoryForm from "@/components/zibon/categories/CategoryForm";
import { Tag } from "lucide-react";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; slug: string; parentId?: string | null } | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const categories = res?.data?.data || [];

  const handleEdit = (category: { id: string; name: string; slug: string; parentId?: string | null }) => {
    setEditingCategory(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold font-datum-display mb-1 flex items-center gap-2.5 text-text">
          <Tag size={20} />
          Categories
        </h1>
        <p className="text-sm text-text-muted">
          Manage your post categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass overflow-hidden">
          <CategoryTable
            categories={categories}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </div>
        
        <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass p-5">
          <h2 className="text-base font-semibold text-text mb-4 pb-3 border-b border-border">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <CategoryForm
            initialData={editingCategory}
            categories={categories}
            onSuccess={() => {
              setEditingCategory(null);
              queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            }}
            onCancel={editingCategory ? handleCancelEdit : undefined}
          />
        </div>
      </div>
    </div>
  );
}
