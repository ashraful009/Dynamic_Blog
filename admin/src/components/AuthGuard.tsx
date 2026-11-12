"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const res = await authApi.getProfile();
        const profile = res?.data?.data;
        if (profile && profile.role === "ADMIN") {
          if (isMounted) {
            setAuth(profile);
            setIsVerifying(false);
          }
        } else {
          if (isMounted) {
            clearAuth();
            router.replace("/login");
          }
        }
      } catch (error) {
        if (isMounted) {
          clearAuth();
          router.replace("/login");
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [router, setAuth, clearAuth]);

  if (isVerifying || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="spinner w-8 h-8 mb-4 mx-auto" />
          <p className="text-sm text-text-muted">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

