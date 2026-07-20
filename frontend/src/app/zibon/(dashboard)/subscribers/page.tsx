"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi } from "@/lib/api";
import SubscriberTable from "@/components/zibon/subscribers/SubscriberTable";
import { Mail, ChevronLeft, ChevronRight } from "lucide-react";

export default function SubscribersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-subscribers", page],
    queryFn: () => subscribersApi.getAll({ page, limit }),
  });

  const subscribers = res?.data?.data || [];
  const meta = res?.data?.meta;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold font-datum-display mb-1 flex items-center gap-2.5 text-text">
          <Mail size={20} />
          Subscribers
        </h1>
        <p className="text-sm text-text-muted">
          Manage your newsletter subscribers ({meta?.total || 0} total)
        </p>
      </div>

      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass overflow-hidden">
        <SubscriberTable subscribers={subscribers} isLoading={isLoading} />
        
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-bg-card/30">
            <p className="text-[13px] text-text-muted">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded text-xs font-medium transition-colors disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded text-xs font-medium transition-colors disabled:opacity-50"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
