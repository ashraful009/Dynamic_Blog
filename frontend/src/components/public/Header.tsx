"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import React from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi, siteSettingsApi } from "@/lib/api";
import Container from "@/components/public/Container";
import type { Category, SiteSettings } from "@/types/blog";
import {
  SYSTEM_HOME_CATEGORY_NAME,
  SYSTEM_HOME_CATEGORY_SLUG,
} from "@/constants/category";

export default function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const mobileOpen = openPath === pathname;
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

  const categories: Category[] = catRes?.data?.data || [];
  const settings: SiteSettings = settingsRes?.data?.data || {};

  const isActive = (href: string) => pathname === href;

  const isSystemCategory = (c: Category) =>
    Boolean(c.isSystem || c.slug === SYSTEM_HOME_CATEGORY_SLUG);

  const systemCategory = categories.find(
    (c: Category) => !c.parentId && isSystemCategory(c)
  );
  const homeCategoryLabel = systemCategory?.name || SYSTEM_HOME_CATEGORY_NAME;
  const homeCategoryChildren = systemCategory
    ? systemCategory.children && systemCategory.children.length > 0
      ? systemCategory.children
      : categories.filter((c: Category) => c.parentId === systemCategory.id)
    : [];

  // Categories marked to appear in the top header navbar (excluding system home category দিনলিপি, which is always pinned first as "/")
  const headerCategories = categories.filter(
    (c: Category) => !c.parentId && c.showInHeader && !isSystemCategory(c)
  );

  // Fallback: if no other category is marked as showInHeader yet, show top-level categories
  const navCategories =
    headerCategories.length > 0
      ? headerCategories
      : categories
          .filter(
            (c: Category) =>
              !c.parentId &&
              !isSystemCategory(c) &&
              !["home", "about", "contact"].includes(c.name.toLowerCase())
          )
          .slice(0, 4);

  const siteName = settings.siteName || "ফেরদৌস আনাম জীবন";
  const siteSubtitle =
    settings.siteSubtitle !== undefined ? settings.siteSubtitle : "লেখালেখি";

  return (
    <header className="bg-page-alt sticky top-0 z-50 border-b border-line">
      {/* Mobile Toggle */}
      <div className="absolute top-4 right-4 z-50 md:hidden flex items-center">
        <button
          onClick={() => setOpenPath(mobileOpen ? null : pathname)}
          className="flex items-center justify-center w-10 h-10 rounded-control bg-transparent border-none cursor-pointer text-body hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Main Centered Branding Area (matching shuhanrizwan.com) */}
      <Container className="pt-7 pb-5 md:pt-9 md:pb-6 text-center flex flex-col items-center justify-center">
        <Link href="/" className="no-underline text-heading group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control">
          <h1 className="text-3xl md:text-[44px] font-bold tracking-tight mb-1.5 group-hover:text-link-hover transition-colors">
            {siteName}
          </h1>
          {siteSubtitle && (
            <p className="text-muted italic font-serif text-sm md:text-body">
              {siteSubtitle}
            </p>
          )}
        </Link>
      </Container>

      {/* Desktop Navigation Bar */}
      <div className="hidden md:block border-t border-line bg-page-alt">
        <Container>
          <nav className="flex items-center justify-center flex-wrap gap-x-4 h-12 text-small text-body">
          <div className="group relative h-full flex items-center">
            <Link
              href="/"
              className={`flex items-center gap-1 hover:text-link-hover transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control ${
                isActive("/") ? "text-link font-bold" : "text-body"
              }`}
            >
              <span>{homeCategoryLabel}</span>
              {homeCategoryChildren.length > 0 && (
                <ChevronDown
                  size={13}
                  className="text-link transition-transform duration-200 group-hover:rotate-180"
                />
              )}
            </Link>

            {homeCategoryChildren.length > 0 && (
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-0 min-w-[200px] bg-surface shadow-raised border border-line border-t-2 border-t-primary py-1.5 z-50">
                {homeCategoryChildren.map((child: Category) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.slug}`}
                    className="block px-4 py-2 text-small text-body hover:bg-surface-2 hover:text-link-hover transition-colors no-underline text-left border-b border-line last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navCategories.map((cat: Category) => {
            const children =
              cat.children && cat.children.length > 0
                ? cat.children
                : categories.filter((c: Category) => c.parentId === cat.id);
            const hasChildren = children.length > 0;

            return (
              <React.Fragment key={cat.id}>
                <span className="text-faint select-none">/</span>
                <div className="group relative h-full flex items-center">
                  <Link
                    href={`/category/${cat.slug}`}
                    className={`flex items-center gap-1 hover:text-link-hover transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control ${
                      pathname === `/category/${cat.slug}`
                        ? "text-link font-bold"
                        : "text-body"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {hasChildren && (
                      <ChevronDown
                        size={13}
                        className="text-link transition-transform duration-200 group-hover:rotate-180"
                      />
                    )}
                  </Link>

                  {hasChildren && (
                    <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-0 min-w-[200px] bg-surface shadow-raised border border-line border-t-2 border-t-primary py-1.5 z-50">
                      {children.map((child: Category) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className="block px-4 py-2 text-small text-body hover:bg-surface-2 hover:text-link-hover transition-colors no-underline text-left border-b border-line last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
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

          <span className="text-faint select-none">/</span>
          <div className="group relative h-full flex items-center">
            <Link
              href="/about"
              className={`flex items-center gap-1 hover:text-link-hover transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control ${
                isActive("/about") ? "text-link font-bold" : "text-body"
              }`}
            >
              <span>লেখক প্রসঙ্গে</span>
              <ChevronDown
                size={13}
                className="text-link transition-transform duration-200 group-hover:rotate-180"
              />
            </Link>
            <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-0 min-w-[180px] bg-surface shadow-raised border border-line border-t-2 border-t-primary py-1.5 z-50">
              <Link
                href="/about"
                className="block px-4 py-2 text-small text-body hover:bg-surface-2 hover:text-link-hover transition-colors no-underline text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
              >
                পরিচিতি ও যোগাযোগ
              </Link>
            </div>
          </div>
          </nav>
        </Container>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-page-alt animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1 max-h-[75vh] overflow-y-auto">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className={`flex-1 px-4 py-2.5 rounded-control text-sm font-medium no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 ${
                    isActive("/")
                      ? "text-link bg-primary-soft"
                      : "text-body hover:bg-surface-2"
                  }`}
                >
                  {homeCategoryLabel}
                </Link>
                {systemCategory && homeCategoryChildren.length > 0 && (
                  <button
                    onClick={() => toggleCat(systemCategory.id)}
                    className="p-2.5 text-muted bg-transparent border-none cursor-pointer rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        expandedCats[systemCategory.id] ? "rotate-180 text-link" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
              {systemCategory &&
                homeCategoryChildren.length > 0 &&
                expandedCats[systemCategory.id] && (
                  <div className="flex flex-col pl-4 border-l border-line ml-4">
                    {homeCategoryChildren.map((child: Category) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        className="px-4 py-2 text-sm text-muted no-underline hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                      >
                        ▸ {child.name}
                      </Link>
                    ))}
                  </div>
                )}
            </div>

            {categories
              .filter((c: Category) => !c.parentId && !isSystemCategory(c))
              .map((cat: Category) => {
                const children =
                  cat.children && cat.children.length > 0
                    ? cat.children
                    : categories.filter((c: Category) => c.parentId === cat.id);
                const hasChildren = children.length > 0;
                const isExpanded = expandedCats[cat.id];
                return (
                  <div key={cat.id} className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/category/${cat.slug}`}
                        className="flex-1 px-4 py-2.5 rounded-control text-sm font-medium text-body no-underline hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
                      >
                        {cat.name}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => toggleCat(cat.id)}
                          className="p-2.5 text-muted bg-transparent border-none cursor-pointer rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-link" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {hasChildren && isExpanded && (
                      <div className="flex flex-col pl-4 border-l border-line ml-4">
                        {children.map((child: Category) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.slug}`}
                            className="px-4 py-2 text-sm text-muted no-underline hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
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
              className={`px-4 py-2.5 rounded-control text-sm font-medium no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 ${
                isActive("/about")
                  ? "text-link bg-primary-soft"
                  : "text-body hover:bg-surface-2"
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
