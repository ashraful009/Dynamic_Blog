"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Hash, Edit3, Trash2, Search } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export default function TagsPage() {
  const queryClient = useQueryClient();
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [search, setSearch] = useState("");

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => tagsApi.getAll(),
  });

  const tags: TagItem[] = res?.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string }) => {
      if (editingTag) {
        return (await tagsApi.update(editingTag.id, data)).data;
      }
      return (await tagsApi.create(data)).data;
    },
    onSuccess: () => {
      toast.success(editingTag ? "Tag updated" : "Tag created");
      setEditingTag(null);
      setName("");
      setSlug("");
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Operation failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      toast.success("Tag deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete tag");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tag name is required");
      return;
    }
    saveMutation.mutate({
      name: name.trim(),
      slug: slug.trim() || undefined,
    });
  };

  const handleEdit = (tag: TagItem) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
  };

  const handleCancel = () => {
    setEditingTag(null);
    setName("");
    setSlug("");
  };

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold font-datum-display mb-1 flex items-center gap-2.5 text-text">
          <Hash size={20} />
          Tags (যা নিয়ে লিখছি, যাদের নিয়ে লিখছি)
        </h1>
        <p className="text-sm text-text-muted">
          Manage literary & topic tags displayed in the sidebar tag cloud and post pages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text focus:border-primary outline-none"
              />
            </div>
            <span className="text-xs text-text-muted font-medium">
              {filteredTags.length} tags
            </span>
          </div>

          {isLoading ? (
            <div className="p-10 text-center">
              <div className="spinner mx-auto border-primary/30 border-t-primary" />
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="p-10 text-center text-text-muted">
              No tags found. Create one on the right.
            </div>
          ) : (
            <div className="w-full overflow-x-auto bg-bg-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-elevated/50">
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Tag Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Slug
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
                  {filteredTags.map((tag) => (
                    <tr
                      key={tag.id}
                      className="hover:bg-bg-elevated transition-colors group"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-text">
                        {tag.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {tag.slug}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-elevated text-text-secondary">
                          {tag._count?.posts || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors bg-transparent border-none cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(`Delete tag "${tag.name}"?`)
                              ) {
                                deleteMutation.mutate(tag.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors bg-transparent border-none cursor-pointer"
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
          )}
        </div>

        <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass p-5">
          <h2 className="text-base font-semibold text-text mb-4 pb-3 border-b border-border">
            {editingTag ? "Edit Tag" : "Add New Tag"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Tag Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ওরহান পামুক"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Slug (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. orhan-pamuk"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary outline-none"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Leave empty to auto-generate (supports Bengali & English slugs)
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              {editingTag && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending
                  ? "Saving..."
                  : editingTag
                  ? "Update Tag"
                  : "Add Tag"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

