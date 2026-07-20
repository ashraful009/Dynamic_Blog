"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostUrl } from "@/utils/postUrl";
import { postsApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FilePlus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

export default function PostsListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["admin-posts", page, statusFilter],
    queryFn: () =>
      postsApi.getAllAdmin({
        page,
        limit: 10,
        status: statusFilter || undefined,
      }),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const posts = postsData?.data || [];
  const meta = postsData?.meta;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-datum-display mb-1 text-text">
            All Posts
          </h1>
          <p className="text-text-muted text-sm">
            Manage your blog posts
          </p>
        </div>
        <Link 
          href="/zibon/posts/new" 
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors no-underline"
        >
          <FilePlus size={16} />
          New Post
        </Link>
      </div>

      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl px-5 py-4 mb-5 shadow-glass flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            className="w-full bg-bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {["", "PUBLISHED", "DRAFT"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === status 
                  ? "bg-primary text-white" 
                  : "bg-bg-card border border-border text-text hover:bg-bg-tertiary"
              }`}
            >
              {status === "" ? "All" : status === "PUBLISHED" ? "Published" : "Drafts"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="spinner w-8 h-8 mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <FileText size={48} className="text-text-muted mb-4" />
            <p className="text-text-secondary text-base font-medium mb-2">
              No posts found
            </p>
            <p className="text-text-muted text-sm mb-5">
              {statusFilter
                ? "Try changing the filter"
                : "Create your first blog post"}
            </p>
            <Link 
              href="/zibon/posts/new" 
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors no-underline"
            >
              <FilePlus size={16} />
              Create Post
            </Link>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-card/50">
                    <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right w-[140px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts
                    .filter((post: any) =>
                      search
                        ? post.title.toLowerCase().includes(search.toLowerCase())
                        : true
                    )
                    .map((post: any) => (
                      <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-text max-w-[350px] truncate">
                              {post.title}
                            </span>
                            {post.excerpt && (
                              <span className="text-xs text-text-muted mt-0.5 max-w-[350px] truncate">
                                {post.excerpt}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              post.status === "PUBLISHED"
                                ? "bg-success/10 text-success"
                                : "bg-bg-elevated text-text-secondary border border-border"
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-text-secondary">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-text-secondary">
                          {new Date(post.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            {post.status === "PUBLISHED" && (
                              <Link
                                href={getPostUrl(post)}
                                target="_blank"
                                className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors"
                                title="View live"
                              >
                                <ExternalLink size={15} />
                              </Link>
                            )}
                            <Link
                              href={`/zibon/posts/${post.id}/edit`}
                              className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={15} />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50 bg-transparent border-none cursor-pointer"
                              title="Delete"
                              disabled={deleteMutation.isPending}
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

            {meta && meta.totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-bg-card/30">
                <p className="text-[13px] text-text-muted">
                  Page {meta.page} of {meta.totalPages} • {meta.total} posts
                </p>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded text-xs font-medium transition-colors disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded text-xs font-medium transition-colors disabled:opacity-50"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
