"use client";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import {
  FileText,
  FilePlus,
  Eye,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => postsApi.getAllAdmin({ limit: 5 }),
    select: (res) => res.data,
  });

  const posts = postsData?.data || [];
  const meta = postsData?.meta;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold font-datum-display mb-1.5">
          {greeting},{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            {user?.name || "Admin"}
          </span> 👋
        </h1>
        <p className="text-text-muted text-sm">
          Here&apos;s what&apos;s happening with your blog today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FileText size={20} />}
          label="Total Posts"
          value={meta?.total?.toString() || "0"}
          colorClass="text-primary bg-primary/10 border-primary/30"
        />
        <StatCard
          icon={<Eye size={20} />}
          label="Published"
          value={
            posts.filter((p: any) => p.status === "PUBLISHED").length.toString()
          }
          colorClass="text-success bg-success/10 border-success/30"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Drafts"
          value={
            posts.filter((p: any) => p.status === "DRAFT").length.toString()
          }
          colorClass="text-warning bg-warning/10 border-warning/30"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="This Week"
          value={
            posts
              .filter((p: any) => {
                const d = new Date(p.createdAt);
                const now = new Date();
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return d >= weekAgo;
              })
              .length.toString()
          }
          colorClass="text-accent bg-accent/10 border-accent/30"
        />
      </div>

      <div className="flex gap-3 mb-8 flex-wrap">
        <Link 
          href="/zibon/posts/new" 
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors no-underline"
        >
          <FilePlus size={16} />
          New Post
        </Link>
        <Link 
          href="/zibon/posts" 
          className="flex items-center gap-1.5 px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg text-sm font-medium transition-colors no-underline"
        >
          <FileText size={16} />
          Manage Posts
        </Link>
      </div>

      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
          <h2 className="text-base font-bold font-datum-display text-text">
            Recent Posts
          </h2>
          <Link
            href="/zibon/posts"
            className="text-[13px] text-primary-light hover:text-primary transition-colors flex items-center gap-1 no-underline font-medium"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-10 text-center">
            <div className="spinner mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <FileText size={40} className="text-text-muted mb-3" />
            <p className="text-text-muted text-sm mb-4">
              No posts yet. Create your first post!
            </p>
            <Link
              href="/zibon/posts/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition-colors no-underline"
            >
              <FilePlus size={14} />
              Create Post
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-medium text-sm text-text max-w-[300px] truncate block">
                        {post.title}
                      </span>
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
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/zibon/posts/${post.id}/edit`}
                        className="px-2.5 py-1.5 bg-bg-tertiary hover:bg-bg-card border border-border rounded text-xs font-medium text-text transition-colors opacity-0 group-hover:opacity-100 no-underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl p-5 shadow-glass hover:-translate-y-1 transition-transform cursor-default">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-[28px] font-extrabold font-datum-display text-text leading-none mb-1">
        {value}
      </p>
      <p className="text-[13px] text-text-muted">{label}</p>
    </div>
  );
}
