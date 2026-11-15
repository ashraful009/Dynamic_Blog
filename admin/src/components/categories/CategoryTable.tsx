"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Edit3, Trash2, ArrowUp, ArrowDown, Lock } from "lucide-react";
import { SYSTEM_HOME_CATEGORY_SLUG } from "@/constants/category";

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  showInHeader?: boolean;
  displayOrder?: number;
  isSystem?: boolean;
  _count?: { posts: number };
}

interface CategoryTableProps {
  categories: AdminCategoryItem[];
  isLoading: boolean;
  onEdit: (category: AdminCategoryItem) => void;
}

export default function CategoryTable({
  categories,
  isLoading,
  onEdit,
}: CategoryTableProps) {
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

  const reorderMutation = useMutation({
    mutationFn: (payload: { parentId: string | null; orderedIds: string[] }) =>
      categoriesApi.reorder(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["admin-categories"] });
      const previous = queryClient.getQueryData(["admin-categories"]);

      queryClient.setQueryData(["admin-categories"], (old: any) => {
        const list: AdminCategoryItem[] | undefined = old?.data?.data;
        if (!Array.isArray(list)) return old;

        const orderMap = new Map(
          payload.orderedIds.map((id, idx) => [id, idx])
        );
        const updated = list.map((item) =>
          orderMap.has(item.id)
            ? { ...item, displayOrder: orderMap.get(item.id)! }
            : item
        );

        const groupIndices: number[] = [];
        const groupItems: AdminCategoryItem[] = [];
        updated.forEach((item, idx) => {
          if (orderMap.has(item.id)) {
            groupIndices.push(idx);
            groupItems.push(item);
          }
        });
        groupItems.sort(
          (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
        );
        groupIndices.forEach((targetIdx, i) => {
          updated[targetIdx] = groupItems[i];
        });

        return {
          ...old,
          data: {
            ...old.data,
            data: updated,
          },
        };
      });

      return { previous };
    },
    onError: (error: Error | unknown, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-categories"], context.previous);
      }
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to reorder categories");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
  });

  const handleMove = (
    siblings: AdminCategoryItem[],
    index: number,
    direction: "up" | "down",
    parentId: string | null
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const reordered = [...siblings];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    reorderMutation.mutate({
      parentId,
      orderedIds: reordered.map((c) => c.id),
    });
  };

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

  const topLevel = categories.filter((c) => !c.parentId);
  const orderedCategories: AdminCategoryItem[] = [];
  topLevel.forEach((parent) => {
    orderedCategories.push(parent);
    const children = categories.filter((c) => c.parentId === parent.id);
    orderedCategories.push(...children);
  });
  categories
    .filter((c) => c.parentId && !topLevel.find((p) => p.id === c.parentId))
    .forEach((c) => orderedCategories.push(c));

  return (
    <div className="w-full overflow-x-auto bg-bg-card rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-bg-elevated/50">
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Slug
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Placement
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Posts
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orderedCategories.map((cat) => {
            const parentId = cat.parentId ?? null;
            const siblings = parentId
              ? categories.filter((c) => c.parentId === parentId)
              : topLevel;
            const siblingIndex = siblings.findIndex((s) => s.id === cat.id);
            const isSystemCategory = (item: AdminCategoryItem) =>
              Boolean(item.isSystem || item.slug === SYSTEM_HOME_CATEGORY_SLUG);
            const isProtected = isSystemCategory(cat);
            const prevSibling =
              siblingIndex > 0 ? siblings[siblingIndex - 1] : null;
            const isFirst = siblingIndex <= 0;
            const cannotMoveUp =
              isFirst ||
              isProtected ||
              Boolean(prevSibling && isSystemCategory(prevSibling));
            const cannotMoveDown =
              siblingIndex === siblings.length - 1 || isProtected;

            return (
              <tr
                key={cat.id}
                className="hover:bg-bg-elevated transition-colors group"
              >
                <td
                  className={`px-4 py-3 text-sm ${
                    cat.parentId
                      ? "pl-8 font-normal text-text-secondary"
                      : "pl-4 font-semibold text-text"
                  }`}
                >
                  {cat.parentId ? "↳ " : ""}
                  {isProtected && (
                    <Lock
                      size={13}
                      className="inline mr-1.5 text-amber-500 align-text-bottom"
                      aria-label="Protected category"
                    />
                  )}
                  {cat.name}
                  {isProtected && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Protected
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">{cat.slug}</td>
                <td className="px-4 py-3 text-xs">
                  {cat.showInHeader ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-primary/10 text-primary">
                      Top Navbar
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-bg-elevated text-text-muted">
                      Sidebar Tree
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-elevated text-text-secondary">
                    {cat._count?.posts || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-1 justify-end items-center">
                    <button
                      type="button"
                      className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                      onClick={() => handleMove(siblings, siblingIndex, "up", parentId)}
                      disabled={cannotMoveUp || reorderMutation.isPending}
                      title={
                        isProtected
                          ? "দিনলিপি must remain first"
                          : prevSibling && isSystemCategory(prevSibling)
                          ? "Cannot move above protected দিনলিপি category"
                          : "Move up"
                      }
                      aria-label={`Move ${cat.name} up`}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                      onClick={() => handleMove(siblings, siblingIndex, "down", parentId)}
                      disabled={cannotMoveDown || reorderMutation.isPending}
                      title={
                        isProtected ? "দিনলিপি must remain first" : "Move down"
                      }
                      aria-label={`Move ${cat.name} down`}
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100"
                      onClick={() => onEdit(cat)}
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        if (!isProtected) handleDelete(cat.id, cat.name);
                      }}
                      disabled={isProtected || deleteMutation.isPending}
                      title={
                        isProtected
                          ? "Protected system category cannot be deleted"
                          : "Delete"
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
