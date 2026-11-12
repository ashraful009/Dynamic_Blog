"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi, siteSettingsApi } from "@/lib/api";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: catRes } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: settingsRes } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: () => siteSettingsApi.get(),
  });

  const categories = catRes?.data?.data || [];
  const settings = settingsRes?.data?.data || {};

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  // Categories marked to appear in the top header navbar (e.g., প্রকাশিত বই, দিনলিপি)
  const headerCategories = categories.filter(
    (c: any) => !c.parentId && c.showInHeader
  );

  // Fallback: if no category is marked as showInHeader yet, show top-level categories
  const navCategories =
    headerCategories.length > 0
      ? headerCategories
      : categories
          .filter(
            (c: any) =>
              !c.parentId &&
              !["home", "about", "contact"].includes(c.name.toLowerCase())
          )
          .slice(0, 4);

  const siteName = settings.siteName || "ফেরদৌস আনাম জীবন";
  const siteSubtitle =
    settings.siteSubtitle !== undefined ? settings.siteSubtitle : "লেখালেখি";

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
      {/* Mobile Toggle */}
      <div className="absolute top-4 right-4 z-50 md:hidden flex items-center">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer text-gray-700 hover:text-primary"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Main Centered Branding Area (matching shuhanrizwan.com) */}
      <div className="pt-7 pb-5 md:pt-9 md:pb-6 text-center flex flex-col items-center justify-center">
        <Link href="/" className="no-underline text-[#111] group">
          <h1 className="text-3xl md:text-[44px] font-bold tracking-tight mb-1.5 group-hover:text-primary transition-colors">
            {siteName}
          </h1>
          {siteSubtitle && (
            <p className="text-gray-600 italic font-serif text-sm md:text-[15px]">
              {siteSubtitle}
            </p>
          )}
        </Link>
      </div>

      {/* Desktop Navigation Bar */}
      <div className="hidden md:block border-t border-gray-200 bg-white">
        <nav className="flex items-center justify-center flex-wrap gap-x-4 h-12 text-[14px] text-[#222]">
          <Link
            href="/"
            className={`hover:text-primary transition-colors no-underline ${
              isActive("/") ? "text-primary font-bold" : "text-[#222]"
            }`}
          >
            মূলপাতা
          </Link>

          {navCategories.map((cat: any) => {
            const children =
              cat.children && cat.children.length > 0
                ? cat.children
                : categories.filter((c: any) => c.parentId === cat.id);
            const hasChildren = children.length > 0;

            return (
              <React.Fragment key={cat.id}>
                <span className="text-gray-300 select-none">/</span>
                <div className="group relative h-full flex items-center">
                  <Link
                    href={`/category/${cat.slug}`}
                    className={`flex items-center gap-1 hover:text-primary transition-colors no-underline ${
                      pathname === `/category/${cat.slug}`
                        ? "text-primary font-bold"
                        : "text-[#222]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {hasChildren && (
                      <ChevronDown
                        size={13}
                        className="text-primary transition-transform duration-200 group-hover:rotate-180"
                      />
                    )}
                  </Link>

                  {hasChildren && (
                    <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-0 min-w-[200px] bg-white shadow-lg border border-gray-200 border-t-2 border-t-primary py-1.5 z-50">
                      {children.map((child: any) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors no-underline text-left border-b border-gray-100 last:border-b-0"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          <span className="text-gray-300 select-none">/</span>
          <div className="group relative h-full flex items-center">
            <Link
              href="/about"
              className={`flex items-center gap-1 hover:text-primary transition-colors no-underline ${
                isActive("/about") ? "text-primary font-bold" : "text-[#222]"
              }`}
            >
              <span>লেখক প্রসঙ্গে</span>
              <ChevronDown
                size={13}
                className="text-primary transition-transform duration-200 group-hover:rotate-180"
              />
            </Link>
            <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-0 min-w-[180px] bg-white shadow-lg border border-gray-200 border-t-2 border-t-primary py-1.5 z-50">
              <Link
                href="/about"
                className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors no-underline text-left"
              >
                পরিচিতি ও যোগাযোগ
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1 max-h-[75vh] overflow-y-auto">
            <Link
              href="/"
              className={`px-4 py-2.5 rounded text-sm font-medium no-underline ${
                isActive("/")
                  ? "text-primary bg-primary/10"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              মূলপাতা
            </Link>

            {categories
              .filter((c: any) => !c.parentId)
              .map((cat: any) => {
                const children =
                  cat.children && cat.children.length > 0
                    ? cat.children
                    : categories.filter((c: any) => c.parentId === cat.id);
                const hasChildren = children.length > 0;
                const isExpanded = expandedCats[cat.id];
                return (
                  <div key={cat.id} className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/category/${cat.slug}`}
                        className="flex-1 px-4 py-2.5 rounded text-sm font-medium text-gray-700 no-underline hover:text-primary"
                      >
                        {cat.name}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => toggleCat(cat.id)}
                          className="p-2.5 text-gray-500 bg-transparent border-none cursor-pointer"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {hasChildren && isExpanded && (
                      <div className="flex flex-col pl-4 border-l border-gray-200 ml-4">
                        {children.map((child: any) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.slug}`}
                            className="px-4 py-2 text-sm text-gray-600 no-underline hover:text-primary"
                          >
                            ▸ {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            <Link
              href="/about"
              className={`px-4 py-2.5 rounded text-sm font-medium no-underline ${
                isActive("/about")
                  ? "text-primary bg-primary/10"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              লেখক প্রসঙ্গে
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
