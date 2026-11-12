"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subscribersApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

interface SubscriberTableProps {
  subscribers: { id: string; email: string; isSubscribed: boolean; createdAt: string }[];
  isLoading: boolean;
}

export default function SubscriberTable({ subscribers, isLoading }: SubscriberTableProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscribersApi.delete(id),
    onSuccess: () => {
      toast.success("Subscriber removed");
      queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
    },
    onError: (error: Error | unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete subscriber");
    },
  });

  const handleDelete = (id: string, email: string) => {
    if (window.confirm(`Remove ${email} from subscribers?`)) {
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

  if (subscribers.length === 0) {
    return (
      <div className="p-10 text-center text-text-muted">
        No subscribers yet.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-bg-card rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-bg-elevated/50">
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Subscribed Date</th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {subscribers.map((sub) => (
            <tr key={sub.id} className="hover:bg-bg-elevated transition-colors group">
              <td className="px-4 py-3 text-sm font-medium text-text">{sub.email}</td>
              <td className="px-4 py-3 text-[13px] text-text-secondary">
                {new Date(sub.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50 bg-transparent border-none cursor-pointer"
                    onClick={() => handleDelete(sub.id, sub.email)}
                    disabled={deleteMutation.isPending}
                    title="Remove"
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
