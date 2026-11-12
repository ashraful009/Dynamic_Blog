"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function FeaturedPostSelector() {
  const queryClient = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => postsApi.getAllAdmin({ limit: 50, status: "PUBLISHED" }),
  });

  const posts = res?.data?.data || [];
  const featuredPost = posts.find((p: { isFeatured: boolean }) => p.isFeatured);

  const mutation = useMutation({
    mutationFn: (data: { id: string; isFeatured: boolean }) => 
      postsApi.update(data.id, { isFeatured: data.isFeatured }),
    onSuccess: () => {
      toast.success("Featured post updated");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: () => toast.error("Failed to update featured post"),
  });

  if (isLoading) return <div className="text-sm text-text-muted">Loading posts...</div>;

  const handleSelect = (postId: string) => {
    if (!postId) return;
    mutation.mutate({ id: postId, isFeatured: true });
  };

  const handleRemove = (postId: string) => {
    mutation.mutate({ id: postId, isFeatured: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Currently Featured Post</label>
        {featuredPost ? (
          <div className="bg-bg-elevated p-4 rounded-lg border border-border flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-text mb-1">{featuredPost.title}</h4>
              <p className="text-xs text-text-muted">
                {featuredPost.category?.name || "Uncategorized"} • {featuredPost.readTime || 5} min read
              </p>
            </div>
            <button 
              className="px-3 py-1.5 bg-bg-tertiary hover:bg-bg-card border border-border rounded text-xs font-medium text-text transition-colors disabled:opacity-50"
              onClick={() => handleRemove(featuredPost.id)}
              disabled={mutation.isPending}
            >
              Unfeature
            </button>
          </div>
        ) : (
          <div className="p-4 text-text-muted italic bg-bg-elevated rounded-lg text-sm border border-border/50">
            No post is currently featured.
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Select a post to feature</label>
        <select 
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none" 
          onChange={(e) => handleSelect(e.target.value)}
          value={""} 
          disabled={mutation.isPending}
        >
          <option value="" disabled>-- Select a published post --</option>
          {posts.filter((p: { isFeatured: boolean }) => !p.isFeatured).map((post: { id: string; title: string }) => (
            <option key={post.id} value={post.id}>
              {post.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-muted mt-1.5">
          Selecting a new post will automatically unfeature the current one.
        </p>
      </div>
    </div>
  );
}
