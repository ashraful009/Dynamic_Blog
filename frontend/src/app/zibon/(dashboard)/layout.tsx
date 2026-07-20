"use client";
import { useState } from "react";
import AuthGuard from "@/components/zibon/AuthGuard";
import AdminSidebar from "@/components/zibon/AdminSidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bg">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Wrapper */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-bg-card sticky top-0 z-30">
            <div className="font-display font-bold text-[18px] text-text">
              Zibon<span className="text-primary-light">Vlog</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-1 text-text-secondary hover:text-text bg-transparent border-none cursor-pointer"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Main Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-bg">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
