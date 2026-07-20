"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1A1A2E",
            color: "#F0F0F5",
            border: "1px solid #2A2A40",
            borderRadius: "10px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#1A1A2E",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#1A1A2E",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
