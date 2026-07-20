"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="spinner w-8 h-8 mb-4 mx-auto" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
