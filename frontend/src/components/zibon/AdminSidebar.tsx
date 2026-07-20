"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Image as ImageIcon,
  Settings,
  LogOut,
  Zap,
  Home,
  Tag,
  Mail,
  X,
  UserCircle
} from "lucide-react";

const navItems = [
  { href: "/zibon/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/zibon/homepage", label: "Homepage", icon: Home },
  { href: "/zibon/posts", label: "All Posts", icon: FileText },
  { href: "/zibon/posts/new", label: "New Post", icon: FilePlus },
  { href: "/zibon/categories", label: "Categories", icon: Tag },
  { href: "/zibon/subscribers", label: "Subscribers", icon: Mail },
  { href: "/zibon/media", label: "Media Library", icon: ImageIcon },
  { href: "/zibon/about", label: "About Page", icon: UserCircle },
  { href: "/zibon/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/zibon/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap size={20} color="white" />
          </div>
          <div>
            <h1 className="text-[18px] font-extrabold text-text-primary font-display">
              Zibon<span className="text-primary-light">Vlog</span>
            </h1>
            <p className="text-[11px] text-text-muted -mt-0.5">Admin Panel</p>
          </div>
        </Link>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-text-muted hover:text-text bg-transparent border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="mb-2 px-3">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[1px]">
            Menu
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/zibon/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                isActive 
                  ? "bg-primary/10 text-primary-light" 
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text"
              }`}
            >
              <Icon size={18} className={isActive ? "text-primary-light" : "text-text-muted"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-[14px] font-bold text-white shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              {user?.email || "admin@zibon.com"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors bg-transparent border-none cursor-pointer"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );
}
