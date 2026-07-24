"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";

import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, hydrate, logout } = useAuthStore();

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: catRes } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => categoriesApi.getAll(),
  });
  const categories = catRes?.data?.data || [];

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;
  // Theme variables globally applied to match homepage
  const theme = {
    bg: "bg-white/95 border-border",
    logoText: "text-text",
    navLinkActive: "text-primary bg-primary/10",
    navLinkInactive: "text-text-secondary hover:text-primary hover:bg-black/5",
    dropdownBg: "bg-white border-border shadow-glass shadow-xl",
    dropdownItem: "text-text-secondary hover:bg-bg-secondary hover:text-primary",
    mobileMenuBg: "bg-white border-border",
    iconBtn: "text-text-secondary hover:text-primary hover:bg-black/5",
  };

  return (
    <header className={`sticky top-0 z-50 flex flex-col ${theme.bg}`}>
      {/* Main Navbar (Top Bar) */}
      <div className="border-b border-border bg-white/95 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 no-underline">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold font-display">
                Z
              </div>
              <span className={`font-display font-bold text-[18px] ${theme.logoText}`}>
                Zibon<span className="text-primary-light">Vlog</span>
              </span>
            </Link>

            {/* Desktop Main Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  isActive("/") ? theme.navLinkActive : theme.navLinkInactive
                }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  isActive("/about") ? theme.navLinkActive : theme.navLinkInactive
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  isActive("/contact") ? theme.navLinkActive : theme.navLinkInactive
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href={user?.role === "ADMIN" ? "/zibon/dashboard" : "/"}
                    className="hidden md:flex px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all no-underline"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = "/login";
                    }}
                    className="hidden md:flex px-4 py-2 rounded-lg text-sm font-medium text-text bg-black/5 hover:bg-black/10 transition-all border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all no-underline"
                >
                  Login
                </Link>
              )}

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer transition-colors ${theme.iconBtn}`}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navbar (Bottom Bar - Desktop Only) */}
      {categories.length > 0 && (
        <div className="hidden md:block border-b border-border bg-white shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-center gap-8 h-12">
              {categories
                .filter((c: any) => !c.parentId && !["home", "about", "contact"].includes(c.name.toLowerCase()))
                .map((cat: any) => {
                  const children = categories.filter((c: any) => c.parentId === cat.id);
                  const hasChildren = children.length > 0;

                  return (
                    <div key={cat.id} className="group relative h-full flex items-center">
                      {hasChildren ? (
                        <button
                          className="flex items-center gap-1.5 text-[15px] font-medium text-text-secondary hover:text-primary transition-colors py-3 no-underline border-none bg-transparent cursor-pointer"
                        >
                          {cat.name}
                          <ChevronDown size={14} className="text-primary transition-transform duration-200 group-hover:rotate-180" />
                        </button>
                      ) : (
                        <Link
                          href={`/category/${cat.slug}`}
                          className="flex items-center gap-1.5 text-[15px] font-medium text-text-secondary hover:text-primary transition-colors py-3 no-underline"
                        >
                          {cat.name}
                        </Link>
                      )}

                      {hasChildren && (
                        <div className={`hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-0 w-48 rounded-b-xl overflow-hidden py-2 ${theme.dropdownBg} shadow-lg border-t-2 border-t-primary z-50`}>
                          {children.map((child: any) => (
                            <Link
                              key={child.id}
                              href={`/category/${child.slug}`}
                              className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary hover:text-primary transition-colors no-underline text-center"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t animate-fade-in ${theme.mobileMenuBg}`}>
          <div className="px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            <Link href="/" className={`px-4 py-3 rounded-lg text-sm font-medium no-underline ${isActive("/") ? theme.navLinkActive : theme.navLinkInactive}`}>
              Home
            </Link>
            <Link href="/about" className={`px-4 py-3 rounded-lg text-sm font-medium no-underline ${isActive("/about") ? theme.navLinkActive : theme.navLinkInactive}`}>
              About
            </Link>
            <Link href="/contact" className={`px-4 py-3 rounded-lg text-sm font-medium no-underline ${isActive("/contact") ? theme.navLinkActive : theme.navLinkInactive}`}>
              Contact
            </Link>
            
            <div className="h-px bg-border my-2 mx-4" />
            {isAuthenticated ? (
              <div className="flex flex-col gap-2 mx-4">
                <Link href={user?.role === "ADMIN" ? "/zibon/dashboard" : "/"} className="px-4 py-3 rounded-lg text-sm font-medium no-underline text-white bg-primary text-center">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-text bg-black/5 text-center border-none cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-3 rounded-lg text-sm font-medium no-underline text-white bg-primary text-center mx-4">
                Login
              </Link>
            )}
            <div className="h-px bg-border my-2 mx-4" />
            
            {categories
              .filter((c: any) => !c.parentId && !["home", "about", "contact"].includes(c.name.toLowerCase()))
              .map((cat: any) => {
              const children = categories.filter((c: any) => c.parentId === cat.id);
              const hasChildren = children.length > 0;
              const isExpanded = expandedCats[cat.id];
              return (
                <div key={cat.id} className="flex flex-col">
                  {hasChildren ? (
                    <button
                      onClick={() => toggleCat(cat.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-text text-left border-none bg-transparent cursor-pointer ${theme.navLinkInactive}`}
                    >
                      {cat.name}
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={`/category/${cat.slug}`}
                      className={`px-4 py-3 rounded-lg text-sm font-semibold text-text no-underline ${theme.navLinkInactive}`}
                    >
                      {cat.name}
                    </Link>
                  )}
                  {hasChildren && isExpanded && (
                    <div className="flex flex-col animate-fade-in">
                      {children.map((child: any) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className={`px-8 py-2 rounded-lg text-sm text-text-secondary no-underline hover:text-primary ${theme.navLinkInactive}`}
                        >
                          — {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
